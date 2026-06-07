import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PictureSource {
  /** MIME type — e.g. 'image/avif', 'image/webp'. */
  type: string;
  /** srcSet value (can include 1x/2x descriptors). */
  srcSet: string;
  /** Optional sizes attribute. */
  sizes?: string;
}

interface ProfileImageProps {
  src: string;
  alt: string;
  /** Tailwind width class, e.g. 'w-32' or 'w-40 sm:w-48'. */
  className?: string;
  /** CSS aspect-ratio string. Defaults to '2/3' (portrait). */
  aspectRatio?: string;
  /** Initials shown in the gradient fallback if the image fails to load. */
  fallbackInitials?: string;
  /** Natural dimensions of the source image, used for layout stability (no CLS). */
  naturalWidth?: number;
  naturalHeight?: number;
  /** Show the small "online" status dot in the bottom-right. */
  showStatus?: boolean;
  /** Optional modern-format sources, rendered inside a <picture> in the given order. */
  sources?: PictureSource[];
  /** srcSet on the <img> tag (used when `sources` is empty). */
  srcSet?: string;
  /** sizes attribute paired with srcSet. */
  sizes?: string;
}

/**
 * Polished portrait/landscape image wrapper used for profile photos.
 * Renders the source image inside a gradient frame, preserves the chosen
 * aspect ratio, lazy-loads, and falls back to gradient initials on error.
 */
const ProfileImage = ({
  src,
  alt,
  className,
  aspectRatio = '2/3',
  fallbackInitials = '?',
  naturalWidth,
  naturalHeight,
  showStatus = false,
  sources,
  srcSet,
  sizes,
}: ProfileImageProps) => {
  const [errored, setErrored] = useState(false);

  return (
    <motion.div
      className={cn('group relative flex-shrink-0', className)}
      style={{ aspectRatio }}
      whileHover="hover"
    >
      <div
        className="absolute inset-0 rounded-2xl p-[2px]"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.5) 50%, hsl(var(--primary) / 0.3))',
        }}
        aria-hidden
      >
        <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-card">
          {errored ? (
            <div
              className="flex h-full w-full items-center justify-center text-3xl font-black text-primary-foreground sm:text-4xl"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
              aria-hidden
            >
              {fallbackInitials}
            </div>
          ) : sources && sources.length > 0 ? (
            <picture>
              {sources.map((s) => (
                <source key={s.type} type={s.type} srcSet={s.srcSet} {...(s.sizes ? { sizes: s.sizes } : {})} />
              ))}
              <motion.img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                {...(naturalWidth !== undefined ? { width: naturalWidth } : {})}
                {...(naturalHeight !== undefined ? { height: naturalHeight } : {})}
                onError={() => setErrored(true)}
                className="h-full w-full object-cover"
                variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </picture>
          ) : (
            <motion.img
              src={src}
              alt={alt}
              loading="lazy"
              decoding="async"
              {...(srcSet ? { srcSet } : {})}
              {...(sizes ? { sizes } : {})}
              {...(naturalWidth !== undefined ? { width: naturalWidth } : {})}
              {...(naturalHeight !== undefined ? { height: naturalHeight } : {})}
              onError={() => setErrored(true)}
              className="h-full w-full object-cover"
              variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          )}

          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(180deg, transparent 50%, hsl(var(--background) / 0.25))',
            }}
            aria-hidden
          />
        </div>
      </div>

      {showStatus && !errored && (
        <span
          className="absolute bottom-2 right-2 z-10 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card sm:bottom-2.5 sm:right-2.5 sm:h-3.5 sm:w-3.5"
          aria-label="Online"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
        </span>
      )}
    </motion.div>
  );
};

export default ProfileImage;
