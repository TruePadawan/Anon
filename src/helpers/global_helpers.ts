export function classNames(...classNames: Array<boolean | string>) {
	return classNames.filter(Boolean).join(" ");
}
