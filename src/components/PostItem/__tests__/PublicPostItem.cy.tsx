import React from "react";
import PublicPostItem from "../PublicPostItem";
import ResetSWRCache from "@/components/ResetSWRCache";
import { getPublicPostItemProps } from "./test-helpers";

const domElements = {
	menuTarget: "button[data-cy='menu-target']",
	editMenuItem: "[data-cy='edit-menu-item']",
	deleteMenuItem: "[data-cy='delete-menu-item']",
	updateInput: "[data-cy='update-post-editor'] [contenteditable='true']",
	submitUpdateBtn: "button[data-cy='submit-post-update']",
	deleteDialog: "[data-cy='confirm-delete-dialog']",
	confirmDeleteBtn: "[data-cy='delete-post']",
};

describe("<PublicPostItem>: Updates", () => {
	beforeEach(() => {
		cy.intercept("POST", "/api/update-public-post", {
			fixture: "updated-public-post.json",
		}).as("updatePost");
	});

	it("allows updates if user is author and post is not deleted", () => {
		/**
		 * 'Edit' menu item should exist in dropdown menu
		 * - edit input should exist when after menu item is clicked
		 *   but not exist after update is successful
		 * Validate the request body
		 */
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		const props = getPublicPostItemProps();
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, editMenuItem, updateInput, submitUpdateBtn } =
			domElements;
		cy.get(menuTarget).click();
		cy.get(editMenuItem).click();
		cy.get(updateInput).as("updateInput").focus().type("Updated ");
		cy.get(submitUpdateBtn).click();

		cy.fixture("update-post-payload.json").then((payload) => {
			cy.get("@updatePost")
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
		const props = getPublicPostItemProps();
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
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
		const props = getPublicPostItemProps();
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, editMenuItem, updateInput } = domElements;
		cy.get(menuTarget).click();
		cy.get(editMenuItem).should("not.exist");
		cy.get(updateInput).should("not.exist");
	});

	it("doesn't allow updates if post is deleted", () => {
		/**
		 * 'Edit' menu item shouldn't exist in dropdown menu
		 */
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		const props = getPublicPostItemProps();
		props.postData.isDeleted = true;
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
			</ResetSWRCache>
		);

		const { menuTarget, editMenuItem, updateInput } = domElements;
		cy.get(menuTarget).click();
		cy.get(editMenuItem).should("not.exist");
		cy.get(updateInput).should("not.exist");
	});
});

describe("<PublicPostItem>: Deletes", () => {
	beforeEach(() => {
		cy.intercept("POST", "/api/delete-public-post", {
			message: "Post deleted",
		}).as("deletePost");
	});

	it("allows deletes if user is author", () => {
		/**
		 * 'Delete' menu item should exist in dropdown menu
		 * 'Confirm delete' dialog should exist after menu item is clicked
		 * Post ID should be passed to the API endpoint
		 */
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		const props = getPublicPostItemProps();
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
			</ResetSWRCache>
		);
		const { deleteMenuItem, deleteDialog, confirmDeleteBtn, menuTarget } =
			domElements;

		cy.get(menuTarget).click();
		cy.get(deleteMenuItem).click();
		cy.get(deleteDialog).should("exist");
		cy.get(confirmDeleteBtn).click();
		cy.get("@deletePost")
			.its("request.body")
			.should("deep.equal", JSON.stringify({ id: props.postData.id }));
	});

	it("doesn't allow deletes if user is not author", () => {
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile-2.json" });
		const props = getPublicPostItemProps();
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
			</ResetSWRCache>
		);

		cy.get(domElements.menuTarget).click();
		cy.get(domElements.deleteMenuItem).should("not.exist");
		cy.get(domElements.deleteDialog).should("not.exist");
	});

	it("doesn't allow deletes if already deleted", () => {
		cy.intercept("GET", "/api/get-user-profile", { fixture: "profile.json" });
		const props = getPublicPostItemProps();
		props.postData.isDeleted = true;
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
			</ResetSWRCache>
		);
		cy.get(domElements.menuTarget).click();
		cy.get(domElements.deleteMenuItem).should("not.exist");
		cy.get(domElements.deleteDialog).should("not.exist");
	});

	it("doesn't allow deletes if user is not signed-in", () => {
		cy.intercept("GET", "/api/get-user-profile", { user: null });
		const props = getPublicPostItemProps();
		cy.mount(
			<ResetSWRCache>
				<PublicPostItem {...props} />
			</ResetSWRCache>
		);

		cy.get(domElements.menuTarget).click();
		cy.get(domElements.deleteMenuItem).should("not.exist");
		cy.get(domElements.deleteDialog).should("not.exist");
	});
});
