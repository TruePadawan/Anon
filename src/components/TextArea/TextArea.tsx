import { TextareaAutosize, TextareaAutosizeProps } from "@mui/material";

export interface TextAreaProps extends TextareaAutosizeProps {
	label: string;
	textareaID: string;
}

export default function TextArea(props: TextAreaProps) {
	const { label, textareaID, className = "", ...extraProps } = props;

	return (
		<div className={`flex flex-col gap-1 ${className}`}>
			<label htmlFor={textareaID} className="text-xl font-light">
				{label}
			</label>
			<TextareaAutosize
				id={textareaID}
				className="p-0.5 rounded h-8 bg-accent-color-2 shadow-input-shadow text-primary-color-1 font-semibold read-only:text-primary-color-2-l"
				minRows={4}
				{...extraProps}
			/>
		</div>
	);
}
