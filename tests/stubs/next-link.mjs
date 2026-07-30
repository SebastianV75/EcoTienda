import React from "react";

export default function Link({ children, href, ...props }) {
	return React.createElement("a", { href, ...props }, children);
}
