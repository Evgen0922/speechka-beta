import { performance } from 'perf_hooks';
import Koa from 'koa';
import { CacheableLocalUser, User } from '@/models/entities/user.js';
import { AccessToken } from '@/models/entities/access-token.js';
import { getIpHash } from '@/misc/get-ip-hash.js';
import { limiter } from './limiter.js';
import endpoints, { IEndpointMeta } from './endpoints.js';
import { ApiError } from './error.js';
import { apiLogger } from './logger.js';

const accessDenied = {
	message: 'Ошибка доступа!',
	code: 'ACCESS_DENIED',
	id: '56f35758-7dd5-468b-8439-5d6fb8ec9b8e',
};

export default async (endpoint: string, user: CacheableLocalUser | null | undefined, token: AccessToken | null | undefined, data: any, ctx?: Koa.Context) => {
	const isSecure = user != null && token == null;
	const isModerator = user != null && (user.isModerator || user.isAdmin);

	const ep = endpoints.find(e => e.name === endpoint);

	if (ep == null) {
		throw new ApiError({
			message: 'Нет конечной точки.',
			code: 'NO_SUCH_ENDPOINT',
			id: 'f8080b67-5f9c-4eb7-8c18-7f1eeae8f709',
			httpStatusCode: 404,
		});
	}

	if (ep.meta.secure && !isSecure) {
		throw new ApiError(accessDenied);
	}

	if (ep.meta.limit) {
		// koa will automatically load the `X-Forwarded-For` header if `proxy: true` is configured in the app.
		let limitActor: string;
		if (user) {
			limitActor = user.id;
		} else {
			limitActor = getIpHash(ctx!.ip);
		}

		const limit = Object.assign({}, ep.meta.limit);

		if (!limit.key) {
			limit.key = ep.name;
		}

		// Rate limit
		await limiter(limit as IEndpointMeta['limit'] & { key: NonNullable<string> }, limitActor).catch(e => {
			throw new ApiError({
				message: 'Сервер перегружен. Пожалуйста, повторите попытку позже.',
				code: 'SERVER_ERROR',
				id: 'd5826d14-3982-4d2e-8011-b9e9f0249429',
				httpStatusCode: 429,
			});
		});
	}

	if (ep.meta.requireCredential && user == null) {
		throw new ApiError({
			message: 'Требуются учетные данные.',
			code: 'CREDENTIAL_REQUIRED',
			id: '1384574d-a912-4b81-8601-c7b1c4085401',
			httpStatusCode: 401,
		});
	}

	if (ep.meta.requireCredential && user!.isSuspended) {
		throw new ApiError({
			message: 'Ваша учетная запись была заблокирована.',
			code: 'YOUR_ACCOUNT_SUSPENDED',
			id: 'a8c724b3-6e9c-4b46-b1a8-bc3ed6258370',
			httpStatusCode: 403,
		});
	}

	if (ep.meta.requireAdmin && !user!.isAdmin) {
		throw new ApiError(accessDenied, { reason: 'Вы не администратор' });
	}

	if (ep.meta.requireModerator && !isModerator) {
		throw new ApiError(accessDenied, { reason: 'Вы не модератор.' });
	}

	if (token && ep.meta.kind && !token.permission.some(p => p === ep.meta.kind)) {
		throw new ApiError({
			message: 'Приложение не имеет необходимых разрешений для использования.',
			code: 'PERMISSION_DENIED',
			id: '1370e5b7-d4eb-4566-bb1d-7748ee6a1838',
		});
	}

	// Cast non JSON input
	if ((ep.meta.requireFile || ctx?.method === 'GET') && ep.params.properties) {
		for (const k of Object.keys(ep.params.properties)) {
			const param = ep.params.properties![k];
			if (['boolean', 'number', 'integer'].includes(param.type ?? '') && typeof data[k] === 'string') {
				try {
					data[k] = JSON.parse(data[k]);
				} catch (e) {
					throw	new ApiError({
						message: 'Недопустимый параметр.',
						code: 'INVALID_PARAM',
						id: '3d81ceae-475f-4600-b2a8-2bc116157400',
					}, {
						param: k,
						reason: `cannot cast to ${param.type}`,
					});
				}
			}
		}
	}

	// API invoking
	const before = performance.now();
	return await ep.exec(data, user, token, ctx?.file, ctx?.ip, ctx?.headers).catch((e: Error) => {
		if (e instanceof ApiError) {
			throw e;
		} else {
			apiLogger.error(`Internal error occurred in ${ep.name}: ${e.message}`, {
				ep: ep.name,
				ps: data,
				e: {
					message: e.message,
					code: e.name,
					stack: e.stack,
				},
			});
			throw new ApiError(null, {
				e: {
					message: e.message,
					code: e.name,
					stack: e.stack,
				},
			});
		}
	}).finally(() => {
		const after = performance.now();
		const time = after - before;
		if (time > 1000) {
			apiLogger.warn(`SLOW API CALL DETECTED: ${ep.name} (${time}ms)`);
		}
	});
};
