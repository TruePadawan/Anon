import { classNames } from "@/helpers/global_helpers";
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
        "flex flex-col flex-1 items-center gap-1 bg-primary-color-2 rounded-md basis-32 shrink-0 p-2 sm:p-3";
    const disabledLinkClasses = classNames(defaultStyles, "text-gray-500");
    const enabledLinkClasses = classNames(
        defaultStyles,
        "text-accent-color-2-l hover:text-white",
        "hover:bg-primary-color-2-l",
        "active:bg-secondary-color",
        active && "text-white",
    );
    return (
        <>
            {disabled && (
                <Tooltip.Floating label="You need an account!">
                    <div className={disabledLinkClasses} {...otherProps}>
                        {children}
                    </div>
                </Tooltip.Floating>
            )}
            {!disabled && (
                <Link
                    className={enabledLinkClasses}
                    {...otherProps}
                    href={href}
                >
                    {children}
                </Link>
            )}
        </>
    );
}
