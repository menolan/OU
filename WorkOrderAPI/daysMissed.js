const axios = require("axios");



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
  
  const dates = getDatesForDaysOfWeek(daysOfWeekNum);
  
  const checkIns = findCheckIns(workOrderCheckIns);
  
  const missedCheckIns = findMissedCheckIns(dates, checkIns);

  const result = {
    workOrderId: missedDaysId,
    missedDates: missedCheckIns,
  };
  return result;
}

function getDatesForDaysOfWeek(daysOfWeekNum) {
  const currentDate = new Date();
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

  const dates = [];

  while (twoMonthsAgo <= currentDate) {
    if (daysOfWeekNum.includes(twoMonthsAgo.getDay())) {
      // Create a date in local time and add it to the list
      const localDate = new Date(twoMonthsAgo);
      dates.push(localDate);
    }

    // Move to the next day
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() + 1);
  }

  return dates;
}

function findCheckIns(workOrderCheckIns) {
  const checkIns = [];

  for (const entry of workOrderCheckIns) {
    if (entry.Action === "Check In") {
      // Create a date in local time and add it to the list
      const checkInDate = new Date(entry.Date);
      const localCheckInDate = new Date(
        checkInDate.getTime() + checkInDate.getTimezoneOffset() * 60000
      );
      checkIns.push({
        Date: localCheckInDate,
      });
    }
  }

  return checkIns;
}
function findMissedCheckIns(dates, checkIns) {
  const missedCheckIns = [];

  for (const date of dates) {
    // Calculate 11am of the current date
    const currentDate = new Date(date);
    currentDate.setHours(11, 0, 0, 0);

    // Calculate 5pm of the prior day
    const priorDay = new Date(date);
    priorDay.setDate(priorDay.getDate() - 1);
    priorDay.setHours(17, 0, 0, 0);

    const dateStartTimestamp = currentDate.getTime();
    const priorDayEndTimestamp = priorDay.getTime();

    // Check if there is no check-in within the specified time frame for this date
    const noCheckInWithinTimeFrame = !checkIns.some((checkIn) => {
      const checkInTime = checkIn.Date.getTime();
      return (
        checkInTime >= priorDayEndTimestamp &&
        checkInTime <= dateStartTimestamp
       
      );
    });

    if (noCheckInWithinTimeFrame) {
      // Format the missed date to "MM/DD" and push it to the array
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
      missedCheckIns.push(formattedDate);
    }
  }

  return missedCheckIns;
}

module.exports = { daysMissed };
