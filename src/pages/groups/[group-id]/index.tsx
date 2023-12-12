import Navbar from "@/components/Navbar/Navbar";
import useUser from "@/hooks/useUser";
import GroupLayout from "@/layout/GroupLayout";
import { prisma } from "@/lib/prisma-client";
import { Prisma } from "@prisma/client";
import { GetServerSideProps } from "next";

interface GroupPageProps {
	data: GroupData | null;
}

export default function GroupPage(props: GroupPageProps) {
	const { user } = useUser();

	const currentUserIsAdmin = user?.id === props.data?.admin.id;
	return (
		<>
			<Navbar />
			<GroupLayout
				tabValue="/"
				groupData={props.data}
				currentUserIsAdmin={currentUserIsAdmin}>
				<p className="text-center">POSTS</p>
			</GroupLayout>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	if (!context.params) {
		return {
			redirect: {
				destination: "/groups",
				permanent: false,
			},
		};
	}

	const groupId = context.params["group-id"] as string;
	const groupData = await prisma.group.findUnique({
		where: {
			id: groupId,
		},
		include: {
			admin: true,
			groupMembers: {
				include: {
					user: true,
				},
				take: 20,
				orderBy: {
					joinedAt: "desc",
				},
			},
			_count: {
				select: {
					groupMembers: true,
				},
			},
		},
	});
	return {
		props: {
			data: groupData,
		},
	};
};

// Generated type representing the group data used in this route
const groupData = Prisma.validator<Prisma.GroupDefaultArgs>()({
	include: {
		admin: true,
		groupMembers: {
			include: {
				user: true,
			},
		},
		_count: {
			select: {
				groupMembers: true,
			},
		},
	},
});
export type GroupData = Prisma.GroupGetPayload<typeof groupData>;
