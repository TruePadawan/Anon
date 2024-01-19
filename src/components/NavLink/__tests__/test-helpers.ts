import { NavLinkProps } from "../NavLink";

export function getNavLinkProps(
    isActive: boolean,
): Omit<NavLinkProps, "children"> {
    const activeLinkProps = {
        href: "/somewhere",
        disabled: false,
        active: true,
        "data-cy": "active-nav",
    };
    const inActiveLinkProps = {
        href: "/",
        disabled: false,
        active: false,
        "data-cy": "inactive-nav",
    };
    return isActive ? activeLinkProps : inActiveLinkProps;
}
