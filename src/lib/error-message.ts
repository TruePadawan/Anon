// Errors are weird in TypeScript so I'm using this suggestion by Kent C Dodds
// https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript

type ErrorWithMessage = {
	message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
	return (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof (error as Record<string, unknown>).message === "string"
	);
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
	if (isErrorWithMessage(maybeError)) return maybeError;

	try {
		return new Error(JSON.stringify(maybeError));
	} catch {
		// fallback in case there's an error stringifying the maybeError
		// like with circular references for example.
		return new Error(String(maybeError));
	}
}

/**
 * Extracts out the error message out of an error-like object
 * @param error the error-like object
 * @returns error message
 */
export function getErrorMessage(error: unknown) {
	return toErrorWithMessage(error).message;
}
