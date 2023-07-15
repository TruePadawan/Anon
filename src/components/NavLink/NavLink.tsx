import { Tooltip } from "@mantine/core";
import Link from "next/link";

export interface NavLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string;
	disabled: boolean;
	active: (href: string) => boolean;
	children: React.ReactNode;
}

export default function NavLink(props: NavLinkProps) {
	const { href, disabled, active, children, ...otherProps } = props;

	const linkIsActive = active(href);
	return (
		<>
			{disabled && (
				<Tooltip.Floating label="You need an account!">
					<div className="flex-1">
						<Link
							className={`flex flex-col items-center gap-1 p-3 bg-primary-color-2 text-accent-color-2-l rounded-md ${
								linkIsActive ? "text-white" : ""
							} ${
								disabled
									? "pointer-events-none text-gray-500"
									: "hover:text-white"
							}`}
							{...otherProps}
							href="/">
							{children}
						</Link>
					</div>
				</Tooltip.Floating>
			)}
			{!disabled && (
				<Link
					className={`flex flex-col flex-1 items-center gap-1 p-3 bg-primary-color-2 text-accent-color-2-l rounded-md ${
						linkIsActive ? "text-white" : ""
					} ${
						disabled ? "pointer-events-none text-gray-500" : "hover:text-white"
					}`}
					{...otherProps}
					href="/">
					{children}
				</Link>
			)}
		</>
	);
}
