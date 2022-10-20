import { ref } from 'vue';
import { DriveFile } from 'speechka-js/built/entities';
import * as os from '@/os';
import { stream } from '@/stream';
import { i18n } from '@/i18n';
import { defaultStore } from '@/store';
import { uploadFile } from '@/scripts/upload';

function select(src: any, label: string | null, multiple: boolean): Promise<DriveFile | DriveFile[]> {
	return new Promise((res, rej) => {
		const keepOriginal = ref(defaultStore.state.keepOriginalUploading);

		const chooseFileFromPc = () => {
			const input = document.createElement('input');
			input.type = 'file';
			input.multiple = multiple;
			input.onchange = () => {
				const promises = Array.from(input.files).map(file => uploadFile(file, defaultStore.state.uploadFolder, undefined, keepOriginal.value));

				Promise.all(promises).then(driveFiles => {
					res(multiple ? driveFiles : driveFiles[0]);
				}).catch(err => {
					
				});

				
				(window as any).__speechka_input_ref__ = null;
			};

			
			(window as any).__speechka_input_ref__ = input;

			input.click();
		};

		const chooseFileFromDrive = () => {
			os.selectDriveFile(multiple).then(files => {
				res(files);
			});
		};

		const chooseFileFromUrl = () => {
			os.inputText({
				title: i18n.ts.uploadFromUrl,
				type: 'url',
				placeholder: i18n.ts.uploadFromUrlDescription,
			}).then(({ canceled, result: url }) => {
				if (canceled) return;

				const marker = Math.random().toString(); 
				const connection = stream.useChannel('main');
				connection.on('urlUploadFinished', urlResponse => {
					if (urlResponse.marker === marker) {
						res(multiple ? [urlResponse.file] : urlResponse.file);
						connection.dispose();
					}
				});

				os.api('drive/files/upload-from-url', {
					url: url,
					folderId: defaultStore.state.uploadFolder,
					marker,
				});

				os.alert({
					title: i18n.ts.uploadFromUrlRequested,
					text: i18n.ts.uploadFromUrlMayTakeTime,
				});
			});
		};

		os.popupMenu([label ? {
			text: label,
			type: 'label',
		} : undefined, {
			type: 'switch',
			text: i18n.ts.keepOriginalUploading,
			ref: keepOriginal,
		}, {
			text: i18n.ts.upload,
			icon: 'fas fa-upload',
			action: chooseFileFromPc,
		}, {
			text: i18n.ts.fromDrive,
			icon: 'fas fa-cloud',
			action: chooseFileFromDrive,
		}, {
			text: i18n.ts.fromUrl,
			icon: 'fas fa-link',
			action: chooseFileFromUrl,
		}], src);
	});
}

export function selectFile(src: any, label: string | null = null): Promise<DriveFile> {
	return select(src, label, false) as Promise<DriveFile>;
}

export function selectFiles(src: any, label: string | null = null): Promise<DriveFile[]> {
	return select(src, label, true) as Promise<DriveFile[]>;
}
