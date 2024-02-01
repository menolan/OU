const axios = require("axios");
const { getAccessToken } = require("../Auth/getAccessToken");
const { getData } = require("./getData");



const checkIn = async (workOrderId, accessToken) => {
      const data = await getData(workOrderId, accessToken);
      const baseUrl = "https://api.servicechannel.com/v3/workorders";
      const locLatitude = data.LocLatitude;
      const locLongitude = data.LocLongitude;
      const checkInData = {
        WorkTypeId: 1,
        UserId: 296641,
        TechsCount: 1,
        Latitude: locLatitude,
        Longitude: locLongitude,
      };
      console.log(
        `Attempting to check-in for workorderId: ${workOrderId}`,
        checkInData
      ); // Debug check-in data
      try {
        const response = await axios.post(
          `${baseUrl}/${workOrderId}/universalCheckIn`,
          checkInData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log(
          `Check-in successful for workorderId: ${workOrderId}`,
          response.data
        ); // Debug successful response
        return { workOrderId, mechanicId: response.data.MechanicId };
      } catch (error) {
        console.error(
          `Error performing check-in for work order ID ${workOrderId}:`,
          error.message
        );
        console.error(error.response?.data); // Debug API error response
        return { workOrderId, success: false, error: error.message }; // Returning error details for handling
      }
    }

module.exports = { checkIn };
