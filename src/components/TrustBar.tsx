import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Cookie,
  CloudSlash,
  Eye,
  Code,
  DeviceMobile,
} from '@phosphor-icons/react';

const trustItems = [
  { icon: ShieldCheck, label: '100% Private', desc: 'No servers, no uploads' },
  { icon: Cookie, label: 'Zero Tracking', desc: 'No cookies, no analytics' },
  { icon: CloudSlash, label: 'Offline-Ready', desc: 'Works after first load' },
  { icon: Eye, label: 'Open Workflow', desc: 'Inspect in DevTools' },
  { icon: Code, label: 'Standard Libraries', desc: 'pdf.js, pdf-lib, JSZip' },
  { icon: DeviceMobile, label: 'Any Device', desc: 'Phone, tablet, desktop' },
];

const TrustBar = () => (
  <section className="container mx-auto mt-12 px-4 sm:mt-20">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-5xl rounded-2xl border border-border/50 bg-card/60 p-4 shadow-elev-1 backdrop-blur-xl sm:p-7"
    >
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:text-[10px]">
        Why teams trust LS Image Compressor
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {trustItems.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover="hover"
            className="group flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 p-3 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
          >
            <motion.div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9"
              variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Icon size={22} weight="duotone" aria-hidden />
            </motion.div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight sm:text-xs">{label}</p>
              <p className="text-[11px] text-muted-foreground sm:text-[10px]">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

export default TrustBar;
