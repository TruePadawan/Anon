import { useEffect, useState } from "react";

export type InputValue = string | number | undefined;
type InputValidateFn = (value: InputValue) => Promise<boolean>;
interface UseInputOptions {
	defaultValue?: InputValue;
	transform?: (value: InputValue) => InputValue;
}
/**
    `useInput` hook manages the value of an input element.  
    Using debouncing, it validates the input's value when it changes and keeps track
    of its validation status.  
*/
export default function useInput(
	validate: InputValidateFn,
	options: UseInputOptions
) {
	const [isInputValid, setIsInputValid] = useState(false);
	const [inputValue, setInputValue] = useState(options.defaultValue);
	const [checkingValidity, setCheckingValidity] = useState(false);

	// Apply debouncing to validate input value when it changes
	useEffect(() => {
		setCheckingValidity(true);
		const timeoutID = setTimeout(() => {
			validate(inputValue).then((isValid) => {
				setIsInputValid(isValid);
				setCheckingValidity(false);
			});
		}, 600);
		return () => clearTimeout(timeoutID);
	}, [inputValue, validate]);

	function changeEventHandler(event: React.ChangeEvent<HTMLInputElement>) {
		if (options.transform) {
			setInputValue(options.transform(event.target.value));
		} else {
			setInputValue(event.target.value);
		}
	}

	return {
		inputValue,
		isInputValid,
		changeEventHandler,
		checkingValidity,
	};
}
