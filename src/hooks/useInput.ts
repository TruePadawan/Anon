import { useEffect, useState } from "react";

export type InputValidateFnType = (...args: any[]) => Promise<boolean>;
export type InputDefaultValueType = string | number;

/**
    `useInput` hook manages the value of an input element.  
    Using debouncing, it validates the input's value when it changes and keeps track
    of its validation status.  
*/
export default function useInput(
	validate: InputValidateFnType,
	defaultValue: InputDefaultValueType = ""
) {
	const [isInputValid, setIsInputValid] = useState(false);
	const [inputValue, setInputValue] = useState(defaultValue);
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
		setInputValue(event.target.value);
	}

	return {
		inputValue,
		isInputValid,
		changeEventHandler,
		checkingValidity,
	};
}
