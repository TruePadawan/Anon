import {
	Comment,
	Group,
	GroupSettings,
	Prisma,
	PublicPost,
	UserProfile,
} from "@prisma/client";

export type PublicPostFull = PublicPost & { author: UserProfile };
export type CommentFull = Comment & { author: UserProfile };
export type GroupFull = Group & { settings: GroupSettings };

export type Base64 = string | ArrayBuffer;

const publicPostWithAuthor = Prisma.validator<Prisma.PublicPostArgs>()({
	include: { author: true },
});

export type PublicPostWithAuthor = Prisma.PublicPostGetPayload<
	typeof publicPostWithAuthor
>;
