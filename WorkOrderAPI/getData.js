const axios = require("axios");

const getData = async (workOrderId, accessToken) => {
  const apiUrl = `https://api.servicechannel.com/v3/workorders/${workOrderId}/GPSRadius`;
  

  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Use the actual access token
    },
  };

  try {
    const response = await axios.get(apiUrl, requestOptions);
    return response.data; // Assuming the response is in JSON format and contains the data you need
  } catch (error) {
    console.error("Error fetching data:", error);
    // Depending on your error handling strategy, you might want to throw the error or return null
    throw error; // This will allow the caller to handle the error appropriately
  }
};

module.exports = { getData };

