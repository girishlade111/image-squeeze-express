import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentTitle from '@/components/DocumentTitle';

const lastUpdated = 'March 8, 2026';

const TermsOfService = () => (
  <div className="min-h-screen bg-background">
    <DocumentTitle title="Terms of Service" />
    <Header />
    <main className="container mx-auto px-4 pt-24 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-black tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

        <p className="mt-6 text-muted-foreground leading-relaxed">
          Welcome to <strong className="text-foreground">ImageSqueeze</strong>. By accessing or using our website at{' '}
          <a href="https://imagesqueeze.com" className="text-primary hover:underline">imagesqueeze.com</a>, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold">1. Service Description</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze is a <strong className="text-foreground">free, client-side image optimization tool</strong> that provides:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary">•</span> Image compression (up to 90% size reduction)</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Image resizing with social media presets</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Format conversion (JPEG, PNG, WebP)</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Batch processing (up to 50 images simultaneously, 750 MB total)</li>
            <li className="flex gap-2"><span className="text-primary">•</span> ZIP download of processed images</li>
          </ul>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            All processing occurs <strong className="text-foreground">entirely within your web browser</strong>. No images are uploaded to or stored on our servers.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">2. Acceptable Use</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">You agree to use ImageSqueeze only for lawful purposes. You must not:</p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-destructive">✗</span> Attempt to reverse-engineer, decompile, or disassemble the application</li>
            <li className="flex gap-2"><span className="text-destructive">✗</span> Use automated tools to scrape or overload the website</li>
            <li className="flex gap-2"><span className="text-destructive">✗</span> Redistribute the application as your own product without attribution</li>
            <li className="flex gap-2"><span className="text-destructive">✗</span> Use the service to process illegal or prohibited content</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">3. Intellectual Property</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            The ImageSqueeze brand, logo, design, and code are the intellectual property of <strong className="text-foreground">Lade Stack</strong>. You retain full ownership of any images you process through the tool — we claim no rights to your content.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">4. No Warranty</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze is provided <strong className="text-foreground">"as is" without warranties of any kind</strong>, either express or implied. We do not guarantee:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary">•</span> Uninterrupted or error-free operation</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Specific compression ratios or output quality</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Compatibility with all image formats or browsers</li>
            <li className="flex gap-2"><span className="text-primary">•</span> Preservation of image metadata (EXIF data may be removed during compression)</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, Lade Stack and ImageSqueeze shall not be liable for any <strong className="text-foreground">indirect, incidental, special, consequential, or punitive damages</strong> arising from your use of the service, including but not limited to loss of data, loss of profits, or damage to your device.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Since all processing occurs in your browser, you are responsible for maintaining backups of your original images before processing.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">6. Free Service</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze is offered <strong className="text-foreground">free of charge</strong>. All compression, resize, format conversion, PDF compression, and bulk-rename features are available to every user with no hidden fees, no watermarks, and no usage limits beyond the per-batch caps documented on each tool.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">7. Modifications to Terms</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We may update these Terms of Service at any time. Continued use of ImageSqueeze after changes constitutes acceptance of the updated terms. We recommend reviewing this page periodically.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">8. Governing Law</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">9. Contact</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            For questions about these Terms, please visit our{' '}
            <a href="/contact" className="font-semibold text-primary hover:underline">contact page</a> or reach out at{' '}
            <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">ladestack.in</a>.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsOfService;
