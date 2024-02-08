const axios = require("axios");
const { getData } = require("./getData");

const checkOut = async (workOrderId, accessToken) => {
  const data = await getData(workOrderId, accessToken);
  const baseUrl = "https://api.servicechannel.com/v3/workorders";
  const locLatitude = data.LocLatitude;
  const locLongitude = data.LocLongitude;
  const checkOutData = {
    WorkTypeId: "1",
    PrimaryStatus: "InProgress",
    ExtendedStatus: "Incomplete",
    UserId: 296641,
    TechsCount: 1,
    Latitude: locLatitude,
    Longitude: locLongitude,
  };

  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Use the actual access token
    },
  };

  try {
    const response = await axios.post(
      `${baseUrl}/${workOrderId}/universalCheckOut`,
      checkOutData,
      requestOptions
    );
    console.log(
      `Checkout successful for workOrderId: ${workOrderId}`,
      response.data
    );
    return { workOrderId, success: true, data: response.data }; // Adjust the return value based on your needs
  } catch (error) {
    console.error(
      `Error performing checkout for work order ID ${workOrderId}:`,
      error.message
    );
    console.error(error.response?.data); // Providing more insight into the error
    return { workOrderId, success: false, error: error.message }; // Returning error details for handling
  }
};

module.exports = { checkOut };
