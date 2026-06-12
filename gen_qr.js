const data = require('./qr_data.json');
const fs = require('fs');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>QR Codes - Name Card</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #f0f0f0;
    font-family: Arial, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    gap: 32px;
  }
  h1 { font-size: 12px; color: #666; letter-spacing: 3px; text-transform: uppercase; }
  .qr-pair { display: flex; gap: 60px; align-items: flex-start; }
  .qr-item { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .qr-wrap {
    position: relative;
    width: 200px;
    height: 200px;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
    overflow: hidden;
  }
  .qr-wrap img { width: 200px; height: 200px; display: block; }
  .qr-center {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 5px 9px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #111;
    white-space: nowrap;
  }
  .qr-label { font-size: 10px; color: #888; letter-spacing: 2px; text-transform: uppercase; }
  button {
    padding: 7px 18px;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border: 1px solid #444;
    background: white;
    cursor: pointer;
    border-radius: 2px;
  }
  button:hover { background: #333; color: white; }
  .note { font-size: 10px; color: #aaa; text-align: center; line-height: 1.7; }
</style>
</head>
<body>
<h1>Name Card — QR Codes</h1>
<div class="qr-pair">
  <div class="qr-item">
    <div class="qr-wrap">
      <img id="img-port" src="${data.port}" alt="Portfolio QR">
      <div class="qr-center">PORT.</div>
    </div>
    <span class="qr-label">Portfolio</span>
    <button onclick='dl("img-port","qr_portfolio.png","PORT.")'>Save PNG</button>
  </div>
  <div class="qr-item">
    <div class="qr-wrap">
      <img id="img-link" src="${data.link}" alt="LinkedIn QR">
      <div class="qr-center">LINKEDIN</div>
    </div>
    <span class="qr-label">LinkedIn</span>
    <button onclick='dl("img-link","qr_linkedin.png","LINKEDIN")'>Save PNG</button>
  </div>
</div>
<p class="note">Click Save PNG to download with the label baked in.<br>Error correction H — center text is safe to overlay.</p>
<script>
function dl(imgId, filename, label) {
  const img = document.getElementById(imgId);
  const c = document.createElement("canvas");
  c.width = 400; c.height = 400;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, 400, 400);
  const fs = 28;
  ctx.font = "bold " + fs + "px Arial";
  const tw = ctx.measureText(label).width;
  const cx = 200, cy = 200;
  const px = 16, py = 10;
  ctx.fillStyle = "white";
  ctx.fillRect(cx - tw/2 - px, cy - fs/2 - py, tw + px*2, fs + py*2);
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy);
  const a = document.createElement("a");
  a.download = filename;
  a.href = c.toDataURL("image/png");
  a.click();
}
</script>
</body>
</html>`;

fs.writeFileSync('./qr_namecard.html', html);
console.log('done');
