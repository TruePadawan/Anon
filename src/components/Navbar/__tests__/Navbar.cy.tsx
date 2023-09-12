import React from "react";
import Navbar from "../Navbar";
import * as NextRouter from "next/router";

describe("<Navbar />", () => {
	beforeEach(() => {
		const push = cy.stub();
		cy.stub(NextRouter, "useRouter").returns({ push });
	});

	it("renders application title", () => {
		cy.mount(<Navbar />);
		cy.contains("ANON");
	});

	it("shouldn't render the full navbar when no user object is passed", () => {
		cy.mount(<Navbar />);
		cy.get("a[data-cy='home-page-link']").should("not.exist");
		cy.get("a[data-cy='groups-page-link']").should("not.exist");
		cy.get("a[data-cy='join-group-page-link']").should("not.exist");
	});

	it("renders a sign in link if no user is passed", () => {
		cy.mount(<Navbar />);
		cy.get("a[href='/sign-in']");
	});
});
