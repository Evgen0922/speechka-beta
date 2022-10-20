import * as speechka from 'speechka-js';
import * as Acct from 'speechka-js/built/acct';
import { url } from '@/config';

export const acct = (user: speechka.Acct) => {
	return Acct.toString(user);
};

export const userName = (user: speechka.entities.User) => {
	return user.name || user.username;
};

export const userPage = (user: speechka.Acct, path?, absolute = false) => {
	return `${absolute ? url : ''}/@${acct(user)}${(path ? `/${path}` : '')}`;
};
