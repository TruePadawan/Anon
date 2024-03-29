import { Avatar, Button, Menu } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useState } from "react";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { UserProfile } from "@prisma/client";
import { useMediaQuery } from "@mantine/hooks";

export interface ProfileMenuProps {
    user: Pick<UserProfile, "displayName" | "avatarUrl" | "color">;
    onProfileMenuItemClicked: () => void;
    onSignoutMenuItemClicked: () => void;
}

/**
 * React component which renders a navbar menu
 */
export default function ProfileMenu(props: ProfileMenuProps) {
    const [menuOpened, setMenuOpened] = useState(false);
    const matches = useMediaQuery("(max-width: 768px)");
    const { user } = props;

    const menuItemClasses = "font-semibold text-base";
    const dropdownTargetID = "profile-dropdown-btn";
    const dropdownID = "profile-dropdown-menu";
    return (
        <div data-cy="profile-dropdown">
            <Menu opened={menuOpened} onChange={setMenuOpened} withArrow>
                <Menu.Target>
                    {matches ? (
                        <Avatar
                            variant="filled"
                            src={user.avatarUrl}
                            alt={`${user.displayName} profile pic`}
                            radius="xl"
                            id={dropdownTargetID}
                            data-cy="profile-dropdown-btn"
                            aria-controls={menuOpened ? dropdownID : undefined}
                            aria-haspopup="menu"
                            aria-expanded={menuOpened ? "true" : undefined}
                        />
                    ) : (
                        <Button
                            id={dropdownTargetID}
                            variant="subtle"
                            data-cy="profile-dropdown-btn"
                            rightIcon={
                                menuOpened ? (
                                    <IconChevronUp />
                                ) : (
                                    <IconChevronDown />
                                )
                            }
                            aria-controls={menuOpened ? dropdownID : undefined}
                            aria-haspopup="menu"
                            aria-expanded={menuOpened ? "true" : undefined}
                            sx={{
                                fontWeight: 600,
                                fontSize: "1.125rem",
                                fontFamily: "inherit",
                                color: "inherit",
                            }}
                        >
                            {user.displayName}
                        </Button>
                    )}
                </Menu.Target>

                <Menu.Dropdown
                    id={dropdownID}
                    role="menu"
                    aria-labelledby={dropdownTargetID}
                >
                    <Menu.Label>User</Menu.Label>
                    <Menu.Item
                        className={menuItemClasses}
                        role="menuitem"
                        data-cy="profile-menu-item"
                        icon={<IconUser size={16} />}
                        onClick={props.onProfileMenuItemClicked}
                    >
                        Profile
                    </Menu.Item>
                    <Menu.Label>Application</Menu.Label>
                    <Menu.Item
                        className={menuItemClasses}
                        role="menuitem"
                        color="red"
                        data-cy="signout-menu-item"
                        icon={<IconLogout size={16} />}
                        onClick={props.onSignoutMenuItemClicked}
                    >
                        Sign Out
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
}
