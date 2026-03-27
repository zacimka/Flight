const https = require('https');
const fs = require('fs');
const readline = require('readline');

// URL for OurAirports public domain data
const url = 'https://davidmegginson.github.io/ourairports-data/airports.csv';
const outputFile = 'airports.json';
const tempCsv = 'temp_airports.csv';

console.log('Downloading airports data...');
const file = fs.createWriteStream(tempCsv);

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download complete. Parsing CSV...');
    parseCSV();
  });
}).on('error', (err) => {
  fs.unlink(tempCsv, () => {});
  console.error('Error downloading:', err.message);
});

function parseCSV() {
  const results = [];
  const fileStream = fs.createReadStream(tempCsv);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let headers = [];

  rl.on('line', (line) => {
    // Basic CSV parser that handles quotes properly for a single line
    const values = [];
    let currentVal = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(currentVal);
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    values.push(currentVal);

    if (isFirstLine) {
      headers = values;
      isFirstLine = false;
      return;
    }

    // Extract relevant fields
    // Indexes based on standard OurAirports CSV format:
    // 1: ident (usually ICAO), 2: type, 3: name, 4: lat, 5: lon, 8: iso_country, 10: municipality, 13: iata_code
    // Sometimes index varies slightly, let's map by header for safety
    const row = {};
    headers.forEach((h, i) => {
        row[h.replace(/"/g, '')] = values[i];
    });

    const iata = row['iata_code'] || '';
    const icao = row['ident'] || '';
    const lat = parseFloat(row['latitude_deg']);
    const lon = parseFloat(row['longitude_deg']);
    const type = row['type'] || '';

    // Filter out closed airports and small heliports to make the list slightly leaner, 
    // or include all if requested. We will include major/medium/small airports.
    if (!type.includes('closed') && (iata !== '' || icao !== '')) {
      results.push({
        name: row['name'],
        city: row['municipality'],
        country: row['iso_country'],
        iata_code: iata,
        icao_code: icao,
        coordinates: {
          latitude: lat,
          longitude: lon
        }
      });
    }
  });

  rl.on('close', () => {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    fs.unlinkSync(tempCsv);
    console.log(`Successfully parsed and saved ${results.length} airports to ${outputFile}`);
  });
}
