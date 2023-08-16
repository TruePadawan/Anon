import { Avatar, useMantineTheme } from "@mantine/core";

interface PostItemProps {
	wrapper: {
		className?: string;
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
}

function PostItem(props: PostItemProps["wrapper"]) {
	const theme = useMantineTheme();
	const { className, children } = props;
	return (
		<div
			className={`flex flex-col p-1 rounded-md ${className || ""}`}
			style={{ backgroundColor: theme.colors.dark[7] }}>
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
		<div className={`flex justify-between ${className || ""}`}>{children}</div>
	);
}

function Footer(props: PostItemProps["footer"]) {
	return props.children;
}

PostItem.Side = Side;
PostItem.Avatar = Avatar;
PostItem.Main = Main;
PostItem.Content = Content;
PostItem.Header = Header;
PostItem.Footer = Footer;
export default PostItem;
