const axios = require("axios");

const checkPhotos = async (workOrderId, accessToken) => {
  console.log("in checkPhotos");
  const baseUrl = "https://api.servicechannel.com/v3/odata/workorders";

  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };
  try {
    // Fetch the work order details (assuming store number, city, and state are part of the response)
    const workOrderResponse = await axios.get(
      `https://api.servicechannel.com/v3/workorders/${workOrderId}`,
      requestOptions
    );

    const workOrderData = workOrderResponse.data;
    console.log(workOrderData);
    // Extract store information
    const storeId = workOrderData.Location.Id || "N/A"; // Fallback in case field is missing

    const storeIdResponse = await axios.get(
      `https://api.servicechannel.com/v3/locations/${storeId}`,
      requestOptions
    );
    const storeData = storeIdResponse.data;
    const storeNumber = storeData.StoreId || "N/A"; //
    const city = storeData.City || "N/A"; // Fallback in case field is missing
    const state = storeData.State || "N/A"; // Fallback in case field is missing

    const response = await axios.get(
      `${baseUrl}(${workOrderId})/attachments`,
      requestOptions
    );
    const names = response.data.value.map((item) => item.Name);
    // Check for duplicates
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    );
    const hasDuplicates = duplicates.length > 0;

    // Log or return the results
    console.log("All Names:", names);
    console.log("Duplicate Names:", [...new Set(duplicates)]);
    console.log(`Work order ${workOrderId} has duplicates: ${hasDuplicates}`);

    return {
      workOrderId,
      success: true,
      hasDuplicates,
      names,
      duplicates: [...new Set(duplicates)],
      state,
      storeNumber,
      city,
    };
  } catch (error) {
    console.error(
      `Error getting attachments for work order ID ${workOrderId}:`,
      error.message
    );
    console.error(error.response?.data); // Providing more insight into the error
    return { workOrderId, success: false, error: error.message }; // Returning error details for handling
  }
};

module.exports = { checkPhotos };
