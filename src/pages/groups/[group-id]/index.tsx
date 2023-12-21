import PostEditor from "@/components/Editor/PostEditor";
import Navbar from "@/components/Navbar/Navbar";
import { PostEditorExtensions } from "@/helpers/global_vars";
import useUser from "@/hooks/useUser";
import GroupLayout from "@/layout/GroupLayout";
import { prisma } from "@/lib/prisma-client";
import { Button } from "@mantine/core";
import { Prisma } from "@prisma/client";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { GetServerSideProps } from "next";

interface GroupPageProps {
	data: GroupData | null;
}

export default function GroupPage(props: GroupPageProps) {
	const { user } = useUser();
	const editor = useEditor({
		extensions: [
			...PostEditorExtensions,
			Placeholder.configure({ placeholder: "Share your thoughts" }),
		],
	});

	const currentUserIsAdmin = user?.id === props.data?.admin.id;
	return (
		<>
			<Navbar />
			<GroupLayout
				tabValue="/"
				groupData={props.data}
				currentUserIsAdmin={currentUserIsAdmin}>
				<div className="mx-auto w-full max-w-4xl">
					<div className="flex flex-col gap-2">
						<PostEditor editor={editor} />
						<Button color="gray" size="md" className="w-full">
							Create post
						</Button>
					</div>
				</div>
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
