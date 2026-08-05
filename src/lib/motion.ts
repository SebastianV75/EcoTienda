import type { Transition, Variants } from "framer-motion";

export const motionTransition: Transition = {
	duration: 0.28,
	ease: [0.23, 1, 0.32, 1],
};

export const fadeUpVariants: Variants = {
	hidden: { opacity: 0, y: 8 },
	visible: { opacity: 1, y: 0 },
};

export const reducedMotionVariants: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1 },
};
