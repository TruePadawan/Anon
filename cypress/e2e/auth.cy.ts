describe("Signin page", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.get("a[href='/sign_in']").as("sign-in-link");
	});

	it("there is a link to sign in page on index page when user is not signed in", () => {
		cy.get("@sign-in-link");
	});

	it("focuses on email input when user visits sign in page", () => {
		cy.get("@sign-in-link").click();
		cy.get("input[data-cy='signin-email-input']").should("have.focus");
	});

	it("signin page should have a form for signin in and a button for submitting form", () => {
		cy.get("@sign-in-link").click();
		cy.get("form[data-cy='signin-form']").as("signin-form");
		cy.get("@signin-form")
			.get("button[type='submit']")
			.should("not.be.disabled");
	});
});

describe("Protected pages", () => {
	it("unauthenticated users should only be able to visit signin and public posts page", () => {
		cy.visit("/groups");
		cy.url().should("contain", "/signin");

		cy.visit("/join_group");
		cy.url().should("contain", "/signin");

		cy.visit("/user/123");
		cy.url().should("contain", "/signin");

		cy.visit("/groups/123");
		cy.url().should("contain", "/signin");
	});
});