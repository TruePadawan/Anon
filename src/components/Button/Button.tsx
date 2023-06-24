import React from "react";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
	icon?: React.ReactNode;
}
export default function Button(props: ButtonProps) {
	const { icon, className, children, ...extraProps } = props;
	const componentClassName = `p-1.5 font-semibold text-base bg-accent-color-1 rounded text-white flex justify-center items-center hover:bg-accent-color-1-l ${
		className || ""
	}`;
	if (icon) {
		return (
			<button className={componentClassName} {...extraProps}>
				{icon}
				<span className="ml-1.5">{children}</span>
			</button>
		);
	}
	return (
		<button className={componentClassName} {...extraProps}>
			{children}
		</button>
	);
}
