import { useEditor } from "@tiptap/react";
import { CommentEditorExtensions } from "@/helpers/global_vars";
import CommentEditor from "../Editor/CommentEditor";
import { useState, useEffect } from "react";
import CommentItem from "./CommentItem";
import { Button, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import useSWRInfinite from "swr/infinite";
import useUser from "@/hooks/useUser";

interface CommentsProps {
	commentGroupID: string;
	commentsAllowed: boolean;
	commentsPerRequest?: number;
}

interface CommentID {
	id: string;
}
const fetcher = async (key: string): Promise<CommentID[]> => {
	const response = await fetch(key);
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message);
	}
	const comments = await response.json();
	return comments;
};

export default function Comments(props: CommentsProps) {
	const { user: currentUser } = useUser();
	const editor = useEditor({
		extensions: CommentEditorExtensions,
	});
	const [commentIDs, setCommentIDs] = useState<CommentID[]>([]);
	const [creatingComment, setCreatingComment] = useState(false);
	const [noMoreComments, setNoMoreComments] = useState(false);
	const { commentGroupID, commentsPerRequest = 20 } = props;

	// use swr to fetch for comments
	const { data, isLoading, isValidating, error, setSize } = useSWRInfinite(
		(index: number, previousComments?: CommentID[]) => {
			if (previousComments && previousComments.length === 0) {
				setNoMoreComments(true);
				return null;
			}
			if (index === 0)
				return `/api/get-comment-ids?groupId=${commentGroupID}&limit=${commentsPerRequest}`;
			const cursor = previousComments?.at(-1)?.id as string;
			return `/api/get-comment-ids?groupId=${commentGroupID}&cursor=${cursor}&limit=${commentsPerRequest}`;
		},
		fetcher
	);

	useEffect(() => {
		if (!isLoading && data) {
			setCommentIDs(data.flat());
		}
	}, [isLoading, data]);

	function getCommentObject() {
		if (editor === null) {
			throw new Error("Failed to initialize editor");
		} else if (!currentUser) {
			throw new Error("Unsigned user can't make comments");
		}

		const invalidComment =
			editor.isEmpty || editor.getText().trim().length === 0;

		if (invalidComment) {
			throw new Error("A comment can't be empty or just whitespace");
		}
		return {
			commentGroupId: commentGroupID,
			content: editor.getJSON(),
			authorId: currentUser.id,
			createdAt: Date.now(),
		};
	}

	async function createComment() {
		setCreatingComment(true);
		editor?.setEditable(false);
		try {
			const comment = getCommentObject();
			const response = await fetch("/api/create-comment", {
				method: "POST",
				body: JSON.stringify(comment),
			});
			const responseBody = await response.json();
			if (!response.ok) {
				throw new Error(responseBody.message);
			}
			const newCommentID: CommentID = { id: responseBody.commentID };
			setCommentIDs((IDs) => [newCommentID, ...IDs]);

			// clear comment editor after comment is created
			editor?.commands.clearContent();
		} catch (error: any) {
			console.error(error);
			notifications.show({
				color: "red",
				title: "Failed to create comment",
				message: error.message,
			});
		}
		setCreatingComment(false);
		editor?.setEditable(true);
	}

	if (error) {
		console.error(error);
		notifications.show({
			color: "red",
			title: "Error",
			message: error.message,
		});
	}

	const comments = commentIDs.map(({ id }) => <CommentItem key={id} id={id} />);
	const showEditor = currentUser && props.commentsAllowed;
	return (
		<div className="w-full flex flex-col gap-2">
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
								onClick={createComment}
								disabled={creatingComment}>
								Post comment
							</Button>
						</div>
					)}
					<ul className="list-none flex flex-col gap-1">{comments}</ul>
					{!noMoreComments && (
						<Button
							type="button"
							variant="light"
							color="gray"
							onClick={() => setSize((_size) => _size + 1)}
							loaderPosition="center"
							loading={isValidating}>
							Load more comments
						</Button>
					)}
					{noMoreComments && (
						<p className="text-sm text-center mt-2">All comments loaded</p>
					)}
				</>
			)}
		</div>
	);
}
