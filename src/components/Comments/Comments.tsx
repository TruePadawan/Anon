import { useEditor } from "@tiptap/react";
import { CommentEditorExtensions } from "@/helpers/global_vars";
import CommentEditor from "../Editor/CommentEditor";
import { useEffect, useRef, useState } from "react";
import CommentItem from "./CommentItem";
import { Button, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import useUser from "@/hooks/useUser";
import useComments from "@/hooks/useComments";
import { getErrorMessage } from "@/lib/error-message";
import { useIntersection } from "@mantine/hooks";

interface CommentsProps {
	commentGroupId: string;
	commentsAllowed: boolean;
	commentsPerRequest?: number;
}

export default function Comments(props: CommentsProps) {
	const { user: currentUser } = useUser();
	const editor = useEditor({
		extensions: CommentEditorExtensions,
	});
	const [creatingComment, setCreatingComment] = useState(false);
	const { commentGroupId, commentsPerRequest = 20 } = props;
	const { commentsData, isLoading, createComment, loadMoreComments } =
		useComments({
			where: {
				commentGroupId,
				parentComment: {
					is: null,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			take: commentsPerRequest,
		});
	const intersectionRootElRef = useRef(null);
	const { entry, ref: infiniteScrollTriggerElRef } = useIntersection({
		threshold: 0.25,
	});
	const loadMoreCommentsRef = useRef(loadMoreComments);

	// load more posts when the second to last post is in view
	useEffect(() => {
		const timeoutID = setTimeout(() => {
			if (entry?.isIntersecting) {
				loadMoreCommentsRef.current();
			}
		}, 800);
		return () => clearTimeout(timeoutID);
	}, [entry?.isIntersecting]);

	async function handleCommentSubmit() {
		if (editor === null) {
			notifications.show({
				color: "red",
				title: "Cannot get comment content",
				message: "Editor not initialized",
			});
			return;
		}
		setCreatingComment(true);
		editor?.setEditable(false);

		try {
			const noComment = editor.isEmpty || editor.getText().trim().length === 0;
			if (noComment) {
				throw new Error("A comment can't be empty or just whitespace");
			}
			await createComment(editor.getJSON(), commentGroupId);
			// clear comment editor after comment is created
			editor?.commands.clearContent();
		} catch (error) {
			console.error(error);
			notifications.show({
				color: "red",
				title: "Failed to create comment",
				message: getErrorMessage(error),
			});
		}

		setCreatingComment(false);
		editor?.setEditable(true);
	}

	const showEditor = currentUser && props.commentsAllowed;
	return (
		<div className="w-full flex flex-col gap-2" ref={intersectionRootElRef}>
			{isLoading && (
				<Loader className="mx-auto mt-3" color="gray" variant="bars" />
			)}
			{!isLoading && (
				<>
					{showEditor && (
						<div>
							<CommentEditor editor={editor} />
							<Button
								type="button"
								className="mt-1 w-full"
								size="md"
								color="gray"
								onClick={handleCommentSubmit}
								disabled={creatingComment}>
								Post comment
							</Button>
						</div>
					)}
					<ul className="list-none flex flex-col gap-1">
						{commentsData.map((data, index) => {
							const secondToLast = index === commentsData.length - 2;
							return (
								<CommentItem
									ref={secondToLast ? infiniteScrollTriggerElRef : null}
									key={data.id}
									data={data}
									showReplyCount
								/>
							);
						})}
					</ul>
				</>
			)}
		</div>
	);
}
