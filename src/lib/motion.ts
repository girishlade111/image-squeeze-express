import type { Transition, Variants } from 'framer-motion';

export const easeOutExpo: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};

export const easeOut: Transition = {
  duration: 0.3,
  ease: 'easeOut',
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: easeOutExpo },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeOut },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const staggerContainer = (staggerMs = 80): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerMs / 1000,
      delayChildren: 0.05,
    },
  },
});

export const floatBlob = (duration = 20, delay = 0): Transition => ({
  duration,
  delay,
  repeat: Infinity,
  ease: 'easeInOut',
});

export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

export const pulseGlow: Transition = {
  duration: 2,
  repeat: Infinity,
  ease: 'easeInOut',
};

export const shimmer: Transition = {
  duration: 2.5,
  repeat: Infinity,
  ease: 'easeInOut',
};

export const gradientPan: Transition = {
  duration: 8,
  repeat: Infinity,
  ease: 'easeInOut',
};

export const cardHover = {
  y: -2,
  transition: { duration: 0.25, ease: 'easeOut' as const },
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

export const iconHover = {
  scale: 1.1,
  rotate: 3,
  transition: { duration: 0.25, ease: 'easeOut' as const },
};

export const arrowHover = {
  x: 2,
  y: -2,
  transition: { duration: 0.2, ease: 'easeOut' as const },
};
