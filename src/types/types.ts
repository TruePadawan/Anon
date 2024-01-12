import { Prisma } from "@prisma/client";

export type Base64 = string | ArrayBuffer;

const publicPostWithAuthor = Prisma.validator<Prisma.PublicPostDefaultArgs>()({
	include: { author: true },
});

export type PublicPostWithAuthor = Prisma.PublicPostGetPayload<
	typeof publicPostWithAuthor
>;

const commentWithAuthor = Prisma.validator<Prisma.CommentDefaultArgs>()({
	include: { author: true },
});

export type CommentWithAuthor = Prisma.CommentGetPayload<
	typeof commentWithAuthor
>;

const groupPostWithAuthor = Prisma.validator<Prisma.GroupPostDefaultArgs>()({
	include: { author: true },
});

export type GroupPostWithAuthor = Prisma.GroupPostGetPayload<
	typeof groupPostWithAuthor
>;

export type PostType = "public" | "group";

const groupMemberWithProfile =
	Prisma.validator<Prisma.GroupMemberDefaultArgs>()({
		include: { user: true },
	});

export type GroupMemberWithProfile = Prisma.GroupMemberGetPayload<
	typeof groupMemberWithProfile
>;
