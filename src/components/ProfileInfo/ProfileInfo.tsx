/* eslint-disable @next/next/no-img-element */
import { UserProfile } from "@prisma/client";
import { IMG_HEIGHT, IMG_WIDTH } from "./vars";
import { TextInput, Textarea } from "@mantine/core";

/**
 * React component which renders profile information like avatar, account name and display name
 */
const ProfileInfo = (props: UserProfile) => {
    return (
        <div className="flex w-full max-w-lg flex-col items-center gap-4">
            {props.avatarUrl ? (
                <img
                    className="rounded-full"
                    src={props.avatarUrl}
                    alt={props.accountName}
                />
            ) : (
                <span
                    className="rounded-full"
                    style={{
                        background: props.color,
                        width: `${IMG_WIDTH}px`,
                        height: `${IMG_HEIGHT}px`,
                    }}
                ></span>
            )}
            <TextInput
                className="w-full"
                size="md"
                label="Account name"
                value={props.accountName}
                readOnly
            />
            <TextInput
                className="w-full"
                size="md"
                label="Display name"
                value={props.displayName}
                readOnly
            />
            <Textarea
                className="w-full"
                size="md"
                label="Bio"
                value={props.bio}
                autosize
                readOnly
            />
        </div>
    );
};

export default ProfileInfo;
