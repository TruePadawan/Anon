import { Prisma } from "@prisma/client";

export type Base64 = string | ArrayBuffer;

const publicPostWithAuthor = Prisma.validator<Prisma.PublicPostArgs>()({
	include: { author: true },
});

export type PublicPostWithAuthor = Prisma.PublicPostGetPayload<
	typeof publicPostWithAuthor
>;

const commentWithAuthor = Prisma.validator<Prisma.CommentArgs>()({
	include: { author: true },
});

export type CommentWithAuthor = Prisma.CommentGetPayload<
	typeof commentWithAuthor
>;

const groupWithSettings = Prisma.validator<Prisma.GroupArgs>()({
	include: { settings: true },
});

export type GroupWithSettings = Prisma.GroupGetPayload<
	typeof groupWithSettings
>;
