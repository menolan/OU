const axios = require("axios");

const checkIn = async (workOrderId, accessToken) => {

// Make an API call to get the work order history
const historyResponse = await axios.get(
    `https://api.servicechannel.com/v3/odata/workorders(267468264)/Service.CheckInActivity()`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const checkInData = historyResponse.value;

  if (Array.isArray(checkInData) && checkInData.length > 0) {
    // Find the most recent check-in entry
    const mostRecentCheckIn = checkInData
      .filter((entry) => entry.Action === "Check In")
      .reduce((prev, current) =>
        new Date(current.Date) > new Date(prev.Date) ? current : prev
      );

    // Calculate the time difference in milliseconds
    const currentTime = new Date();
    const checkInTime = new Date(mostRecentCheckIn.Date);
    const timeDifference = currentTime - checkInTime;

    const tenHoursInMilliseconds = 16 * 60 * 60 * 1000;
    if (timeDifference > tenHoursInMilliseconds) {
      // Perform the check-in because the most recent check-in was over 10 hours ago
      console.log("Performing check-in");


    } else {
        // Do not perform the check-in because the most recent check-in was within 10 hours
        console.log("Skipping check-in");
      }

    } else {
        // 'Value' property is an empty array, you may handle this case accordingly
        console.log("No check-ins found.");
    }

}