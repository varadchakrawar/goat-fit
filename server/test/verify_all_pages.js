const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const routesToTest = [
  { url: 'http://localhost:4200/workouts', name: 'workouts' },
  { url: 'http://localhost:4200/exercises', name: 'exercises' },
  { url: 'http://localhost:4200/planner', name: 'planner' },
  { url: 'http://localhost:4200/nutrition', name: 'nutrition' },
  { url: 'http://localhost:4200/hydration', name: 'hydration' },
  { url: 'http://localhost:4200/dashboard', name: 'dashboard' }
];

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9222;

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    '--window-size=1440,900',
    'http://localhost:4200/workouts'
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();
    const page = targets.find((t) => t.type === 'page' && t.url.includes('4200')) || targets[0];
    const wsUrl = page.webSocketDebuggerUrl;

    const ws = new globalThis.WebSocket(wsUrl);

    let currentReqId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = ++currentReqId;
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise((r) => {
      ws.onopen = r;
    });

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    for (const test of routesToTest) {
      console.log(`\nTesting ${test.url}...`);
      await sendCommand('Page.navigate', { url: test.url });
      await new Promise((r) => setTimeout(r, 3000));

      const evalRes = await sendCommand('Runtime.evaluate', {
        expression: `(() => {
          const spinner = document.querySelector('.spinner-border');
          const cards = document.querySelectorAll('.goat-card, .spec-box, .stat-card, tr, .day-card');
          const wadMention = document.body.innerText.includes('WAD Syllabus') || (document.querySelector('header')?.innerText || '').includes('WAD');
          return JSON.stringify({
            url: window.location.pathname,
            title: document.title,
            spinnerVisible: !!spinner,
            elementCount: cards.length,
            hasWad: wadMention
          });
        })()`
      });

      console.log(`Result for ${test.name}:`, evalRes.result.value);

      // Capture screenshot
      const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
      const outPath = path.join(__dirname, `screenshot_${test.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${outPath}`);
    }

    ws.close();
  } catch (err) {
    console.error('Error running test:', err);
  } finally {
    chrome.kill();
  }
}

main();
