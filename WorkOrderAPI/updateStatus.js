const axios = require("axios");
const { getAccessToken } = require("../Auth/getAccessToken");

const updateStatus = async (workOrderId, accessToken) => {
  const baseUrl = `https://api.servicechannel.com/v3/workorders`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const response = await axios.put(
      `${baseUrl}/${workOrderId}/status`,
      {
        Status: {
          Primary: "IN PROGRESS",
          Extended: "DISPATCH CONFIRMED",
        },
      },
      { headers }
    );
    console.log(
      `Status update successful for workOrderId: ${workOrderId}`,
      response.data
    );
    return { workOrderId, status: "Updated" }; // Simplified response, adjust as needed
  } catch (error) {
    console.error(
      `Error updating status for workOrderId ${workOrderId}:`,
      error.message
    );
    console.error(error.response?.data); // Providing more insight into the error
    return { workOrderId, success: false, error: error.message }; // Returning error details for handling
  }
};

module.exports = { updateStatus };
