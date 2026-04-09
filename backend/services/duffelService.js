const { Duffel } = require('@duffel/api');

const duffel = new Duffel({
  token: process.env.DUFFEL_API_KEY || 'duffel_test_dummy_key',
});

console.log(`[Duffel] Initialized in ${duffel.token.startsWith('duffel_test_') ? 'TEST' : 'LIVE'} mode.`);

module.exports = duffel;
