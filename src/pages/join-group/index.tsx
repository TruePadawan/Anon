import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { UserProfile } from "@prisma/client";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma-client";
import { Button, TextInput } from "@mantine/core";
import useInput from "@/hooks/useInput";
import { useEffect, useState } from "react";

interface PageProps {
	user: UserProfile | null;
}

const validateJoinID = async (id: string) => {
	// const response = await fetch("/api/validate-join-id", {
	// 	method: "POST",
	// 	body: JSON.stringify({
	// 		id,
	// 	}),
	// });
	// return response.ok;
	return false;
};

const JoinGroupPage = ({ user }: PageProps) => {
	const {
		changeEventHandler,
		checkingValidity: verifyingID,
		inputValue: groupJoinId,
		isInputValid: isIdValid,
	} = useInput(validateJoinID);
	const [formIsValid, setFormIsValid] = useState(() => {
		return !verifyingID && isIdValid;
	});

	useEffect(() => {
		setFormIsValid(!verifyingID && isIdValid);
	}, [verifyingID, isIdValid]);

	return (
		<>
			<Navbar user={user} />
			<main className="grow flex items-center justify-center">
				<form className="flex flex-col gap-3 max-w-md w-full">
					<TextInput
						label="Join ID"
						placeholder="00000000-0000-0000-0000-000000000000"
						value={groupJoinId}
						onChange={changeEventHandler}
						error={!isIdValid ? "ID doesn't match a group" : ""}
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
