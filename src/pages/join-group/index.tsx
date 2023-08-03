import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { Button, TextInput } from "@mantine/core";
import useInput from "@/hooks/useInput";
import React, { useEffect, useState } from "react";

interface PageProps {}

const validateJoinID = async (id: string) => {
	if (id === "") return false;

	const response = await fetch("/api/validate-join-id", {
		method: "POST",
		body: JSON.stringify({
			id,
		}),
	});
	return response.ok;
};

const JoinGroupPage = (props: PageProps) => {
	const {
		changeEventHandler,
		checkingValidity: verifyingID,
		focusEventHandler,
		inputValue: groupJoinId,
		isInputValid: isIdValid,
		inputWasTouched,
	} = useInput(validateJoinID);
	const [formIsValid, setFormIsValid] = useState(() => {
		return !verifyingID && isIdValid;
	});

	useEffect(() => {
		setFormIsValid(!verifyingID && isIdValid);
	}, [verifyingID, isIdValid]);

	function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
	}

	const inputIsInvalid = inputWasTouched && !verifyingID && !isIdValid;
	const inputErrorMessage =
		groupJoinId.length > 0 ? "ID doesn't match a group" : "No ID specified";
	return (
		<>
			<Navbar />
			<main className="grow flex items-center justify-center">
				<form
					className="flex flex-col gap-3 max-w-md w-full"
					onSubmit={formSubmitHandler}>
					<TextInput
						label="Join ID"
						placeholder="00000000-0000-0000-0000-000000000000"
						value={groupJoinId}
						onChange={changeEventHandler}
						onFocus={focusEventHandler}
						error={inputIsInvalid ? inputErrorMessage : ""}
						size="lg"
						withAsterisk
						required
					/>
					<Button
						type="submit"
						color="gray"
						size="md"
						loaderPosition="center"
						loading={verifyingID}
						disabled={!formIsValid}>
						Request access
					</Button>
				</form>
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
	context
) => {
	return {
		props: {},
	};
};

export default JoinGroupPage;
