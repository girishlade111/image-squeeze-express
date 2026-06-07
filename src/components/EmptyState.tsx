import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Centered empty-state with an optional icon, headline, description, and a
 * single primary action. Used in the queue, results, and rule-builder when
 * there is nothing to show yet.
 */
const EmptyState = ({ icon, title, description, action, className = '' }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-foreground/[0.015] px-5 py-8 text-center sm:px-6 sm:py-10 ${className}`}
  >
    {icon && (
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-12 sm:w-12">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-foreground sm:text-sm">{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground sm:mt-1 sm:text-xs">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </motion.div>
);

export default EmptyState;
