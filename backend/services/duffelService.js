const { Duffel } = require('@duffel/api');

const token = process.env.DUFFEL_API_KEY || 'duffel_test_dummy_key';
const duffel = new Duffel({ token });

console.log(`[Duffel] API Service Initialized.`);

module.exports = duffel;
