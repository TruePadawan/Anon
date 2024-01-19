import { Validator } from "@/hooks/useInput";
import GroupsAPI from "@/lib/api/GroupsAPI";
import { StatusRadioValue } from "@/pages/groups";
import { Group } from "@prisma/client";

export const validateGroupName: Validator = {
    name: "Validate group name",
    async validatorFn(groupName: string) {
        const count = await GroupsAPI.count({
            where: {
                name: {
                    equals: groupName.trim(),
                    mode: "insensitive",
                },
            },
        });
        // group name is valid if there is no group with that name, so count will be 0
        return {
            valid: count === 0,
            message: `${groupName} is taken`,
        };
    },
};

export async function filterGroups(
    userId: string,
    status: StatusRadioValue,
    groupName?: string,
) {
    let groupItems: Group[] = [];

    if (!groupName) {
        groupItems = await GroupsAPI.getMany({
            where: {
                groupMembers: {
                    some: {
                        user: {
                            userId: userId,
                        },
                        membershipStatus: status,
                    },
                },
            },
        });
    } else {
        groupItems = await GroupsAPI.getMany({
            where: {
                groupMembers: {
                    some: {
                        user: {
                            userId: userId,
                        },
                        membershipStatus: status,
                    },
                },
                name: {
                    contains: groupName,
                    mode: "insensitive",
                },
            },
        });
    }
    return groupItems;
}
