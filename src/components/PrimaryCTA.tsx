import { motion } from 'framer-motion';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
}

type AnchorProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; type?: never };
type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; type?: 'button' | 'submit' | 'reset' };

const SIZE = {
  sm: 'h-9 px-4 text-sm sm:h-auto sm:px-3 sm:py-1.5 sm:text-xs',
  md: 'h-12 px-5 text-base sm:h-auto sm:px-4 sm:py-2.5 sm:text-sm',
  lg: 'h-12 px-6 text-base sm:h-auto sm:px-5 sm:py-2.5 sm:text-sm',
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

export const PrimaryCTA = ({ children, className, size = 'md', withArrow, ...rest }: AnchorProps | ButtonProps) => {
  const classes = cn(
    'group inline-flex items-center gap-2 rounded-full font-semibold text-primary-foreground shadow-lg',
    SIZE[size],
    className
  );
  const style = { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' };
  const motionProps = {
    initial: 'rest',
    whileHover: 'hover',
    whileTap: 'tap',
    variants: {
      rest: { scale: 1 },
      hover: { scale: 1.02 },
      tap: { scale: 0.97 },
    },
    transition: { duration: 0.2, ease: 'easeOut' as const },
  };

  if ('href' in rest && rest.href !== undefined) {
    return (
      <motion.a className={classes} style={style} {...motionProps} {...rest}>
        {children}
        <ArrowSpan show={!!withArrow} />
      </motion.a>
    );
  }
  return (
    <motion.button className={classes} style={style} {...motionProps} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
      <ArrowSpan show={!!withArrow} />
    </motion.button>
  );
};

export default PrimaryCTA;
