import { Comment, PublicPost, UserProfile } from "@prisma/client";

export type PublicPostFull = PublicPost & { author: UserProfile };
export type CommentFull = Comment & { author: UserProfile };
