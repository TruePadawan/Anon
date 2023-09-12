import NavLink from "../NavLink";
import { getNavLinkProps } from "./test-helpers";

describe("<NavLink />", () => {
	const activeProps = getNavLinkProps(true);
	const inActiveProps = getNavLinkProps(false);

	it("renders anchor tag which links to href prop", () => {
		cy.mount(
			<NavLink {...activeProps}>
				<span>Hello</span>
			</NavLink>
		);
		cy.get(`a[href='${activeProps.href}']`);
	});

	it("renders children passed as prop and can be clicked", () => {
		const childTestID = "nav-link-child";
		cy.mount(
			<NavLink {...activeProps}>
				<span data-cy={childTestID}>Hello</span>
			</NavLink>
		);
		cy.get(`span[data-cy=${childTestID}]`);
		cy.get(`a[href='${activeProps.href}']`).should(
			"have.css",
			"pointer-events",
			"auto"
		);
	});

	it("should not render a link when disabled", () => {
		cy.mount(
			<NavLink {...activeProps} data-cy="nav-link" disabled>
				<span>Hello</span>
			</NavLink>
		);
		cy.get(`div[data-cy='nav-link']`);
	});

	it("has white text only when active", () => {
		cy.mount(
			<>
				<NavLink {...activeProps} data-cy="active-nav-link">
					<span>Hello</span>
				</NavLink>
				<NavLink {...inActiveProps} data-cy="inactive-nav-link">
					<span>Hello</span>
				</NavLink>
			</>
		);
		cy.get(`a[data-cy='active-nav-link']`).should("have.class", "text-white");
		cy.get(`a[data-cy='inactive-nav-link']`).should(
			"not.have.class",
			"text-white"
		);
	});
});
