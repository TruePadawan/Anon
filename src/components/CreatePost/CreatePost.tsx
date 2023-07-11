import { Editor } from "@tinymce/tinymce-react";
import { Editor as TinyMCEEditor } from "tinymce";
import { useRef, useState } from "react";
import Button from "../Button/Button";
import { TINYMCE_API_KEY } from "../../../helpers/global-helpers";

interface CreatePostProps {
	anonymous?: boolean;
	className?: string;
	onClick: (content: string, onSubmit: () => void) => void;
}

export default function CreatePost(props: CreatePostProps) {
	const [isSubmittingPost, setIsSubmittingPost] = useState(false);
	const editorRef = useRef<TinyMCEEditor | null>(null);

	function btnClickHandler() {
		setIsSubmittingPost(true);
		const editorContent = editorRef.current?.getContent();
		if (editorContent) {
			props.onClick(editorContent, () => {
				setIsSubmittingPost(false);
				editorRef.current?.resetContent();
			});
		}
	}

	return (
		<div className={`max-w-3xl flex flex-col gap-1 ${props.className || ""}`}>
			<Editor
				apiKey={TINYMCE_API_KEY}
				onInit={(evt, editor) => (editorRef.current = editor)}
				init={{
					readonly: true,
					skin: "oxide-dark",
					content_css: "dark",
					height: 500,
					menubar: false,
					plugins: ["lists", "link", "codesample", "autoresize"],
					toolbar:
						"undo redo | link |" +
						"bold italic forecolor underline strikethrough | alignleft aligncenter " +
						"alignright alignjustify | bullist numlist | codesample",
					statusbar: false,
					autoresize_bottom_margin: 10,
				}}
			/>
			<Button
				onClick={btnClickHandler}
				type="button"
				className="self-end py-2 px-5"
				disabled={isSubmittingPost}>
				{props.anonymous ? "Create anonymous post" : "Create post"}
			</Button>
		</div>
	);
}
