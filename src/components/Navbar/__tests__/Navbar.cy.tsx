import React from "react";
import Navbar from "../Navbar";
import * as NextRouter from "next/router";

describe("<Navbar />", () => {
	beforeEach(() => {
		cy.intercept("GET", "/api/get-user-profile", { user: null });
		const push = cy.stub();
		cy.stub(NextRouter, "useRouter").returns({ push, pathname: "/" });
		cy.mount(<Navbar />);
	});

	it("renders application title", () => {
		cy.contains("ANON");
	});

	it("the link to the homepage should be the only active NavLink for unsigned users", () => {
		cy.get("a[data-cy='home-page-link']").should("exist");
		cy.get("a[data-cy='groups-page-link']").should("not.exist");
		cy.get("a[data-cy='join-group-page-link']").should("not.exist");
	});

	it("renders a sign in link if no user is passed", () => {
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		cy.get("a[href='/sign-in']");
	});
});
