import React from "react";
import ProfileMenu, { ProfileMenuProps } from "./ProfileMenu";

describe("<ProfileMenu />", () => {
	const displayName = "Hermes Chi";

	beforeEach(() => {
		const profileClickHandler = cy.stub().as("profile-click-handler");
		const signoutHandler = cy.stub().as("signout-handler");
		const props: ProfileMenuProps = {
			displayName,
			onProfileMenuItemClicked: profileClickHandler,
			onSignoutMenuItemClicked: signoutHandler,
		};
		cy.mount(<ProfileMenu {...props} />);
	});

	it("renders user displayname", () => {
		cy.contains(displayName);
	});

	it("click handler functions are called", () => {
		cy.get("[data-cy='profile-dropdown-btn']").click();
		cy.get("[data-cy='profile-menu-item']").click();
		
		cy.get("[data-cy='profile-dropdown-btn']").click();
		cy.get("[data-cy='signout-menu-item']").click();

		cy.get("@profile-click-handler").should("be.calledOnce");
		cy.get("@signout-handler").should("be.calledOnce");
	});
});
