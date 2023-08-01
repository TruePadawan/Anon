import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { UserProfile } from "@prisma/client";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma-client";
import { Button, TextInput } from "@mantine/core";
import useInput from "@/hooks/useInput";
import React, { useEffect, useState } from "react";

interface PageProps {
	user: UserProfile | null;
}

const validateJoinID = async (id: string) => {
	const response = await fetch("/api/validate-join-id", {
		method: "POST",
		body: JSON.stringify({
			id,
		}),
	});
	return response.ok;
};

const JoinGroupPage = ({ user }: PageProps) => {
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
			<Navbar user={user} />
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
	const session = await getServerSession(context.req, context.res, authOptions);

	if (session) {
		// get current signed in user
		const user = await prisma.userProfile.findUnique({
			where: {
				id: session.user.id,
			},
		});
		return {
			props: { user },
		};
	}
	return {
		props: { user: null },
	};
};

export default JoinGroupPage;
