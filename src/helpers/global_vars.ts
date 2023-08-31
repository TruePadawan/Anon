import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

// tiptap extensions for the post editor
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

// tiptap extensions for the comment editor
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
];
