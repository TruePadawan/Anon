import Navbar from "@/components/Navbar/Navbar";
import { GetServerSideProps } from "next";
import { Button, TextInput } from "@mantine/core";
import useInput from "@/hooks/useInput";
import React, { useEffect, useState } from "react";
import { validateGroupJoinId } from "@/helpers/join-group";

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

	useEffect(() => {
		setFormIsValid(!isValidating && isValid);
	}, [isValidating, isValid]);

	function formSubmitHandler(event: React.FormEvent) {
		event.preventDefault();
	}

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
			</main>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {},
	};
};

export default JoinGroupPage;
