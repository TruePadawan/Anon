import { useEditor } from "@tiptap/react";
import { CommentEditorExtensions } from "../../../helpers/global-helpers";
import CommentEditor from "../Editor/CommentEditor";
import { useMemo, useState } from "react";
import CommentItem from "./CommentItem";
import { UserProfile } from "@prisma/client";

interface CommentsProps {
	commentGroupID: string;
	currentUser: UserProfile | null;
	commentsAllowed: boolean;
	initialCommentsCount?: number;
	showOnlyCommentsCount?: boolean;
}

export default function Comments(props: CommentsProps) {
	const editor = useEditor({
		extensions: CommentEditorExtensions,
	});
	const [commentIDs, setCommentIDs] = useState([]);
	const { commentGroupID, currentUser, initialCommentsCount = 5 } = props;

	// use swr to fetch for comments

	const comments = useMemo(() => {
		return commentIDs.map((id) => <CommentItem key={id} id={id} />);
	}, [commentIDs]);

	const commentsCount = commentIDs.length;
	if (props.showOnlyCommentsCount) {
		return (
			<p className="w-full text-center font-semibold">{`${commentsCount} comment${
				commentsCount === 1 ? "" : "s"
			}`}</p>
		);
	}
	return (
		<div className="w-full flex flex-col gap-2">
			{props.commentsAllowed && <CommentEditor editor={editor} />}
			<ul>{comments}</ul>
		</div>
	);
}
