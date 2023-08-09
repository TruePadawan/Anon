import React, { useEffect, useRef, useState } from "react";

/**
    * `useInput` hook manages the value of an input element.  
    Using debouncing, it validates the input's value when it changes and keeps track
    of its validation status.  
    * @param validators - an array of validator functions
    * @param options - extra options for useInput hook like an initial value and a transform function
*/
export default function useInput(
	validators: UseInputParams["validators"],
	options?: UseInputParams["options"]
) {
	const [value, setValue] = useState(options?.initialValue ?? "");
	const [isValidating, setIsValidating] = useState(false);
	const [isValid, setIsValid] = useState(Boolean(options?.initialValueIsValid));
	const [wasTouched, setWasTouched] = useState(false);
	const [errorMessages, setErrorMessages] = useState<string[]>([]);
	const validatorsRef = useRef(validators);

	// validation process
	useEffect(() => {
		if (wasTouched) {
			setIsValidating(true);
			setErrorMessages([]);
			const timeoutID = setTimeout(() => {
				runValidationProcess(value, validatorsRef.current).then((result) => {
					setIsValid(result.valid);
					if (!result.valid) {
						setErrorMessages(result.errorMessages);
					}
					setIsValidating(false);
				});
			}, 600);
			return () => clearTimeout(timeoutID);
		}
	}, [wasTouched, value]);

	function onChange(ev: React.ChangeEvent<HTMLInputElement>) {
		setIsValid(false);
		const newValue = ev.currentTarget.value;
		updateValue(newValue);
	}

	function onFocus(ev: React.FocusEvent<HTMLInputElement>) {
		setWasTouched(true);
	}

	function updateValue(value: string) {
		if (options?.transform) {
			setValue(options.transform(value));
		} else {
			setValue(value);
		}
		setWasTouched(true);
	}

	const hasError =
		errorMessages.length !== 0 || (wasTouched && !isValidating && !isValid);
	return {
		value,
		wasTouched,
		isValidating,
		isValid,
		errorMessages,
		errorMessage: errorMessages.join(),
		hasError,
		changeEvHandler: onChange,
		focusEvHandler: onFocus,
		updateValue,
	};
}

async function runValidationProcess(
	value: string,
	validators: UseInputParams["validators"]
) {
	if (value.trim() === "") {
		return {
			valid: false,
			errorMessages: ["Input is empty"],
		};
	}

	const messages: string[] = [];
	for (let i = 0; i < validators.length; ++i) {
		const { validatorFn, name } = validators[i];
		try {
			const { valid, message } = await validatorFn(value);
			if (!valid) {
				const errorMessage: string = message ?? `'${name}' validator failed`;
				messages.unshift(errorMessage);
			}
		} catch (error: any) {
			messages.unshift(error.message ?? `'${name}' validator threw an error`);
		}
	}
	return {
		valid: messages.length === 0,
		errorMessages: messages,
	};
}

interface UseInputParams {
	validators: Validator[];
	options?: {
		initialValue?: string;
		initialValueIsValid?: boolean;
		transform?: (value: string) => string;
	};
}

export interface Validator {
	name: string;
	validatorFn: (value: string) => Promise<ValidationFnReturnValue>;
}

interface ValidationFnReturnValue {
	valid: boolean;
	message?: string;
}
