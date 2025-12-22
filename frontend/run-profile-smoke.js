import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  page.on('console', (msg) => {
    try {
      logs.push({ type: msg.type(), text: msg.text() });
    } catch (e) {
      logs.push({ type: 'error', text: String(msg) });
    }
  });

  page.on('pageerror', (err) => {
    logs.push({ type: 'pageerror', text: err.message });
  });

  try {
    const url = 'http://localhost:5173/profile';
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    // wait for profile heading
    await page.waitForSelector('text=Profile', { timeout: 5000 }).catch(() => {});

    // try click Edit Profile
    const edit = await page.$('text=Edit Profile');
    if (edit) {
      console.log('Clicking Edit Profile');
      await edit.click();
      await page.waitForTimeout(500);
      // fill name if input exists
      const nameInput = await page.$('input[placeholder="Full Name"]');
      if (nameInput) {
        await nameInput.fill('Smoke Test User');
        console.log('Filled name input');
      } else {
        console.log('Name input not found');
      }

      // click Save
      const save = await page.$('text=Save');
      if (save) {
        console.log('Clicking Save');
        await save.click();
        // wait a bit for logs
        await page.waitForTimeout(1500);
      } else {
        console.log('Save button not found');
      }
    } else {
      console.log('Edit Profile button not found; maybe not signed in or different route');
    }

    // capture visible error message
    const errEl = await page.$('text=Authentication not resolved') || await page.$('text=You must be signed in');
    if (errEl) {
      const text = await errEl.innerText();
      console.log('UI reported error:', text);
    }

    console.log('\n--- Browser console logs ---');
    logs.forEach((l) => console.log(l.type, l.text));

    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('Smoke test failed:', e);
    logs.forEach((l) => console.log(l.type, l.text));
    try { await browser.close(); } catch (e) {}
    process.exit(2);
  }
})();