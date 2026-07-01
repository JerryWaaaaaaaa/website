import sharp from '/Users/jerrywang/Documents/projects/26-microsite/prototype/node_modules/sharp/lib/index.js';
const m=await sharp('/tmp/sheets-ctx2.png').metadata();
await sharp('/tmp/sheets-ctx2.png').extract({left:6, top:Math.round(m.height*0.16), width:330, height:Math.round(m.height*0.42)}).resize({width:900}).toFile('/tmp/zc-final.png');
console.log('ok');
