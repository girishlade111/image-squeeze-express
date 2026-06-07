import { motion } from 'framer-motion';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BaseProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
}

type AnchorProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: never };
type LinkProps = BaseProps & { to: string; href?: never; onClick?: () => void; target?: string; rel?: string };
type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never; to?: never };

const SIZE = {
  sm: 'h-9 px-4 text-sm sm:h-auto sm:px-3 sm:py-1.5 sm:text-xs',
  md: 'h-12 px-5 text-base sm:h-auto sm:px-4 sm:py-2.5 sm:text-sm',
  lg: 'h-12 px-6 text-base sm:h-auto sm:px-5 sm:py-2.5 sm:text-sm',
} as const;

const MOTION_PROPS = {
  initial: 'rest',
  whileHover: 'hover',
  whileTap: 'tap',
  variants: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.97 },
  },
  transition: { duration: 0.2, ease: 'easeOut' as const },
} as const;

const ArrowSpan = ({ show }: { show: boolean }) =>
  show ? (
    <motion.span
      className="inline-flex"
      variants={{ rest: { x: 0 }, hover: { x: 2 } }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      &rarr;
    </motion.span>
  ) : null;

const classesFor = (size: 'sm' | 'md' | 'lg', extra?: string) =>
  cn(
    'group inline-flex items-center justify-center gap-2 rounded-full font-semibold text-primary-foreground shadow-lg',
    SIZE[size],
    extra
  );

const style = { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' };

const MotionLink = motion.create(Link);

export const PrimaryCTA = (props: AnchorProps | LinkProps | ButtonProps) => {
  const { children, className, size = 'md', withArrow } = props;
  const cls = classesFor(size, className);

  if ('to' in props && props.to !== undefined) {
    return (
      <MotionLink
        to={props.to}
        className={cls}
        style={style}
        onClick={props.onClick}
        {...MOTION_PROPS}
      >
        {children}
        <ArrowSpan show={!!withArrow} />
      </MotionLink>
    );
  }
  if ('href' in props && props.href !== undefined) {
    return (
      <motion.a className={cls} style={style} {...MOTION_PROPS} {...(props as AnchorProps)}>
        {children}
        <ArrowSpan show={!!withArrow} />
      </motion.a>
    );
  }
  return (
    <motion.button
      className={cls}
      style={style}
      {...MOTION_PROPS}
      {...(props as ButtonProps)}
    >
      {children}
      <ArrowSpan show={!!withArrow} />
    </motion.button>
  );
};

export default PrimaryCTA;
