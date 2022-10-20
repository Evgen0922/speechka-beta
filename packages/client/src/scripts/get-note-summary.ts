import * as speechka from 'speechka-js';
import { i18n } from '@/i18n';

/**
 * 
 * @param {*} note 
 */
export const getNoteSummary = (note: speechka.entities.Note): string => {
	if (note.deletedAt) {
		return `(${i18n.ts.deletedNote})`;
	}

	if (note.isHidden) {
		return `(${i18n.ts.invisibleNote})`;
	}

	let summary = '';

	
	if (note.cw != null) {
		summary += note.cw;
	} else {
		summary += note.text ? note.text : '';
	}


	if ((note.files || []).length !== 0) {
		summary += ` (${i18n.t('withNFiles', { n: note.files.length })})`;
	}

	
	if (note.poll) {
		summary += ` (${i18n.ts.poll})`;
	}

	
	if (note.replyId) {
		if (note.reply) {
			summary += `\n\nRE: ${getNoteSummary(note.reply)}`;
		} else {
			summary += '\n\nRE: ...';
		}
	}

	
	if (note.renoteId) {
		if (note.renote) {
			summary += `\n\nRN: ${getNoteSummary(note.renote)}`;
		} else {
			summary += '\n\nRN: ...';
		}
	}

	return summary.trim();
};
