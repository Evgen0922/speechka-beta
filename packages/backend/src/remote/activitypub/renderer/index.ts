import config from '@/config/index.js';
import { v4 as uuid } from 'uuid';
import { IActivity } from '../type.js';
import { LdSignature } from '../misc/ld-signature.js';
import { getUserKeypair } from '@/misc/keypair-store.js';
import { User } from '@/models/entities/user.js';

export const renderActivity = (x: any): IActivity | null => {
	if (x == null) return null;

	if (typeof x === 'object' && x.id == null) {
		x.id = `${config.url}/${uuid()}`;
	}

	return Object.assign({
		'@context': [
			'https://www.w3.org/ns/activitystreams',
			'https://w3id.org/security/v1',
			{
				// as non-standards
				manuallyApprovesFollowers: 'as:manuallyApprovesFollowers',
				sensitive: 'as:sensitive',
				Hashtag: 'as:Hashtag',
				quoteUrl: 'as:quoteUrl',
				// Mastodon
				toot: 'http://joinmastodon.org/ns#',
				Emoji: 'toot:Emoji',
				featured: 'toot:featured',
				discoverable: 'toot:discoverable',
				// schema
				schema: 'http://schema.org#',
				PropertyValue: 'schema:PropertyValue',
				value: 'schema:value',
				
				speechka: 'https://github.com/Evgen0922/speechka_develop',
				'_speechka_content': 'speechka:_speechka_content',
				'_speechka_quote': 'speechka:_speechka_quote',
				'_speechka_reaction': 'speechka:_speechka_reaction',
				'_speechka_votes': 'speechka:_speechka_votes',
				'_speechka_talk': 'speechka:_speechka_talk',
				'isCat': 'speechka:isCat',
				// vcard
				vcard: 'http://www.w3.org/2006/vcard/ns#',
			},
		],
	}, x);
};

export const attachLdSignature = async (activity: any, user: { id: User['id']; host: null; }): Promise<IActivity | null> => {
	if (activity == null) return null;

	const keypair = await getUserKeypair(user.id);

	const ldSignature = new LdSignature();
	ldSignature.debug = false;
	activity = await ldSignature.signRsaSignature2017(activity, keypair.privateKey, `${config.url}/users/${user.id}#main-key`);

	return activity;
};
