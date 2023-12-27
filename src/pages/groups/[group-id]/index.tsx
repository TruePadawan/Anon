import PostEditor from "@/components/Editor/PostEditor";
import Navbar from "@/components/Navbar/Navbar";
import { PostEditorExtensions } from "@/helpers/global_vars";
import useUser from "@/hooks/useUser";
import useGroupPosts from "@/hooks/useGroupPosts";
import GroupLayout from "@/layout/GroupLayout";
import { getErrorMessage } from "@/lib/error-message";
import { prisma } from "@/lib/prisma-client";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Prisma } from "@prisma/client";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import { GetServerSideProps } from "next";
import { useState } from "react";

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
	const { createGroupPosts } = useGroupPosts(props.data.id, {
		where: {
			isDeleted: false,
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 10,
	});
	const [isSubmittingPost, setIsSubmittingPost] = useState(false);

	async function handlePostSubmit() {
		if (editor === null) {
			notifications.show({
				color: "red",
				title: "Cannot get post content",
				message: "Editor is not initialized",
			});
			return;
		}

		const editorNotEmpty =
			!editor.isEmpty && editor.getText().trim().length !== 0;

		if (editorNotEmpty) {
			setIsSubmittingPost(true);
			// prevent user from typing in the editor while submitting a post
			editor.setEditable(false);
			try {
				await createGroupPosts(editor.getJSON());
				editor.commands.clearContent();
			} catch (error) {
				notifications.show({
					color: "red",
					title: "Post submission failed",
					message: getErrorMessage(error),
				});
			}
			setIsSubmittingPost(false);
			editor.setEditable(true);
		} else {
			notifications.show({
				color: "orange",
				title: "Post submission failed",
				message: "Post content cannot be empty or just whitespace",
			});
		}
	}

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
						<Button
							color="gray"
							size="md"
							className="w-full"
							onClick={handlePostSubmit}
							disabled={isSubmittingPost}>
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
