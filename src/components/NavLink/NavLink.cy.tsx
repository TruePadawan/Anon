import NavLink, { NavLinkProps } from "./NavLink";

describe("<NavLink />", () => {
	const activeLinkProps = {
		href: "/",
		disabled: false,
		active(href: string) {
			return true;
		},
	};
	const inActiveLinkProps = {
		href: "/",
		disabled: false,
		active(href: string) {
			return false;
		},
	};

	it("renders anchor tag which links to href prop", () => {
		cy.mount(
			<NavLink {...activeLinkProps}>
				<span>Hello</span>
			</NavLink>
		);
		cy.get(`a[href='${activeLinkProps.href}']`);
	});

	it("renders children passed as prop and can be clicked", () => {
		const childTestID = "nav-link-child";
		cy.mount(
			<NavLink {...activeLinkProps}>
				<span data-cy={childTestID}>Hello</span>
			</NavLink>
		);
		cy.get(`span[data-cy=${childTestID}]`);
		cy.get(`a[href='${activeLinkProps.href}']`).should(
			"have.css",
			"pointer-events",
			"auto"
		);
	});

	it("prevents clicking when disabled", () => {
		cy.mount(
			<NavLink
				href={activeLinkProps.href}
				active={activeLinkProps.active}
				disabled>
				<span>Hello</span>
			</NavLink>
		);
		cy.get(`a[href='${activeLinkProps.href}']`).should(
			"have.css",
			"pointer-events",
			"none"
		);
	});

	it("has white text only when active", () => {
		cy.mount(
			<NavLink {...activeLinkProps}>
				<span>Hello</span>
			</NavLink>
		);
		cy.get(`a[href='${activeLinkProps.href}']`).should(
			"have.class",
			"text-white"
		);

		cy.mount(
			<NavLink {...inActiveLinkProps}>
				<span>Hello</span>
			</NavLink>
		);
		cy.get(`a[href='${activeLinkProps.href}']`).should(
			"not.have.class",
			"text-white"
		);
	});
});
