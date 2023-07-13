import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export interface ProfileMenuProps {
	displayName: string;
	onProfileMenuItemClicked: () => void;
	onSignoutMenuItemClicked: () => void;
}

export default function ProfileMenu(props: ProfileMenuProps) {
	const { displayName } = props;
	const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);

	function onDropdownButtonClicked(event: React.MouseEvent<HTMLElement>) {
		setAnchorElement(event.currentTarget);
	}

	function closeMenu() {
		setAnchorElement(null);
	}

	function handleMenuClose() {
		setAnchorElement(null);
	}

	const menuOpen = Boolean(anchorElement);
	const menuItemClasses =
		"font-semibold text-base text-white hover:text-accent-color-2";
	return (
		<div data-cy="profile-dropdown">
			<Button
				sx={{ fontWeight: 600, fontSize: "1.125rem", color: "inherit" }}
				id="profile-dropdown-btn"
				data-cy="profile-dropdown-btn"
				variant="text"
				endIcon={menuOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
				onClick={onDropdownButtonClicked}
				aria-controls={menuOpen ? "profile-dropdown-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={menuOpen ? "true" : undefined}>
				{displayName}
			</Button>
			<Menu
				id="profile-dropdown-menu"
				anchorEl={anchorElement}
				MenuListProps={{
					"aria-labelledby": "profile-dropdown-btn",
				}}
				open={menuOpen}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				onClose={handleMenuClose}
				sx={{
					"& .MuiPaper-root": {
						bgcolor: "var(--secondary-color);",
					},
				}}>
				<MenuItem
					className={menuItemClasses}
					data-cy="profile-menu-item"
					onClick={() => {
						closeMenu();
						props.onProfileMenuItemClicked();
					}}
					disableRipple>
					Profile
				</MenuItem>
				<MenuItem
					className={menuItemClasses}
					data-cy="signout-menu-item"
					onClick={() => {
						closeMenu();
						props.onSignoutMenuItemClicked();
					}}
					disableRipple>
					Sign Out
				</MenuItem>
			</Menu>
		</div>
	);
}
