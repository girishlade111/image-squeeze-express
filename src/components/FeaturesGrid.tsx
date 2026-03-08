const features = [
  { icon: '🔒', title: '100% Private', desc: 'Images are processed in your browser. Nothing is uploaded to any server.' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'No waiting for uploads. Processing starts instantly.' },
  { icon: '📦', title: 'Batch Processing', desc: 'Compress up to 10 images at once for free.' },
  { icon: '🎯', title: 'Social Presets', desc: 'One-click resize for Instagram, LinkedIn, WhatsApp & more.' },
  { icon: '🔄', title: 'Format Conversion', desc: 'Convert to WebP, PNG, or JPEG with one click.' },
  { icon: '🆓', title: 'Free Forever', desc: 'No account, no hidden fees, no watermarks.' },
];

const FeaturesGrid = () => (
  <section className="container mx-auto mt-20 px-4">
    <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
      Why <span className="gradient-text">ImageSqueeze</span>?
    </h2>

    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => (
        <div key={i} className="glass-card rounded-2xl p-6">
          <span className="text-3xl">{f.icon}</span>
          <h3 className="mt-3 text-base font-bold">{f.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturesGrid;
