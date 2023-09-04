import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

/**
 * Tiptap extensions for the post editor
 */
export const PostEditorExtensions = [
	StarterKit.configure({
		horizontalRule: false,
		dropcursor: false,
		gapcursor: false,
		hardBreak: false,
	}),
	Underline,
	Link,
	TextAlign.configure({ types: ["heading", "paragraph"] }),
	TextStyle,
	Color,
];

/**
 * Tiptap extensions for the comment editor
 */
export const CommentEditorExtensions = [
	StarterKit.configure({
		horizontalRule: false,
		dropcursor: false,
		gapcursor: false,
		hardBreak: false,
		heading: false,
	}),
	Underline,
	Link,
	TextStyle,
	Color,
];

/**
 * Editor content representing a deleted post
 */
export const DELETED_POST_CONTENT = {
	type: "doc",
	content: [
		{
			type: "paragraph",
			attrs: {
				textAlign: "left",
			},
			content: [
				{
					type: "text",
					marks: [
						{
							type: "italic",
						},
						{
							type: "textStyle",
							attrs: {
								color: "#868e96",
							},
						},
					],
					text: "[This post has been deleted]",
				},
			],
		},
	],
};

/**
 * Editor content representing a deleted comment
 */
export const DELETED_COMMENT_CONTENT = {
	type: "doc",
	content: [
		{
			type: "paragraph",
			attrs: {
				textAlign: "left",
			},
			content: [
				{
					type: "text",
					marks: [
						{
							type: "italic",
						},
						{
							type: "textStyle",
							attrs: {
								color: "#868e96",
							},
						},
					],
					text: "[This comment has been deleted]",
				},
			],
		},
	],
};
