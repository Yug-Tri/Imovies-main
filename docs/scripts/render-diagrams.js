const fs = require('fs');
const path = require('path');

// Locate puppeteer-core in backend node_modules
const puppeteerPath = path.resolve(__dirname, '../../backend/node_modules/puppeteer-core');
const puppeteer = require(puppeteerPath);

// Detect Chrome or Edge executable on Windows
function getBrowserExecutablePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No Chrome or Edge browser executable found on system.');
}

async function renderDiagrams() {
  const diagramsDir = path.resolve(__dirname, '../diagrams');
  const files = fs.readdirSync(diagramsDir).filter(f => f.endsWith('.mmd'));

  if (files.length === 0) {
    console.log('No .mmd diagram files found in', diagramsDir);
    return;
  }

  console.log(`Found ${files.length} diagram files to render:`);
  files.forEach(f => console.log(`  - ${f}`));

  const browserPath = getBrowserExecutablePath();
  console.log(`Launching browser: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Load HTML template with Mermaid
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <style>
          body {
            background-color: #101010;
            color: #F2EFE8;
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div id="render-target"></div>
      </body>
    </html>
  `);

  await page.waitForFunction('typeof mermaid !== "undefined"');

  for (const file of files) {
    const inputPath = path.join(diagramsDir, file);
    const outputPath = path.join(diagramsDir, file.replace(/\.mmd$/, '.svg'));
    const content = fs.readFileSync(inputPath, 'utf8');

    console.log(`Rendering ${file} -> ${path.basename(outputPath)}...`);

    try {
      const svgResult = await page.evaluate(async (chartCode, id) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables: {
            darkMode: true,
            background: '#101010',
            mainBkg: '#191919',
            primaryColor: '#1E1E1E',
            primaryTextColor: '#F2EFE8',
            primaryBorderColor: '#C62828',
            lineColor: '#C62828',
            secondaryColor: '#242424',
            tertiaryColor: '#141414',
            secondaryBorderColor: '#444444',
            secondaryTextColor: '#F2EFE8',
            fontFamily: "'Outfit', 'Segoe UI', -apple-system, sans-serif",
            fontSize: '14px',
            nodeBorder: '#C62828',
            clusterBkg: '#141414',
            clusterBorder: '#383838',
            titleColor: '#F2EFE8',
            edgeLabelBackground: '#191919',
            actorBkg: '#1E1E1E',
            actorBorder: '#C62828',
            actorTextColor: '#F2EFE8',
            actorLineColor: '#C62828',
            signalColor: '#F2EFE8',
            signalTextColor: '#F2EFE8',
            labelBoxBkgColor: '#191919',
            labelBoxBorderColor: '#C62828',
            labelTextColor: '#F2EFE8',
            loopTextColor: '#F2EFE8',
            noteBorderColor: '#C62828',
            noteBkgColor: '#242424',
            noteTextColor: '#F2EFE8',
            attributeBackgroundColorOdd: '#191919',
            attributeBackgroundColorEven: '#222222'
          }
        });

        const elementId = 'diagram_' + id.replace(/[^a-zA-Z0-9]/g, '_');
        const { svg } = await mermaid.render(elementId, chartCode);
        return svg;
      }, content, file);

      // Enhance SVG with background and styling for standalone GitHub rendering
      let finalSvg = svgResult;
      if (!finalSvg.includes('id="cinematic-bg"')) {
        finalSvg = finalSvg.replace(
          /(<svg[^>]*>)/i,
          `$1\n  <rect id="cinematic-bg" width="100%" height="100%" fill="#101010" rx="8" />`
        );
      }

      fs.writeFileSync(outputPath, finalSvg, 'utf8');
      console.log(`  ✓ Successfully generated ${path.basename(outputPath)} (${finalSvg.length} bytes)`);
    } catch (err) {
      console.error(`  ✗ Error rendering ${file}:`, err.message);
    }
  }

  await browser.close();
  console.log('Finished rendering diagrams.');
}

if (require.main === module) {
  renderDiagrams().catch(err => {
    console.error('Fatal error rendering diagrams:', err);
    process.exit(1);
  });
}

module.exports = renderDiagrams;
