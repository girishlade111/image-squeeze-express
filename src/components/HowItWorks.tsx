const steps = [
  { icon: '📤', title: 'Upload', desc: 'Select or drag your images (stays on your device)' },
  { icon: '⚙️', title: 'Configure', desc: 'Set compression, resize, and output format' },
  { icon: '⬇️', title: 'Download', desc: 'Get your optimized images instantly' },
];

const HowItWorks = () => (
  <section id="how-it-works" className="container mx-auto mt-20 px-4">
    <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
      How It <span className="gradient-text">Works</span>
    </h2>

    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
      {steps.map((s, i) => (
        <div key={i} className="glass-card flex flex-col items-center gap-3 rounded-2xl p-6 text-center">
          <span className="text-4xl">{s.icon}</span>
          <h3 className="text-lg font-bold">{s.title}</h3>
          <p className="text-sm text-muted-foreground">{s.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
