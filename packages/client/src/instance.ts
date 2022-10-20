import { computed, reactive } from 'vue';
import * as Speechka from 'speechka-js';
import { api } from './os';


const instanceData = localStorage.getItem('instance');


export const instance: Speechka.entities.InstanceMetadata = reactive(instanceData ? JSON.parse(instanceData) : {
	// TODO: set default values
});

export async function fetchInstance() {
	const meta = await api('meta', {
		detail: false
	});

	for (const [k, v] of Object.entries(meta)) {
		instance[k] = v;
	}

	localStorage.setItem('instance', JSON.stringify(instance));
}

export const emojiCategories = computed(() => {
	if (instance.emojis == null) return [];
	const categories = new Set();
	for (const emoji of instance.emojis) {
		categories.add(emoji.category);
	}
	return Array.from(categories);
});

export const emojiTags = computed(() => {
	if (instance.emojis == null) return [];
	const tags = new Set();
	for (const emoji of instance.emojis) {
		for (const tag of emoji.aliases) {
			tags.add(tag);
		}
	}
	return Array.from(tags);
});

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$instance: typeof instance;
	}
}
