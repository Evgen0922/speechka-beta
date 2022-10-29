import define from '../../../define.js';
import { ApiError } from '../../../error.js';
import { getNote } from '../../../common/getters.js';
import { PromoNotes } from '@/models/index.js';

export const meta = {
	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	errors: {
		noSuchNote: {
			message: 'Нет такой заметки.',
			code: 'NO_SUCH_NOTE',
			id: 'ee449fbe-af2a-453b-9cae-cf2fe7c895fc',
		},

		// alreadyPromoted: {
		// 	message: 'Заметка уже распространилась!',
		// 	code: 'ALREADY_PROMOTED',
		// 	id: 'ae427aa2-7a41-484f-a18c-2c1104051604',
		// },
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		noteId: { type: 'string', format: 'speechka:id' },
		expiresAt: { type: 'integer' },
	},
	required: ['noteId', 'expiresAt'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const note = await getNote(ps.noteId).catch(e => {
		if (e.id === '9725d0ce-ba28-4dde-95a7-2cbb2c15de24') throw new ApiError(meta.errors.noSuchNote);
		throw e;
	});

	const exist = await PromoNotes.findOneBy({ noteId: note.id });

	if (exist != null) {
		throw new ApiError(meta.errors.alreadyPromoted);
	}

	await PromoNotes.insert({
		noteId: note.id,
		expiresAt: new Date(ps.expiresAt),
		userId: note.userId,
	});
});
