import InputField from "./InputField";
import { InputFieldProps } from "./InputField";

describe("<InputField />", () => {
	const props: InputFieldProps = {
		label: "Username",
		type: "text",
		inputElementID: "test-input",
	};

	it("renders label correctly", () => {
		cy.mount(<InputField {...props} />);
		cy.get("label").contains(props.label);
	});

	it("should accept className prop which changes styling", () => {
		cy.mount(<InputField {...props} className="hidden" />);
		cy.get("label").should("not.be.visible");
		cy.get("input").should("not.be.visible");
	});

	it("should accept prop which sets ID of input element", () => {
		cy.mount(<InputField {...props} />);
		cy.get(`input[id='${props.inputElementID}']`);
	});

	it("input should focus when label is clicked", () => {
		cy.mount(<InputField {...props} />);
		cy.get("label").click();
		cy.get("input").should("be.focused");
	});

	it("should accept HTML Input Element props", () => {
		cy.mount(<InputField {...props} readOnly />);
		cy.get("input[readonly]");
	});
});
