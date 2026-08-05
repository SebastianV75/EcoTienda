export function redirect(url) {
	throw new Error(`redirect:${url}`);
}

export function useRouter() {
	return {
		push() {},
		replace() {},
		back() {},
		forward() {},
		refresh() {},
	};
}
