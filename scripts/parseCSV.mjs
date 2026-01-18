import fs from 'fs/promises';
import Papa from 'papaparse';

const p = async () => {
  try {
    const text = await fs.readFile(new URL('../public/data/requests.csv', import.meta.url), 'utf8');
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    console.log('Parsed rows:', parsed.data.length);
    console.log('First row keys:', Object.keys(parsed.data[0] || {}).slice(0,20));
    console.log('Sample row:', parsed.data[0]);
  } catch (e) {
    console.error('Error parsing CSV:', e);
    process.exit(1);
  }
};

p();
