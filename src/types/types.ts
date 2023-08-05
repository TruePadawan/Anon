import {
	Comment,
	Group,
	GroupSettings,
	PublicPost,
	UserProfile,
} from "@prisma/client";

export type PublicPostFull = PublicPost & { author: UserProfile };
export type CommentFull = Comment & { author: UserProfile };
export type GroupFull = Group & { settings: GroupSettings };
