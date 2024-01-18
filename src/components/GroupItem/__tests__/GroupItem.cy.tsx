import React from "react";
import GroupItem from "../GroupItem";
import { getGroupItemProps } from "./test-helpers";

describe("<GroupItem />", () => {
    const props = getGroupItemProps();

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
