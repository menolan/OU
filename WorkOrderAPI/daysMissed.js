const axios = require("axios");
const {getData} = require("./getData")


// Function to count missed days for check-ins for a list of work orders
async function daysMissed(missedDaysId, daysOfWeekNum, accessToken) {
  // Ensure daysOfWeekNum is an array of numbers
  if (!Array.isArray(daysOfWeekNum) || daysOfWeekNum.some(isNaN)) {
    throw new Error('daysOfWeekNum must be an array of numbers');
  }

  // Validate missedDaysId and accessToken
  if (!missedDaysId) {
    throw new Error('missedDaysId is required');
  }
  if (!accessToken) {
    throw new Error('accessToken is required');
  }

  const workOrderCheckIns = await fetchCheckInsForWorkOrder(missedDaysId, accessToken);

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
        // Return the check-in data as an array
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
  const { missedCheckIns, successfulCheckIns } = findMissedAndSuccessfulCheckIns(dates, checkIns, locLatitude, locLongitude);

  const result = {
    workOrderId: missedDaysId,
    missedDates: missedCheckIns,
    checkInDates: successfulCheckIns,
  };

  return result;
}

function getDatesForDaysOfWeek(daysOfWeekNum) {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 4, 27); // January 29th of the current year

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
      longitude: parseFloat(match[2])
    };
  }
  return null; // Or you can throw an error if the format is always expected to be correct
}

function findCheckIns(workOrderCheckIns) {
  const checkIns = [];

  for (const entry of workOrderCheckIns) {
    if (entry.Action === "Check In" || entry.Action === "Check Out") {
      const coordinates = extractCoordinates(entry.CallerId);
      if (coordinates) {
        const checkInDate = new Date(entry.Date);
        checkIns.push({
          Date: checkInDate,
          Action: entry.Action,
          Latitude: coordinates.latitude,
          Longitude: coordinates.longitude,
        });
      }
    }
  }

  return checkIns;
}

function findMissedAndSuccessfulCheckIns(dates, checkIns, locLatitude, locLongitude) {
  const successfulCheckIns = [];
  const missedCheckIns = [];

  const checkInMap = new Map();

  for (const date of dates) {
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`; // Format as "MM/DD"

    // Define the check-in window
    const dayStart = new Date(date);
    dayStart.setHours(12, 0, 0, 0); // 12 PM of the current day
    const priorDayEnd = new Date(date);
    priorDayEnd.setDate(priorDayEnd.getDate() - 1);
    priorDayEnd.setHours(15, 0, 0, 0); // 3 PM of the previous day

    // First check if there's any check-in within the window
    const checkInFound = checkIns.some(checkIn => {
      return checkIn.Date >= priorDayEnd && checkIn.Date < dayStart && checkIn.Action === "Check In";
    });

    if (checkInFound) {
      // Now check if there's a check-in with matching coordinates to the location
      const checkInWithMatchingCoordinates = checkIns.find(checkIn => {
        return (
          checkIn.Date >= priorDayEnd &&
          checkIn.Date < dayStart &&
          checkIn.Action === "Check In" &&
          checkIn.Latitude === locLatitude &&
          checkIn.Longitude === locLongitude
        );
      });

      if (checkInWithMatchingCoordinates) {
        missedCheckIns.push(formattedDate);
      } else {
        successfulCheckIns.push(formattedDate);
      }
    } else {
      missedCheckIns.push(formattedDate);
    }
  }

  // Remove duplicates
  const uniqueSuccessfulCheckIns = [...new Set(successfulCheckIns)];
  return { missedCheckIns, successfulCheckIns: uniqueSuccessfulCheckIns }; // Corrected return statement
}

module.exports = { daysMissed };