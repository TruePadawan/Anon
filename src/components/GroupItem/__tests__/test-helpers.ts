import { MembershipStatus } from "@prisma/client";

export function getGroupItemProps() {
    return {
        id: "64f3991b9817afec59137cea",
        name: "Earth_1",
        desc: "This group is for humans living in Earth_1",
        anonymous: true,
        status: MembershipStatus.JOINED,
    };
}
