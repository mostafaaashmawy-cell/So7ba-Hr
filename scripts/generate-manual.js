/**
 * HumAi Visual Onboarding & Product Manual — Master PDF Compilation Pipeline
 * 
 * Pipeline:
 * 1. Reads authentic, live system screenshots captured from the running Next.js system
 * 2. Compiles high-resolution Base64 Data URIs for inline zero-dependency PDF rendering
 * 3. Builds the master HTML document using HumAi Enterprise Brand Guidelines
 * 4. Compiles print-ready A4 PDF via Chrome DevTools Protocol (printToPDF) using Microsoft Edge
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const { generateManualHtml } = require('./manual-template');

// Supported Edge/Chrome Executable Paths
const POSSIBLE_BROWSER_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function findBrowserExecutable() {
  for (const p of POSSIBLE_BROWSER_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  throw new Error('No Edge or Chrome browser executable found on system.');
}

async function compileManualPdf() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 Compiling HumAi Master User Guide & Product Manual (Live Screenshots)');
  console.log('═══════════════════════════════════════════════════════════════════');

  const browserPath = findBrowserExecutable();
  console.log(`✓ Detected Browser Executable: ${browserPath}`);

  const rootDir = path.resolve(__dirname, '..');
  const manualDir = path.join(rootDir, 'docs', 'manual');
  const screenshotsDir = path.join(manualDir, 'screenshots');
  const outputDir = path.join(manualDir, 'output');

  fs.mkdirSync(outputDir, { recursive: true });

  // 1. Load All Real System Screenshots as Base64 Data URIs
  console.log('\n[1/3] Loading Authentic System Screenshots from disk...');
  const screenshotsMap = {};
  const screenshotFiles = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));

  for (const file of screenshotFiles) {
    const key = path.basename(file, '.png');
    const fullPath = path.join(screenshotsDir, file);
    const buffer = fs.readFileSync(fullPath);
    screenshotsMap[key] = `data:image/png;base64,${buffer.toString('base64')}`;
    console.log(`  ✓ Loaded screenshot: ${file} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  // 2. Build Master HTML Document
  console.log('\n[2/3] Generating Master HTML Document with HumAi Brand Identity...');
  const masterHtml = generateManualHtml(screenshotsMap);
  const masterHtmlPath = path.join(manualDir, 'HumAi_User_Guide_Manual.html');
  fs.writeFileSync(masterHtmlPath, masterHtml, 'utf8');
  console.log(`  ✓ Master HTML Saved: ${masterHtmlPath} (${(masterHtml.length / 1024).toFixed(1)} KB)`);

  // 3. Compile Master PDF via Headless Browser
  console.log('\n[3/3] Compiling Master PDF via Chrome DevTools Protocol (Edge)...');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-file-access-from-files',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
  });

  await page.setContent(masterHtml, { waitUntil: 'domcontentloaded', timeout: 45000 });
  try {
    await page.evaluate(() => document.fonts.ready);
  } catch (e) {}
  await new Promise(r => setTimeout(r, 800));

  const pdfPath = path.join(outputDir, 'HumAi_User_Guide_Manual.pdf');
  console.log('  ↳ Generating print-ready A4 PDF...');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: false,
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm',
    },
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('🎉 HumAi Master User Guide & Product Manual Successfully Generated!');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  • Destination File: ${pdfPath}`);
  console.log(`  • File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  • Format: Print-Ready A4 Portrait`);
  console.log(`  • Included Views: Authentic live screenshots of actual system routes`);
  console.log(`  • Branding: Strictly "HumAi" in English everywhere`);
}

compileManualPdf().catch(err => {
  console.error('❌ Compilation Error:', err);
  process.exit(1);
});
