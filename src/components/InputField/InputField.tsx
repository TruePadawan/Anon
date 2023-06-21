import { HTMLInputTypeAttribute } from "react";

interface InputFieldProps extends React.HTMLProps<HTMLInputElement> {
	label: string;
	type: HTMLInputTypeAttribute;
	componentID: string;
}

export default function InputField(props: InputFieldProps) {
	const { label, componentID, type, ...extraProps } = props;
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={componentID} className="text-xl">
				{label}
			</label>
			<input
				className="p-0.5 rounded h-8 bg-accent-color-2 shadow-input-shadow text-primary-color-1 font-normal"
				id={componentID}
				type={type}
				{...extraProps}
			/>
		</div>
	);
}
