const axios = require('axios');
require("dotenv").config();

const getAccessToken = async () => {
  const authHeaders = {
    'Authorization': process.env.CLIENT_ID,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const urlencoded = new URLSearchParams();
  urlencoded.append('username', process.env.USER);
  urlencoded.append('password', process.env.PASS);
  urlencoded.append('grant_type', 'password');

  const tokenEndpoint = 'https://login.servicechannel.com/oauth/token';

  try {
    const response = await axios.post(tokenEndpoint, urlencoded.toString(), { headers: authHeaders });
    console.log(response.data.access_token)
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to obtain access token:", error);
    throw error; // Propagate error to be handled by the caller
  }
};

module.exports = { getAccessToken };