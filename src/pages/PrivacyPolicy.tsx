import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentTitle from '@/components/DocumentTitle';

const lastUpdated = 'March 8, 2026';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    <DocumentTitle title="Privacy Policy" />
    <Header />
    <main className="container mx-auto px-4 pt-24 pb-16 sm:px-6">
      <div className="mx-auto max-w-3xl prose-sm">
        <h1 className="text-4xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>

        <p className="mt-6 text-muted-foreground leading-relaxed">
          At <strong className="text-foreground">ImageSqueeze</strong>, your privacy isn't just a feature — it's the foundation of everything we build. This Privacy Policy explains how we handle (or rather, <em>don't</em> handle) your data.
        </p>

        {/* Section 1 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">1. The Short Version</h2>
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> <strong className="text-foreground">We do NOT upload your images</strong> to any server</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> <strong className="text-foreground">We do NOT collect personal data</strong> — no names, emails, or accounts</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> <strong className="text-foreground">We do NOT use cookies</strong> for tracking or advertising</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> <strong className="text-foreground">We do NOT share data</strong> with third parties</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> <strong className="text-foreground">All processing is 100% client-side</strong> in your browser</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">2. How ImageSqueeze Works</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze is a <strong className="text-foreground">fully client-side application</strong>. When you compress, resize, or convert an image:
          </p>
          <ol className="mt-4 space-y-3 text-muted-foreground list-decimal list-inside">
            <li>Your image is loaded into your browser's memory using the <strong className="text-foreground">File API</strong></li>
            <li>Processing occurs via <strong className="text-foreground">JavaScript Web Workers</strong> and the <strong className="text-foreground">Canvas API</strong></li>
            <li>The compressed result is generated as a <strong className="text-foreground">Blob object in memory</strong></li>
            <li>You download the result directly — <strong className="text-foreground">no data is transmitted</strong> to any server</li>
          </ol>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            You can verify this yourself by opening your browser's Developer Tools → Network tab. You'll see <strong className="text-foreground">zero image upload requests</strong> during processing.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">3. Data We Store Locally</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We use your browser's <strong className="text-foreground">localStorage</strong> to save two things for your convenience:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 text-left font-semibold text-foreground">Key</th>
                  <th className="py-2 text-left font-semibold text-foreground">Purpose</th>
                  <th className="py-2 text-left font-semibold text-foreground">Contains</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/50">
                  <td className="py-2"><code className="rounded bg-secondary px-1.5 py-0.5 text-xs">imagesqueeze-theme</code></td>
                  <td className="py-2">Remember dark/light mode preference</td>
                  <td className="py-2">"dark" or "light"</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2"><code className="rounded bg-secondary px-1.5 py-0.5 text-xs">imagesqueeze-settings</code></td>
                  <td className="py-2">Remember compression settings</td>
                  <td className="py-2">Quality, format, resize preferences</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            This data <strong className="text-foreground">never leaves your browser</strong> and can be cleared at any time via your browser settings. No personal information is stored.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">4. Third-Party Services</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze loads the following external resources:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary">•</span> <strong className="text-foreground">Google Fonts (Inter)</strong> — loaded for typography. Subject to Google's privacy policy.</li>
          </ul>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We do <strong className="text-foreground">not</strong> use Google Analytics, Facebook Pixel, or any other tracking or advertising scripts.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">5. Children's Privacy</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            ImageSqueeze does not collect any personal data from anyone, including children under 13. Since no data is collected or transmitted, COPPA and similar regulations are inherently satisfied.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">6. Changes to This Policy</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated "Last updated" date. Since we don't collect email addresses, we cannot notify you of changes — we recommend bookmarking this page.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">7. Contact Us</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please reach out via our{' '}
            <a href="/contact" className="font-semibold text-primary hover:underline">contact page</a> or visit{' '}
            <a href="https://ladestack.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">ladestack.in</a>.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
