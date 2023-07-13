import { PublicPost, UserProfile } from "@prisma/client";

export type PublicPostFull = PublicPost & { author: UserProfile };
