import { Tooltip } from "@mantine/core";
import Link from "next/link";

export interface NavLinkProps {
	href: string;
	disabled: boolean;
	active: (href: string) => boolean;
	children: React.ReactNode;
}

/**
 * React component representing a navigation link
 */
export default function NavLink(props: NavLinkProps) {
	const { href, disabled, active, children, ...otherProps } = props;

	const linkIsActive = active(href);
	return (
		<>
			{disabled && (
				<Tooltip.Floating label="You need an account!">
					<div
						className="flex-1 flex flex-col items-center gap-1 p-3 bg-primary-color-2 text-gray-500 rounded-md"
						{...otherProps}>
						{children}
					</div>
				</Tooltip.Floating>
			)}
			{!disabled && (
				<Link
					className={`flex flex-col flex-1 items-center gap-1 p-3 bg-primary-color-2 text-accent-color-2-l rounded-md hover:text-white ${
						linkIsActive ? "text-white" : ""
					}`}
					{...otherProps}
					href={href}>
					{children}
				</Link>
			)}
		</>
	);
}
