"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
	fadeUpVariants,
	motionTransition,
	reducedMotionVariants,
} from "@/lib/motion";

type MotionSafeProps = Omit<
	ComponentPropsWithoutRef<typeof motion.div>,
	"children"
> & {
	children: ReactNode;
};

export function MotionSafe({ children, ...props }: MotionSafeProps) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<motion.div
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.08 }}
			variants={prefersReducedMotion ? reducedMotionVariants : fadeUpVariants}
			transition={motionTransition}
			{...props}
		>
			{children}
		</motion.div>
	);
}
