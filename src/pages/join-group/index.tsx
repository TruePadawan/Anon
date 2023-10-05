import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { Button, TextInput } from "@mantine/core";
import useInput from "@/hooks/useInput";
import React, { useEffect, useState } from "react";
import { validateGroupJoinId } from "@/helpers/join-group";
import GroupsAPI, { JoinGroupResult } from "@/lib/api/GroupsAPI";
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
	const [joinRequestResult, setJoinRequestResult] = useState<JoinGroupResult>();
	const [requestingAccess, setRequestingAccess] = useState(false);

	useEffect(() => {
		setFormIsValid(!isValidating && isValid);
		setJoinRequestResult(undefined);
	}, [isValidating, isValid]);

	async function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
		try {
			setRequestingAccess(true);
			const result = await GroupsAPI.joinGroup(joinId);
			setJoinRequestResult(result);
		} catch (error) {
			notifications.show({
				color: "red",
				title: "Failed to send join request",
				message: getErrorMessage(error),
			});
		}
		setRequestingAccess(false);
	}

	const showResult = joinRequestResult !== undefined;
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
						loading={requestingAccess}
						disabled={!formIsValid || isValidating}>
						Request access
					</Button>
				</form>
				{showResult && (
					<div className="text-center">
						<span className="font-bold">{joinRequestResult.name}</span>
						<p>
							Request result -{" "}
							<span
								className="inline font-semibold"
								style={{ color: getStatusColor(joinRequestResult.status) }}>
								{joinRequestResult.status}
							</span>
						</p>
					</div>
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
