type E = { message: string, code: string, id: string, kind?: 'client' | 'server', httpStatusCode?: number };

export class ApiError extends Error {
	public message: string;
	public code: string;
	public id: string;
	public kind: string;
	public httpStatusCode?: number;
	public info?: any;

	constructor(e?: E | null | undefined, info?: any | null | undefined) {
		if (e == null) e = {
			message: 'Произошла внутренняя ошибка. Пожалуйста, повторите попытку позже.',
			code: 'INTERNAL_ERROR',
			id: '5d37dbcb-891e-41ca-a3d6-e690c9777500',
			kind: 'server',
			httpStatusCode: 500,
		};

		super(e.message);
		this.message = e.message;
		this.code = e.code;
		this.id = e.id;
		this.kind = e.kind || 'client';
		this.httpStatusCode = e.httpStatusCode;
		this.info = info;
	}
}
