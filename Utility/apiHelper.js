const axios = require('axios');
require('dotenv').config();

async function fetchAPI1Data() {
  const response = await axios.get(process.env.API1_URL);
  return response.data;
}

async function fetchAPI2Data() {
  const response = await axios.get(process.env.API2_URL);
  return response.data;
}

module.exports = { fetchAPI1Data, fetchAPI2Data };