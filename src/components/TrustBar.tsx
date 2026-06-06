import { motion } from 'framer-motion';
import { Shield, Lock, ServerOff, Eye, Code2, Globe } from 'lucide-react';

const trustItems = [
  { icon: Shield, label: '100% Private', desc: 'No servers, no uploads' },
  { icon: Lock, label: 'Zero Tracking', desc: 'No cookies, no analytics' },
  { icon: ServerOff, label: 'Offline-Ready', desc: 'Works after first load' },
  { icon: Eye, label: 'Open Workflow', desc: 'Inspect in DevTools' },
  { icon: Code2, label: 'Standard Libraries', desc: 'pdf.js, pdf-lib, JSZip' },
  { icon: Globe, label: 'Any Device', desc: 'Phone, tablet, desktop' },
];

const TrustBar = () => (
  <section className="container mx-auto mt-16 px-4">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-5xl rounded-2xl border border-border/50 bg-card/60 p-5 shadow-elev-1 backdrop-blur-xl sm:p-7"
    >
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        Why teams trust ImageSqueeze
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {trustItems.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 p-3 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight">{label}</p>
              <p className="text-[10px] text-muted-foreground">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </section>
);

export default TrustBar;
