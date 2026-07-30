import React from "react";

export function AppShell({ children, title, description, email, role }) {
	return React.createElement(
		"section",
		{
			"data-app-shell-title": title,
			"data-app-shell-description": description,
			"data-app-shell-email": email ?? "",
			"data-app-shell-role": role,
		},
		children,
	);
}
