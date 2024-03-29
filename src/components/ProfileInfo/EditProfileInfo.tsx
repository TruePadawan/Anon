/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { Button, FileInput, Loader, TextInput, Textarea } from "@mantine/core";
import useInput from "@/hooks/useInput";
import { validateFileAsImage, uploadImage, getBase64 } from "./helper";
import {
    validateAccountName,
    parseAccountName,
} from "@/helpers/global_helpers";
import { UploadApiOptions } from "cloudinary";
import { IconUpload } from "@tabler/icons-react";
import { UserProfile } from "@prisma/client";
import { notifications } from "@mantine/notifications";
import { useSWRConfig } from "swr";

interface EditProfileInfoProps {
    profileData: UserProfile;
    onCancel?: () => void;
    onUpdate?: () => void;
}

/**
 * React component which provides an interface for editing profile information like avatar, account/display name
 */
const EditProfileInfo = (props: EditProfileInfoProps) => {
    const { mutate } = useSWRConfig();
    const [formIsValid, setFormIsValid] = useState(false);
    const [displayName, setDisplayName] = useState(
        props.profileData.displayName,
    );
    const [isUpdating, setIsUpdating] = useState(false);
    const [profilePicIsValid, setProfilePicIsValid] = useState(true);
    const [imageValidationErrorText, setImageValidationErrorText] =
        useState("");

    const bioRef = useRef<HTMLTextAreaElement>(null);
    const profilePictureRef = useRef<File | undefined>();

    // account name is valid if its the same as signed in users' or is unique in db
    const accountNameInput = useInput([validateAccountName], {
        initialValue: props.profileData.accountName,
        initialValueIsValid: true,
        transform: parseAccountName,
    });

    // update formIsValid state when input states change
    useEffect(() => {
        setFormIsValid(
            profilePicIsValid &&
                accountNameInput.isValidating === false &&
                accountNameInput.isValid &&
                displayName.trim().length > 0,
        );
    }, [
        profilePicIsValid,
        accountNameInput,
        displayName,
        props.profileData.accountName,
    ]);

    async function uploadProfilePicture(): Promise<string> {
        if (profilePictureRef.current === undefined) {
            throw new Error("No file selected!");
        }

        const result = validateFileAsImage(profilePictureRef.current);
        if (!result.isValid) {
            throw new Error(result.messages.join());
        }

        const fileAsBase64 = await getBase64(profilePictureRef.current);
        if (!fileAsBase64) {
            throw new Error("Failed to convert image file to base64");
        }

        const uploadOptions: UploadApiOptions = {
            upload_preset: "profile_pic_preset",
            public_id: `${props.profileData.id}`,
            folder: "anon/profile_pictures",
            overwrite: true,
        };

        const uploadResult = await uploadImage(fileAsBase64, uploadOptions);
        return uploadResult.secure_url;
    }

    async function formSubmitHandler(event: React.FormEvent) {
        event.preventDefault();
        try {
            setIsUpdating(true);
            const profilePicUrl = profilePictureRef.current
                ? await uploadProfilePicture()
                : undefined;

            // update profile data
            const data = {
                avatarUrl: profilePicUrl,
                accountName: accountNameInput.value,
                displayName: displayName.trim(),
                bio: bioRef.current?.value,
            };

            const response = await fetch("/api/update-profile", {
                method: "POST",
                body: JSON.stringify(data),
            });

            if (response.ok && props.onUpdate) {
                // after update
                props.onUpdate();
                mutate("/api/get-user-profile");
            } else if (!response.ok) {
                // handle failed update
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error: any) {
            notifications.show({
                color: "red",
                title: "Failed to update profile",
                message: error.message,
            });
            setIsUpdating(false);
        }
    }

    function displayNameChangeHandler(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        setDisplayName(event.target.value);
    }

    function cancelBtnClickHandler() {
        if (props.onCancel) {
            props.onCancel();
        }
    }

    async function fileInputChangeHandler(file: File | null) {
        profilePictureRef.current = undefined;
        // validate that file is less than 1MB and is an image
        if (file !== null) {
            const result = validateFileAsImage(file);
            if (result.isValid) {
                // valid file - keep track of selected file
                profilePictureRef.current = file;
                setProfilePicIsValid(true);
                setImageValidationErrorText("");
            } else {
                // notify user to give correct data
                setImageValidationErrorText(result.messages.join("\n"));
                setProfilePicIsValid(false);
            }
        }
        if (file === null) {
            // file input for selecting profile pic is valid if no file is selected or if a valid pic is selected
            setProfilePicIsValid(true);
        }
    }

    const { profileData } = props;
    const updateIsDisabled = !formIsValid || isUpdating;
    return (
        <>
            <form
                className="flex w-full max-w-lg flex-col items-center gap-4"
                onSubmit={formSubmitHandler}
            >
                <FileInput
                    accept="image/*"
                    size="md"
                    className="w-full"
                    icon={<IconUpload />}
                    label="Profile picture"
                    description="The selected file should be no more than 1 megabyte in size"
                    placeholder="Select image"
                    error={imageValidationErrorText}
                    onChange={fileInputChangeHandler}
                />
                <TextInput
                    className="w-full"
                    rightSection={
                        accountNameInput.isValidating ? (
                            <Loader size="sm" />
                        ) : undefined
                    }
                    size="md"
                    label="Account name"
                    description="Account names are unique and should have no whitespace"
                    value={accountNameInput.value}
                    onChange={accountNameInput.changeEvHandler}
                    onFocus={accountNameInput.focusEvHandler}
                    error={
                        accountNameInput.hasError
                            ? accountNameInput.errorMessage
                            : ""
                    }
                    spellCheck={false}
                    required
                />
                <TextInput
                    className="w-full"
                    size="md"
                    label="Display name"
                    value={displayName}
                    onChange={displayNameChangeHandler}
                    spellCheck={false}
                    required
                />
                <Textarea
                    className="w-full"
                    size="md"
                    label="Bio"
                    defaultValue={profileData.bio}
                    ref={bioRef}
                    required
                    autosize
                />
                <div className="flex flex-col gap-2 self-stretch">
                    <Button
                        type="submit"
                        className="bg-dark-green hover:bg-dark-green-l disabled:hover:bg-dark-green"
                        loaderPosition="center"
                        loading={isUpdating}
                        disabled={updateIsDisabled}
                    >
                        Update
                    </Button>
                    <Button
                        type="button"
                        className="bg-dark-red hover:bg-dark-red-l disabled:hover:bg-dark-red"
                        onClick={cancelBtnClickHandler}
                        loaderPosition="center"
                        loading={isUpdating}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </>
    );
};

export default EditProfileInfo;
