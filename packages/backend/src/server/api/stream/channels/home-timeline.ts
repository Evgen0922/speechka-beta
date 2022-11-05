import Channel from '../channel.js';
import { Notes } from '@/models/index.js';
import { checkWordMute } from '@/misc/check-word-mute.js';
import { isUserRelated } from '@/misc/is-user-related.js';
import { isInstanceMuted } from '@/misc/is-instance-muted.js';
import { Packed } from '@/misc/schema.js';

export default class extends Channel {
	public readonly chName = 'homeTimeline';
	public static shouldShare = true;
	public static requireCredential = true;

	constructor(id: string, connection: Channel['connection']) {
		super(id, connection);
		this.onNote = this.onNote.bind(this);
	}

	public async init(params: any) {
		// Subscribe events
		this.subscriber.on('notesStream', this.onNote);
	}

	private async onNote(note: Packed<'Note'>) {
		if (note.channelId) {
			if (!this.followingChannels.has(note.channelId)) return;
		} else {
			
			if ((this.user!.id !== note.userId) && !this.following.has(note.userId)) return;
		}

		// Ignore notes from instances the user has muted
		if (isInstanceMuted(note, new Set<string>(this.userProfile?.mutedInstances ?? []))) return;

		if (['followers', 'specified'].includes(note.visibility)) {
			note = await Notes.pack(note.id, this.user!, {
				detail: true,
			});

			if (note.isHidden) {
				return;
			}
		} else {
			
			if (note.replyId != null) {
				note.reply = await Notes.pack(note.replyId, this.user!, {
					detail: true,
				});
			}
			
			if (note.renoteId != null) {
				note.renote = await Notes.pack(note.renoteId, this.user!, {
					detail: true,
				});
			}
		}

		
		if (note.reply && !this.user!.showTimelineReplies) {
			const reply = note.reply;
			
			if (reply.userId !== this.user!.id && note.userId !== this.user!.id && reply.userId !== note.userId) return;
		}

		if (isUserRelated(note, this.muting)) return;
		
		if (isUserRelated(note, this.blocking)) return;

		if (this.userProfile && await checkWordMute(note, this.user, this.userProfile.mutedWords)) return;

		this.connection.cacheNote(note);

		this.send('note', note);
	}

	public dispose() {
		// Unsubscribe events
		this.subscriber.off('notesStream', this.onNote);
	}
}
