import { Box, Avatar as MantineAvatar, useMantineTheme } from "@mantine/core";
import { UserProfile } from "@prisma/client";
import { CSSProperties } from "react";

interface PostItemProps {
    wrapper: {
        className?: string;
        style?: CSSProperties;
        children: React.ReactNode;
    };
    side: {
        className?: string;
        children: React.ReactNode;
    };
    main: {
        className?: string;
        children: React.ReactNode;
    };
    content: {
        children: React.ReactNode;
    };
    footer: {
        children: React.ReactNode;
    };
    heading: {
        className?: string;
        children: React.ReactNode;
    };
    avatar: {
        color?: string;
        avatarUrl?: UserProfile["avatarUrl"];
    };
}

/**
 * React abstract component which is used for building other components
 */
function PostItem(props: PostItemProps["wrapper"]) {
    const theme = useMantineTheme();
    const {
        className,
        children,
        style = { backgroundColor: theme.colors.dark[7] },
    } = props;
    return (
        <div
            className={`flex flex-col gap-1 rounded-md p-1 ${className || ""}`}
            style={style}
        >
            {children}
        </div>
    );
}

function Side(props: PostItemProps["side"]) {
    const { className, children } = props;
    return <div className={`flex flex-col ${className || ""}`}>{children}</div>;
}

function Main(props: PostItemProps["main"]) {
    const { className, children } = props;
    return (
        <div className={`flex grow flex-col gap-1.5 ${className || ""}`}>
            {children}
        </div>
    );
}

function Content(props: PostItemProps["content"]) {
    return props.children;
}

function Header(props: PostItemProps["heading"]) {
    const { className, children } = props;
    return (
        <div className={`flex justify-between ${className || ""}`}>
            {children}
        </div>
    );
}

function Footer(props: PostItemProps["footer"]) {
    return props.children;
}

function Avatar(props: PostItemProps["avatar"]) {
    const { color, avatarUrl } = props;
    const noUser = !color && !avatarUrl;
    const noAvatar = !avatarUrl && color;
    const hasAvatar = !!avatarUrl;
    return (
        <>
            {hasAvatar && (
                <MantineAvatar
                    variant="filled"
                    radius="xl"
                    color="dark"
                    src={avatarUrl}
                />
            )}
            {noAvatar && (
                <Box
                    sx={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "2rem",
                        backgroundColor: color,
                    }}
                ></Box>
            )}
            {noUser && (
                <MantineAvatar variant="filled" radius="xl" color="dark" />
            )}
        </>
    );
}

PostItem.Side = Side;
PostItem.Avatar = Avatar;
PostItem.Main = Main;
PostItem.Content = Content;
PostItem.Header = Header;
PostItem.Footer = Footer;
export default PostItem;
