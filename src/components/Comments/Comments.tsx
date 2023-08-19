import { useEditor } from "@tiptap/react";
import { CommentEditorExtensions } from "@/helpers/global_vars";
import CommentEditor from "../Editor/CommentEditor";
import { useState, useEffect, useRef } from "react";
import CommentItem from "./CommentItem";
import { Button, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import useSWRInfinite from "swr/infinite";
import useUser from "@/hooks/useUser";
import CommentsAPI, {
	CommentAPIGetManyParams,
	CommentFull,
} from "@/lib/api/CommentsAPI";

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
	const [commentsData, setCommentsData] = useState<CommentFull[]>([]);
	const [creatingComment, setCreatingComment] = useState(false);
	const [noMoreComments, setNoMoreComments] = useState(false);
	const { commentGroupId, commentsPerRequest = 20 } = props;
	const dbQueryParamsRef = useRef<CommentAPIGetManyParams>({
		take: commentsPerRequest,
		where: {
			commentGroupId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	// use swr to fetch for comments
	const {
		data: rawCommentsData,
		isLoading,
		isValidating,
		error,
		setSize,
	} = useSWRInfinite((index, prevData?: SWRInfiniteData) => {
		const atEnd = prevData?.comments.length === 0;
		if (atEnd) {
			setNoMoreComments(true);
			return null;
		}

		if (index === 0) {
			return dbQueryParamsRef.current;
		}

		return {
			...dbQueryParamsRef.current,
			skip: 1,
			cursor: prevData?.nextCursor,
		};
	}, fetchCommentsData);

	// flatten and get the comments data from what useSWRInfinite returns
	useEffect(() => {
		if (!isLoading && rawCommentsData) {
			setCommentsData(
				rawCommentsData.flatMap((rawComment) => rawComment.comments)
			);
		}
	}, [isLoading, rawCommentsData]);

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
			commentGroupId,
			content: editor.getJSON(),
			authorId: currentUser.id,
		};
	}

	async function createComment() {
		setCreatingComment(true);
		editor?.setEditable(false);
		try {
			const data = getCommentObject();
			const newComment = await CommentsAPI.create(data);
			setCommentsData((commentsData) => [newComment, ...commentsData]);

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
					<ul className="list-none flex flex-col gap-1">
						{commentsData.map((data) => (
							<CommentItem key={data.id} data={data} showReplyCount />
						))}
					</ul>
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

interface SWRInfiniteData {
	comments: CommentFull[];
	nextCursor: {
		id?: string;
	};
}

async function fetchCommentsData(params: CommentAPIGetManyParams) {
	const comments = await CommentsAPI.getMany(params);
	return {
		comments,
		nextCursor: {
			id: comments.at(-1)?.id,
		},
	};
}
