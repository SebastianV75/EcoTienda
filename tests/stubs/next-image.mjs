import React from "react";

export default function Image(props) {
	const { priority, ...rest } = props;
	void priority;
	return React.createElement("img", rest);
}
