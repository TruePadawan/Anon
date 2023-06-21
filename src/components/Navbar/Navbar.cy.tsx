import React from "react";
import Navbar from "./Navbar";

describe("<Navbar />", () => {
	it("renders application title", () => {
		cy.mount(<Navbar />);
		cy.contains("ANON");
	});

	it("renders a dropdown if displayname is passed", () => {
		cy.mount(<Navbar displayName="Hermes Chi"/>);
		cy.get("[data-cy='user-dropdown']");
	});

	it("renders a sign in link if no username is passed", () => {
		cy.mount(<Navbar />);
		cy.get("a[href='/sign_in']");
	});
});
