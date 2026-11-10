const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const candidates = [
  { name: 'roots_peeling.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Cassava_roots_for_peeling.jpg' },
  { name: 'roots_peeling_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Cassava_roots_for_peeling_1.jpg' },
  { name: 'roots_peeling_2.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Cassava_roots_for_peeling_2.jpg' },
  { name: 'roots_peeling_4.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Cassava_roots_for_peeling_4.jpg' },
  { name: 'tubers_01.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Cassava_tubers_01.jpg' },
  { name: 'tubers.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Cassava_tubers.jpg' },
  { name: 'raiz_yuca.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Ra%C3%ADz_yuca.jpg' },
  { name: 'dsc07325.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Manihot_esculenta_dsc07325.jpg' },
  { name: 'kaduna_market.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Cassava_at_monday_market_kaduna_state_Nigeria_01.jpg' },
  { name: 'fresh_garden.png', url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Fresh_cassava_harvest_in_a_garden.png' }
];

const dir = path.resolve('public/images/test_cassava');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

candidates.forEach(c => {
  const dest = path.join(dir, c.name);
  try {
    execSync(`curl.exe -s -A "YucaPlatform/1.0 (admin@yucachain.com)" -L "${c.url}" -o "${dest}"`);
    const size = fs.statSync(dest).size;
    console.log('Downloaded', c.name, size, 'bytes');
  } catch (e) {
    console.error(c.name, e.message);
  }
});
console.log('Finished downloading candidates.');

