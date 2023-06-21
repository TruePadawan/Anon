import React from "react";
import Button from "./Button";

describe("<Button />", () => {
	it("renders", () => {
		cy.mount(<Button>a button</Button>);
	});

	it("shows text passed through props", () => {
		const btnText = "Sign In";
		cy.mount(<Button>{btnText}</Button>);
		cy.contains(btnText);
	});
});
