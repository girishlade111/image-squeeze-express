const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleMessages = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(`PAGE ERROR: ${err.message}`);
  });
  page.on('requestfailed', (req) => {
    pageErrors.push(`REQUEST FAILED: ${req.url()} - ${req.failure()?.errorText}`);
  });

  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.log('NAVIGATION ERROR:', e.message);
  }

  await page.waitForTimeout(2000);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  const hasH1 = await page.evaluate(() => !!document.querySelector('h1'));
  const hasUploadZone = await page.evaluate(() => !!document.querySelector('#upload'));
  const hasNav = await page.evaluate(() => !!document.querySelector('header'));
  const rootHasContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.children.length : 0;
  });

  console.log('=== ERRORS ===');
  pageErrors.forEach((e) => console.log(e));
  console.log('Errors:', pageErrors.length);

  console.log('\n=== CONSOLE (errors only) ===');
  consoleMessages.filter(m => m.startsWith('[error]') || m.startsWith('[warning]')).forEach(m => console.log(m));

  console.log('\n=== PAGE STATE ===');
  console.log('Body text length:', bodyText.length);
  console.log('Body text snippet:', bodyText.substring(0, 200));
  console.log('Body height:', bodyHeight);
  console.log('Has h1:', hasH1);
  console.log('Has #upload:', hasUploadZone);
  console.log('Has <header>:', hasNav);
  console.log('Root children:', rootHasContent);

  await browser.close();
})();
