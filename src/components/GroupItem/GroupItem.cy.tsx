import React from "react";
import GroupItem from "./GroupItem";

describe("<GroupItem />", () => {
	const props = {
		id: "1234",
		name: "Earth_1",
		desc: "This group is for humans living in Earth_1",
		anonymous: true,
	};

	beforeEach(() => {
		cy.mount(<GroupItem {...props} />);
	});

	it("renders an anchor tag that links to its group page", () => {
		cy.get(`a[href='/groups/${props.id}']`);
	});

	it("renders the name of the group", () => {
		cy.contains(props.name).and("be.visible");
	});

	it("renders the description of the group which can be toggled", () => {
		cy.contains(props.desc).and("not.be.visible");
		cy.get("[data-cy='toggle-desc']").click();
		cy.contains(props.desc).and("be.visible");

		// toggle off
		cy.get("[data-cy='toggle-desc']").click();
		cy.contains(props.desc).and("not.be.visible");
	});

	it("renders the type of the group", () => {
		const groupType = props.anonymous ? "ANON" : "PUBLIC";
		cy.contains(groupType).and("be.visible");
	});
});
