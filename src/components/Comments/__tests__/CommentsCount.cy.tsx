import ResetSWRCache from "@/components/ResetSWRCache";
import CommentsCount, { ReplyCount } from "../CommentsCount";
import { getCommentsCountProps, getReplyCountProps } from "./test-helpers";

describe("<CommentsCount />", () => {
	it("renders the number of comments", () => {
		const COUNT = 2;
		cy.intercept("POST", "/api/get-comments-count", { count: COUNT });
		const props = getCommentsCountProps();
		cy.mount(
			<ResetSWRCache>
				<CommentsCount {...props} />
			</ResetSWRCache>
		);

		cy.contains(`Comments (${COUNT})`);
	});
});

describe("<ReplyCount />", () => {
	it("renders the number of replies", () => {
		const COUNT = 4;
		const { commentId } = getReplyCountProps();
		cy.intercept("GET", `/api/get-reply-count/${commentId}`, { count: COUNT });
		cy.mount(
			<ResetSWRCache>
				<ReplyCount commentId={commentId} />
			</ResetSWRCache>
		);

		cy.contains(`Replies (${COUNT})`);
	});
});
