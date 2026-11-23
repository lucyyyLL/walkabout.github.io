// Renders demo.html frame by frame and encodes MP4 + GIF.
// Needs: npm i puppeteer-core ffmpeg-static (anywhere; point NODE_PATH at it) and Google Chrome.
// Usage:
//   node render.js                 full render -> ../../assets/media/walkabout-demo.{mp4,gif,jpg}
//   node render.js --stills 1,3,6  only save PNG stills at those seconds (for review)
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const puppeteer = require('puppeteer-core');
const ffmpeg = require('ffmpeg-static');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve(__dirname, '../../assets/media');
const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const STILL_DIR = process.env.STILL_DIR || path.join(__dirname, 'stills');

function run(cmd, argv) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('close', c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.error('[page error]', e.message));
  await page.goto('file:///' + path.join(__dirname, 'demo.html').replace(/\\/g, '/') + '?capture', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.ready);
  const { DUR, FPS } = await page.evaluate(() => ({ DUR: window.DUR, FPS: window.FPS }));

  const shot = async t => {
    await page.evaluate(t => window.renderFrame(t), t);
    return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  };

  if (stillsArg) {
    fs.mkdirSync(STILL_DIR, { recursive: true });
    for (const s of stillsArg.split(',').map(Number)) {
      fs.writeFileSync(path.join(STILL_DIR, `t${s.toFixed(2)}.png`), await shot(s));
      console.log('still', s);
    }
    await browser.close();
    return;
  }

  fs.mkdirSync(OUT, { recursive: true });
  const mp4 = path.join(OUT, 'walkabout-demo.mp4');
  const enc = spawn(ffmpeg, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) {
    const buf = await shot(i / FPS);
    if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once('drain', r));
    if (i % 30 === 0) console.log(`frame ${i}/${N}`);
  }
  enc.stdin.end();
  await new Promise(r => enc.on('close', r));
  await browser.close();

  // 720p web version, GIF and poster
  await run(ffmpeg, ['-y', '-i', mp4, '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, 'walkabout-demo-720p.mp4')]);
  await run(ffmpeg, ['-y', '-i', mp4, '-vf',
    'fps=15,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
    path.join(OUT, 'walkabout-demo.gif')]);
  await run(ffmpeg, ['-y', '-ss', '8.6', '-i', mp4, '-frames:v', '1', '-update', '1', '-q:v', '3', path.join(OUT, 'walkabout-demo.jpg')]);
  console.log('done ->', OUT);
})().catch(e => { console.error(e); process.exit(1); });
