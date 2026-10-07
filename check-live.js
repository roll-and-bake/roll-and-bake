fetch('https://roll-and-bake.vercel.app?v=' + Date.now()).then(r => r.text()).then(html => console.log('Products found:', html.includes('סינבון')));
