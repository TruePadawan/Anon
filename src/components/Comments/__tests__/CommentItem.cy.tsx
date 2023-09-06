import React from "react";
import CommentItem from "../CommentItem";
import { commentItemProps } from "./test-helpers";

/**
 * It allows replies if there is a signed-in user and comment is not deleted
 *  - 'Reply' menu item should exist
 *  - It should the end-point for creating a comment when reply is submitted
 * It does not allow replies if comment is deleted
 * It allows edits and deletes when user is author and comment is not deleted
 *  - Check that it shows the confirm delete dialog
 *  - Check that it calls the API endpoints for updates and deletes
 */

describe("<CommentItem />", () => {
	it("renders", () => {
		cy.mount(<CommentItem {...commentItemProps} />);
	});

	it("allows replies if there is a signed-in user and comment is not deleted", () => {
		// intercept GET requests to /get-user-profile endpoint and return a generic profile data
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		cy.mount(<CommentItem {...commentItemProps} />);

		cy.get("button[data-cy='menu-target']").click();
		cy.get("[data-cy='reply-menu-item']").click();
		cy.get("[data-cy='reply-editor'] [contenteditable='true']")
			.as("replyEditor")
			.focus()
			.type("Hello");

		cy.intercept("POST", "/api/create-comment", { fixture: "comment.json" });
		cy.get("button[data-cy='submit-reply']").click();

		cy.get("@replyEditor").should("not.exist");
	});

	it.skip("does not allow replies if comment is deleted", () => {});
});
