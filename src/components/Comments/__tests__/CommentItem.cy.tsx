import React from "react";
import CommentItem from "../CommentItem";
import { commentItemProps } from "./test-helpers";
import ResetSWRCache from "@/components/ResetSWRCache";

beforeEach(() => {
	cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
	cy.intercept("POST", "/api/create-comment", { fixture: "comment.json" });
});

describe.skip("<CommentItem />: Replies", () => {
	it("allows replies if there is a signed-in user and comment is not deleted", () => {
		/**
		 * 'Reply' menu item should exist in the dropdown menu
		 * 	- It should show the reply editor when it is clicked
		 * 	- reply input should not be shown after reply is submitted
		 */

		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...commentItemProps} />
			</ResetSWRCache>
		);

		cy.get("button[data-cy='menu-target']").click();
		cy.get("[data-cy='reply-menu-item']").click();
		cy.get("[data-cy='reply-editor'] [contenteditable='true']")
			.as("replyEditor")
			.focus()
			.type("Hello");
		cy.get("button[data-cy='submit-reply']").click();
		cy.get("@replyEditor").should("not.exist");
	});

	it("doesn't allow replies if no signed-in user", () => {
		/**
		 * 'Reply' menu item should not exist in the dropdown menu
		 */

		cy.intercept("GET", "/api/get-user-profile", { user: null });
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...commentItemProps} />
			</ResetSWRCache>
		);

		cy.get("button[data-cy='menu-target']").click();
		cy.get("[data-cy='reply-menu-item']").should("not.exist");
	});

	it("doesn't allow replies if comment is deleted", () => {
		// Check that 'Reply' menu item doesn't exist in the dropdown menu

		const props = commentItemProps;
		props.data.isDeleted = true;
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		cy.get("button[data-cy='menu-target']").click();
		cy.get("[data-cy='reply-menu-item']").should("not.exist");
		cy.get("[data-cy='edit-menu-item']").should("not.exist");
		cy.get("[data-cy='delete-menu-item']").should("not.exist");
	});
});

describe("<CommentItem>: Updates", () => {
	beforeEach(() => {
		cy.intercept("POST", "/api/update-comment", {
			fixture: "updated-comment.json",
		}).as("updateComment");
	});

	it("allows updates if user is author and comment is not deleted", () => {
		/**
		 * 'Edit' menu item should exist
		 * - edit input should exist when after menu item is clicked
		 *   but not exist after update is successful
		 * Validate the request body
		 */
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...commentItemProps} />
			</ResetSWRCache>
		);

		cy.get("[data-cy='edit-menu-item']").should("not.exist");
		cy.get("button[data-cy='menu-target']").click();
		cy.get("[data-cy='edit-menu-item']").click();
		cy.get("[data-cy='update-editor'] [contenteditable='true']")
			.as("updateEditor")
			.focus()
			.type("Updated");
		cy.get("button[data-cy='submit-update']").click();
		
		cy.fixture("update-comment-payload.json").then((payload) => {
			cy.get("@updateComment")
				.its("request.body")
				.should("deep.equal", JSON.stringify(payload));
		});
		cy.get("@updateEditor").should("not.exist");
	});

	it.skip("doesn't allow updates if user is not author");
	it.skip("doesn't allow updates if no user");
	it.skip("doesn't allow updates if comment is deleted");
});

describe.skip("<CommentItem>: Deletes", () => {});
