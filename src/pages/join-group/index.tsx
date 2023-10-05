import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { Button, Text, TextInput } from "@mantine/core";
import useInput from "@/hooks/useInput";
import React, { useEffect, useState } from "react";
import { validateGroupJoinId } from "@/helpers/join-group";
import GroupsAPI from "@/lib/api/GroupsAPI";
import { notifications } from "@mantine/notifications";
import { getErrorMessage } from "@/lib/error-message";

const JoinGroupPage = () => {
	const {
		isValidating,
		isValid,
		value: joinId,
		changeEvHandler,
		focusEvHandler,
		hasError,
		errorMessage,
	} = useInput([validateGroupJoinId]);
	const [formIsValid, setFormIsValid] = useState(!isValidating && isValid);
	const [membershipStatus, setMembershipStatus] = useState("");

	useEffect(() => {
		setFormIsValid(!isValidating && isValid);
	}, [isValidating, isValid]);

	async function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		try {
			const result = await GroupsAPI.joinGroup(joinId);
			setMembershipStatus(result.status);
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to send join request",
				message: getErrorMessage(error),
			});
		}
	}

	const showMembershipStatus = Boolean(membershipStatus);
	const color = getStatusColor(membershipStatus);
	return (
		<>
			<Navbar />
			<main className="grow flex flex-col gap-2 items-center justify-center">
				<form
					className="flex flex-col gap-3 max-w-md w-full"
					onSubmit={formSubmitHandler}>
					<TextInput
						label="Join ID"
						placeholder="00000000-0000-0000-0000-000000000000"
						value={joinId}
						onChange={changeEvHandler}
						onFocus={focusEvHandler}
						error={hasError ? errorMessage : ""}
						size="lg"
						spellCheck={false}
						withAsterisk
						required
					/>
					<Button
						type="submit"
						color="gray"
						size="md"
						loaderPosition="center"
						loading={isValidating}
						disabled={!formIsValid}>
						Request access
					</Button>
				</form>
				{showMembershipStatus && (
					<p>
						Request result -{" "}
						<Text className="inline font-bold" c={color}>
							{membershipStatus}
						</Text>
					</p>
				)}
			</main>
		</>
	);
};

function getStatusColor(status: string) {
	let color = "";
	switch (status) {
		case "BANNED":
			color = "red";
			break;
		case "JOINED":
			color = "green";
			break;
		case "PENDING":
			color = "yellow";
			break;
	}
	return color;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {},
	};
};

export default JoinGroupPage;
