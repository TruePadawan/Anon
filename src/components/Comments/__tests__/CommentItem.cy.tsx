import React from "react";
import CommentItem from "../CommentItem";
import { getCommentItemProps } from "./test-helpers";
import ResetSWRCache from "@/components/ResetSWRCache";

const domElements = {
	menuTarget: "button[data-cy='menu-target']",
	editMenuItem: "[data-cy='edit-menu-item']",
	replyMenuItem: "[data-cy='reply-menu-item']",
	deleteMenuItem: "[data-cy='delete-menu-item']",
	replyInput: "[data-cy='reply-editor'] [contenteditable='true']",
	updateInput: "[data-cy='update-editor'] [contenteditable='true']",
	submitReplyBtn: "button[data-cy='submit-reply']",
	submitUpdateBtn: "button[data-cy='submit-update']",
};

describe.skip("<CommentItem />: Replies", () => {
	beforeEach(() => {
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		cy.intercept("POST", "/api/create-comment", { fixture: "comment.json" });
	});

	it("allows replies if there is a signed-in user and comment is not deleted", () => {
		/**
		 * 'Reply' menu item should exist in the dropdown menu
		 * 	- It should show the reply editor when it is clicked
		 * 	- reply input should not be shown after reply is submitted
		 */
		const props = getCommentItemProps();
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, replyMenuItem, replyInput, submitReplyBtn } =
			domElements;
		cy.get(menuTarget).click();
		cy.get(replyMenuItem).click();
		cy.get(replyInput).as("replyInput").focus().type("Hello");
		cy.get(submitReplyBtn).click();
		cy.get("@replyInput").should("not.exist");
	});

	it("doesn't allow replies if no signed-in user", () => {
		/**
		 * 'Reply' menu item should not exist in the dropdown menu
		 */
		cy.intercept("GET", "/api/get-user-profile", { user: null });
		const props = getCommentItemProps();
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, replyMenuItem } = domElements;
		cy.get(menuTarget).click();
		cy.get(replyMenuItem).should("not.exist");
	});

	it("doesn't allow replies if comment is deleted", () => {
		// Check that 'Reply' menu item doesn't exist in the dropdown menu
		const props = getCommentItemProps();
		props.data.isDeleted = true;
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, replyMenuItem, editMenuItem, deleteMenuItem } =
			domElements;
		cy.get(menuTarget).click();
		cy.get(replyMenuItem).should("not.exist");
		cy.get(editMenuItem).should("not.exist");
		cy.get(deleteMenuItem).should("not.exist");
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
		 * 'Edit' menu item should exist in dropdown menu
		 * - edit input should exist when after menu item is clicked
		 *   but not exist after update is successful
		 * Validate the request body
		 */
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		const props = getCommentItemProps();
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, editMenuItem, updateInput, submitUpdateBtn } =
			domElements;
		cy.get(menuTarget).click();
		cy.get(editMenuItem).click();
		cy.get(updateInput).as("updateInput").focus().type("Updated");
		cy.get(submitUpdateBtn).click();

		cy.fixture("update-comment-payload.json").then((payload) => {
			cy.get("@updateComment")
				.its("request.body")
				.should("deep.equal", JSON.stringify(payload));
		});
		cy.get("@updateInput").should("not.exist");
	});

	it("doesn't allow updates if user is not author", () => {
		/**
		 * 'Edit' menu item shouldn't exist in dropdown menu
		 */
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile-2.json" });
		const props = getCommentItemProps();
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, editMenuItem, updateInput } = domElements;
		cy.get(menuTarget).click();
		cy.get(editMenuItem).should("not.exist");
		cy.get(updateInput).should("not.exist");
	});

	it("doesn't allow updates if no signed-in user", () => {
		/**
		 * 'Edit' menu item shouldn't exist in dropdown menu
		 */
		cy.intercept("GET", "/api/get-user-profile", { user: null });
		const props = getCommentItemProps();
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, editMenuItem, updateInput } = domElements;
		cy.get(menuTarget).click();
		cy.get(editMenuItem).should("not.exist");
		cy.get(updateInput).should("not.exist");
	});

	it("doesn't allow updates if comment is deleted", () => {
		/**
		 * 'Edit' menu item shouldn't exist in dropdown menu
		 */
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		const props = getCommentItemProps();
		props.data.isDeleted = true;
		cy.mount(
			<ResetSWRCache>
				<CommentItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, editMenuItem, updateInput } = domElements;
		cy.get(menuTarget).click();
		cy.get(editMenuItem).should("not.exist");
		cy.get(updateInput).should("not.exist");
	});
});

describe.skip("<CommentItem>: Deletes", () => {});
