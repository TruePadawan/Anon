import React from "react";
import Navbar from "./Navbar";
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

	it("renders a dropdown if user object is passed", () => {
		const user = {
			displayName: "Hermes Chi",
			accountName: "hermeschi",
		};
		cy.mount(<Navbar user={user} />);
		cy.get("[data-cy='profile-dropdown']");
	});

	it("renders a sign in link if no user is passed", () => {
		cy.mount(<Navbar />);
		cy.get("a[href='/sign_in']");
	});
});
