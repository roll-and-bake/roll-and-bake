fetch('https://roll-and-bake.vercel.app?v=123').then(r => r.text()).then(html => console.log('Contains product:', html.includes('סינבון קינמון קלאסי')));
