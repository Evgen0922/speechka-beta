import * as Speechka from 'speechka-js';
import { markRaw } from 'vue';
import { $i } from '@/account';
import { url } from '@/config';

export const stream = markRaw(new Speechka.Stream(url, $i ? {
	token: $i.token,
} : null));
