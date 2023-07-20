import { useEditor } from "@tiptap/react";
import { CommentEditorExtensions } from "../../../helpers/global-helpers";
import CommentEditor from "../Editor/CommentEditor";
import { useMemo, useState } from "react";
import CommentItem from "./CommentItem";
import { UserProfile } from "@prisma/client";

interface CommentsProps {
	commentGroupID: string;
	currentUser: UserProfile | null;
	initialCommentsCount?: number;
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

	return (
		<div className="w-full flex flex-col gap-2">
			{currentUser && <CommentEditor editor={editor} />}
			<ul>{comments}</ul>
		</div>
	);
}
