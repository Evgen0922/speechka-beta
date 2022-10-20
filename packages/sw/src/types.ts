import * as Speechka from 'speechka-js';

export type swMessageOrderType = 'post' | 'push';

export type SwMessage = {
	type: 'order';
	order: swMessageOrderType;
	loginId: string;
	url: string;
	[x: string]: any;
};


type pushNotificationDataSourceMap = {
	notification: Speechka.entities.Notification;
	unreadMessagingMessage: Speechka.entities.MessagingMessage;
	readNotifications: { notificationIds: string[] };
	readAllNotifications: undefined;
	readAllMessagingMessages: undefined;
	readAllMessagingMessagesOfARoom: { userId: string } | { groupId: string };
};

export type pushNotificationData<K extends keyof pushNotificationDataSourceMap> = {
	type: K;
	body: pushNotificationDataSourceMap[K];
	userId: string;
	dateTime: number;
};

export type pushNotificationDataMap = {
	[K in keyof pushNotificationDataSourceMap]: pushNotificationData<K>;
};
