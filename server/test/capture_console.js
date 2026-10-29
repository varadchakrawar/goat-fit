const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9222;

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--disable-gpu',
    'http://localhost:4200/workouts'
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  try {
    const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await listRes.json();

    const page = targets.find((t) => t.type === 'page' && t.url.includes('4200')) || targets[0];
    if (page) {
      const wsUrl = page.webSocketDebuggerUrl;
      console.log('Connecting to target:', page.url);

      const ws = new globalThis.WebSocket(wsUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 3, method: 'Network.enable' }));
        ws.send(JSON.stringify({ id: 4, method: 'Page.enable' }));
        ws.send(JSON.stringify({ id: 5, method: 'Page.navigate', params: { url: 'http://localhost:4200/workouts' } }));
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('EXCEPTION THROWN:', JSON.stringify(msg.params.exceptionDetails, null, 2));
        }
        if (msg.method === 'Runtime.consoleAPICalled') {
          console.log('CONSOLE [' + msg.params.type + ']:', msg.params.args.map((a) => a.value || a.description).join(' '));
        }
        if (msg.method === 'Network.responseReceived') {
          console.log('NETWORK RESPONSE:', msg.params.response.status, msg.params.response.url);
        }
        if (msg.id === 100) {
          console.log('DOM EVALUATION RESULT:', msg.result.result.value);
        }
      };

      // Wait 4 seconds for page and API request to complete
      await new Promise((r) => setTimeout(r, 4500));

      // Evaluate DOM state
      const evalScript = `
        (() => {
          const cards = document.querySelectorAll('.workout-card, .goat-card');
          const spinner = document.querySelector('.spinner-border');
          const headings = Array.from(document.querySelectorAll('h3, h4, h5')).map(h => h.textContent.trim());
          const navText = document.querySelector('header')?.innerText || '';
          const hasWad = navText.includes('WAD') || document.body.innerText.includes('WAD Syllabus');
          return JSON.stringify({
            cardCount: cards.length,
            spinnerPresent: !!spinner,
            headingsSample: headings.slice(0, 5),
            hasWadInNavOrBody: hasWad,
            bodySnippet: document.body.innerText.substring(0, 300)
          });
        })()
      `;

      ws.send(JSON.stringify({
        id: 100,
        method: 'Runtime.evaluate',
        params: { expression: evalScript }
      }));

      await new Promise((r) => setTimeout(r, 1500));
      ws.close();
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

main();
