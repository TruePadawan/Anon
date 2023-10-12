import Navbar from "@/components/Navbar/Navbar";
import GroupLayout from "@/layout/GroupLayout";
import { prisma } from "@/lib/prisma-client";
import { Group } from "@prisma/client";
import { GetServerSideProps } from "next";

interface GroupPageProps {
	data: Pick<Group, "name" | "id"> | null;
}

export default function GroupPage(props: GroupPageProps) {
	return (
		<>
			<Navbar />
			<GroupLayout tabValue="/" groupData={props.data}>
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
	});
	return {
		props: {
			data: groupData,
		},
	};
};
