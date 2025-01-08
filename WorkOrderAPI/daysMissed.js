const { getData } = require("./getData");
const axios = require("axios");

// Function to count missed days for check-ins for a list of work orders
async function daysMissed(missedDaysId, daysOfWeekNum, accessToken) {
  // Ensure daysOfWeekNum is an array of numbers
  if (!Array.isArray(daysOfWeekNum) || daysOfWeekNum.some(isNaN)) {
    throw new Error("daysOfWeekNum must be an array of numbers");
  }

  // Validate missedDaysId and accessToken
  if (!missedDaysId) {
    throw new Error("missedDaysId is required");
  }
  if (!accessToken) {
    throw new Error("accessToken is required");
  }

  const workOrderCheckIns = await fetchCheckInsForWorkOrder(
    missedDaysId,
    accessToken
  );

  async function fetchCheckInsForWorkOrder(missedDaysId, accessToken) {
    try {
      const response = await axios.get(
        `https://api.servicechannel.com/v3/odata/workorders(${missedDaysId})/Service.CheckInActivity()`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        // Return the check-in data as an
        // array
        return response.data.value; // Assuming 'value' contains the check-in entries
      } else {
        throw new Error(
          `Failed to fetch check-ins. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        `Error fetching check-ins for work order ID ${missedDaysId}:`,
        error.message
      );
      return [];
    }
  }

  const locationData = await getData(missedDaysId, accessToken);
  const locLatitude = locationData.LocLatitude;
  const locLongitude = locationData.LocLongitude;

  const dates = getDatesForDaysOfWeek(daysOfWeekNum);
  const checkIns = findCheckIns(workOrderCheckIns);
  const { missedCheckIns, successfulCheckIns } =
    findMissedAndSuccessfulCheckIns(dates, checkIns, locLatitude, locLongitude);

  const result = {
    workOrderId: missedDaysId,
    missedDates: missedCheckIns,
    checkInDates: successfulCheckIns,
  };

  return result;
}

function getDatesForDaysOfWeek(daysOfWeekNum) {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear() - 1, 10, 25);

  const dates = [];

  while (startDate <= currentDate) {
    if (daysOfWeekNum.includes(startDate.getDay())) {
      // Create a date in local time and add it to the list
      const localDate = new Date(startDate);
      dates.push(localDate);
    }

    // Move to the next day
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
}

function extractCoordinates(callerId) {
  const regex = /GPS\(([^,]+),([^)]+)\)/;
  const match = regex.exec(callerId);
  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2]),
    };
  }
  return null; // Or you can throw an error if the format is always expected to be correct
}

function findCheckIns(workOrderCheckIns) {
  const checkIns = [];

  for (const entry of workOrderCheckIns) {
    if (entry.Action === "Check In" || entry.Action === "Check Out") {
      let coordinates = null;
      if (entry.Dnis !== "IVR" && entry.CallerId) {
        coordinates = extractCoordinates(entry.CallerId);
      }

      const checkInDate = new Date(entry.Date);
      checkIns.push({
        Date: checkInDate,
        Action: entry.Action,
        Type: entry.Dnis,
        Latitude: coordinates ? coordinates.latitude : null,
        Longitude: coordinates ? coordinates.longitude : null,
      });
    }
  }

  return checkIns;
}

function findMissedAndSuccessfulCheckIns(
  dates,
  checkIns,
  locLatitude,
  locLongitude
) {
  const successfulCheckIns = [];
  const missedCheckIns = [];
  console.log(locLatitude, locLongitude);
  console.log(dates)
  for (const date of dates) {
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`; // Format as "MM/DD"

    // Define the check-in window
    const dayStart = new Date(date);
    dayStart.setHours(12, 0, 0, 0); // 12 PM of the current day
    const priorDayEnd = new Date(date);
    priorDayEnd.setDate(priorDayEnd.getDate() - 1);
    priorDayEnd.setHours(16, 0, 0, 0); // 4 PM of the previous day

    // Find all check-ins within the time window
    const checkInsInWindow = checkIns.filter(
      (checkIn) =>
        checkIn.Date >= priorDayEnd &&
        checkIn.Date < dayStart &&
        checkIn.Action === "Check In"
    );

    if (checkInsInWindow.length > 0) {
      // Check if there's any check-in with matching coordinates
      const matchingCoordinatesCheckIn = checkInsInWindow.find(
        (checkIn) =>
          checkIn.Type !== "IVR" &&
          checkIn.Latitude === locLatitude &&
          checkIn.Longitude === locLongitude
      );

      // Check if there's any check-in with non-matching coordinates
      const nonMatchingCoordinatesCheckIn = checkInsInWindow.find(
        (checkIn) =>
          checkIn.Type === "IVR" ||
          checkIn.Latitude !== locLatitude ||
          checkIn.Longitude !== locLongitude
      );

      if (nonMatchingCoordinatesCheckIn) {
        successfulCheckIns.push(formattedDate);
      } else if (matchingCoordinatesCheckIn) {
        missedCheckIns.push(formattedDate);
      } else {
        missedCheckIns.push(formattedDate);
      }
    } else {
      missedCheckIns.push(formattedDate);
    }
  }

  // Remove duplicates
  const uniqueSuccessfulCheckIns = [...new Set(successfulCheckIns)];
  return { missedCheckIns, successfulCheckIns: uniqueSuccessfulCheckIns };
}

module.exports = { daysMissed };
