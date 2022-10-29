import { Pages, PageLikes } from '@/models/index.js';
import { genId } from '@/misc/gen-id.js';
import define from '../../define.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['pages'],

	requireCredential: true,

	kind: 'write:page-likes',

	errors: {
		noSuchPage: {
			message: 'Нет такой страницы.',
			code: 'NO_SUCH_PAGE',
			id: 'cc98a8a2-0dc3-4123-b198-62c71df18ed3',
		},

		yourPage: {
			message: 'Вы не можете оценить свою страницу.',
			code: 'YOUR_PAGE',
			id: '28800466-e6db-40f2-8fae-bf9e82aa92b8',
		},

		alreadyLiked: {
			message: 'На страницу уже была дана ссылка.',
			code: 'ALREADY_LIKED',
			id: 'cc98a8a2-0dc3-4123-b198-62c71df18ed3',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		pageId: { type: 'string', format: 'speechka:id' },
	},
	required: ['pageId'],
} as const;

// eslint-disable-next-line import/no-default-export
export default define(meta, paramDef, async (ps, user) => {
	const page = await Pages.findOneBy({ id: ps.pageId });
	if (page == null) {
		throw new ApiError(meta.errors.noSuchPage);
	}

	if (page.userId === user.id) {
		throw new ApiError(meta.errors.yourPage);
	}

	// if already liked
	const exist = await PageLikes.findOneBy({
		pageId: page.id,
		userId: user.id,
	});

	if (exist != null) {
		throw new ApiError(meta.errors.alreadyLiked);
	}

	// Create like
	await PageLikes.insert({
		id: genId(),
		createdAt: new Date(),
		pageId: page.id,
		userId: user.id,
	});

	Pages.increment({ id: page.id }, 'likedCount', 1);
});
