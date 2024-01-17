import { Tooltip } from "@mantine/core";
import Link from "next/link";

export interface NavLinkProps {
    href: string;
    disabled: boolean;
    active: boolean;
    children: React.ReactNode;
}

/**
 * React component representing a navigation link
 */
export default function NavLink(props: NavLinkProps) {
    const { href, disabled, active, children, ...otherProps } = props;

    const defaultStyles =
        "flex flex-col flex-1 items-center gap-1 p-3 bg-primary-color-2 rounded-md basis-48 shrink-0";
    return (
        <>
            {disabled && (
                <Tooltip.Floating label="You need an account!">
                    <div
                        className={`${defaultStyles} text-gray-500`}
                        {...otherProps}
                    >
                        {children}
                    </div>
                </Tooltip.Floating>
            )}
            {!disabled && (
                <Link
                    className={`${defaultStyles} rounded-md text-accent-color-2-l hover:text-white ${
                        active ? "text-white" : ""
                    }`}
                    {...otherProps}
                    href={href}
                >
                    {children}
                </Link>
            )}
        </>
    );
}
