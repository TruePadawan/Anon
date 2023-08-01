import NavLink, { NavLinkProps } from "./NavLink";

describe("<NavLink />", () => {
	const activeLinkProps = {
		href: "/somewhere",
		disabled: false,
		active(href: string) {
			return true;
		},
		"data-cy": "active-nav",
	};
	const inActiveLinkProps = {
		href: "/",
		disabled: false,
		active(href: string) {
			return false;
		},
		"data-cy": "inactive-nav",
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

	it("should not render a link when disabled", () => {
		cy.mount(
			<NavLink {...activeLinkProps} disabled={true}>
				<span>Hello</span>
			</NavLink>
		);
		cy.get(`div[data-cy='${activeLinkProps["data-cy"]}']`);
	});

	it("has white text only when active", () => {
		cy.mount(
			<>
				<NavLink {...activeLinkProps}>
					<span>Hello</span>
				</NavLink>
				<NavLink {...inActiveLinkProps}>
					<span>Hello</span>
				</NavLink>
			</>
		);
		cy.get(`a[data-cy='${activeLinkProps["data-cy"]}']`).should(
			"have.class",
			"text-white"
		);
		cy.get(`a[data-cy='${inActiveLinkProps["data-cy"]}']`).should(
			"not.have.class",
			"text-white"
		);
	});
});
