describe("Signin page", () => {
	beforeEach(() => {
		cy.visit("/");
		cy.get("a[href='/sign-in']").as("sign-in-link");
	});

	it("there is a link to sign in page on index page when user is not signed in", () => {
		cy.get("@sign-in-link");
	});
});

describe("Protected pages", () => {
	it("unauthenticated users should only be able to visit signin and public posts page", () => {
		cy.visit("/groups");
		cy.url().should("contain", "/no-access");

		cy.visit("/join-group");
		cy.url().should("contain", "/no-access");

		cy.visit("/groups/123");
		cy.url().should("contain", "/no-access");
	});
});
