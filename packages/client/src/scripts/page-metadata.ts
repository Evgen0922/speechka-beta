import * as speechka from 'speechka-js';
import { ComputedRef, inject, isRef, onActivated, onMounted, provide, ref, Ref } from 'vue';

export const setPageMetadata = Symbol('setPageMetadata');
export const pageMetadataProvider = Symbol('pageMetadataProvider');

export type PageMetadata = {
	title: string;
	subtitle?: string;
	icon?: string | null;
	avatar?: speechka.entities.User | null;
	userName?: speechka.entities.User | null;
	bg?: string;
};

export function definePageMetadata(metadata: PageMetadata | null | Ref<PageMetadata | null> | ComputedRef<PageMetadata | null>): void {
	const _metadata = isRef(metadata) ? metadata : ref(metadata);

	provide(pageMetadataProvider, _metadata);

	const set = inject(setPageMetadata) as any;
	if (set) {
		set(_metadata);

		onMounted(() => {
			set(_metadata);
		});

		onActivated(() => {
			set(_metadata);
		});
	}
}

export function provideMetadataReceiver(callback: (info: ComputedRef<PageMetadata>) => void): void {
	provide(setPageMetadata, callback);
}

export function injectPageMetadata(): PageMetadata | undefined {
	return inject(pageMetadataProvider);
}
