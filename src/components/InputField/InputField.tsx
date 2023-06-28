import { HTMLInputTypeAttribute } from "react";

interface InputFieldProps extends React.HTMLProps<HTMLInputElement> {
	label: string;
	type: HTMLInputTypeAttribute;
	inputElementID: string;
}

export default function InputField(props: InputFieldProps) {
	const { label, inputElementID, type, ...extraProps } = props;
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={inputElementID} className="text-xl font-light">
				{label}
			</label>
			<input
				className="p-0.5 rounded h-8 bg-accent-color-2 shadow-input-shadow text-primary-color-1 font-normal"
				id={inputElementID}
				type={type}
				{...extraProps}
			/>
		</div>
	);
}
