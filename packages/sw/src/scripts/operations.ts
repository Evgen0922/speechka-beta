
declare var self: ServiceWorkerGlobalScope;

import * as Speechka from 'speechka-js';
import { SwMessage, swMessageOrderType } from '@/types';
import { acct as getAcct } from '@/filters/user';
import { getAccountFromId } from '@/scripts/get-account-from-id';
import { getUrlWithLoginId } from '@/scripts/login-id';

export const cli = new Speechka.api.APIClient({ origin, fetch: (...args) => fetch(...args) });

export async function api<E extends keyof Speechka.Endpoints>(endpoint: E, userId: string, options?: Speechka.Endpoints[E]['req']) {
	const account = await getAccountFromId(userId);
	if (!account) return;

	return cli.request(endpoint, options, account.token);
}

export function openUser(acct: string, loginId: string) {
	return openClient('push', `/@${acct}`, loginId, { acct });
}

export function openNote(noteId: string, loginId: string) {
	return openClient('push', `/notes/${noteId}`, loginId, { noteId });
}

export async function openChat(body: any, loginId: string) {
	if (body.groupId === null) {
		return openClient('push', `/my/messaging/${getAcct(body.user)}`, loginId, { body });
	} else {
		return openClient('push', `/my/messaging/group/${body.groupId}`, loginId, { body });
	}
}


export async function openPost(options: any, loginId: string) {
	
	let url = `/share?`;
	if (options.initialText) url += `text=${options.initialText}&`;
	if (options.reply) url += `replyId=${options.reply.id}&`;
	if (options.renote) url += `renoteId=${options.renote.id}&`;

	return openClient('post', url, loginId, { options });
}

export async function openClient(order: swMessageOrderType, url: string, loginId: string, query: any = {}) {
	const client = await findClient();

	if (client) {
		client.postMessage({ type: 'order', ...query, order, loginId, url } as SwMessage);
		return client;
	}

	return self.clients.openWindow(getUrlWithLoginId(url, loginId));
}

export async function findClient() {
	const clients = await self.clients.matchAll({
		type: 'window'
	});
	for (const c of clients) {
		if (c.url.indexOf('?zen') < 0) return c;
	}
	return null;
}
