import TextArea from "./TextArea";
import { TextAreaProps } from "./TextArea";

describe("<TextArea />", () => {
	const props: TextAreaProps = {
		label: "Bio",
		textareaID: "test-textarea",
	};

	it("renders label correctly", () => {
		cy.mount(<TextArea {...props} />);
		cy.get("label").contains(props.label);
	});

	it("should accept className prop which changes styling", () => {
		cy.mount(<TextArea {...props} className="hidden" />);
		cy.get("label").should("not.be.visible");
		cy.get("textarea").should("not.be.visible");
	});

	it("should accept prop which sets ID of textarea element", () => {
		cy.mount(<TextArea {...props} />);
		cy.get(`textarea[id='${props.textareaID}']`);
	});

	it("textarea should focus when label is clicked", () => {
		cy.mount(<TextArea {...props} />);
		cy.get("label").click();
		cy.get("textarea").should("be.focused");
	});

	it("should accept HTML Input Element props", () => {
		cy.mount(<TextArea {...props} readOnly />);
		cy.get("textarea[readonly]");
	});
});
