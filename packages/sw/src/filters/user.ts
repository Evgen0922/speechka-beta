import * as speechka from 'speechka-js';
import * as Acct from 'speechka-js/built/acct';

export const acct = (user: speechka.Acct) => {
	return Acct.toString(user);
};

export const userName = (user: speechka.entities.User) => {
	return user.name || user.username;
};

export const userPage = (user: speechka.Acct, path?, absolute = false) => {
	return `${absolute ? origin : ''}/@${acct(user)}${(path ? `/${path}` : '')}`;
};
