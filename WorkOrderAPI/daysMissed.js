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
  
  const { missedCheckIns, successfulCheckIns } = findMissedAndSuccessfulCheckIns(dates, checkIns);

  const totalExpectedCheckIns = dates.length;

  const result = {
    workOrderId: missedDaysId,
    missedDates: missedCheckIns,
    checkInDates: successfulCheckIns,
    totalExpectedCheckIns: totalExpectedCheckIns,
  };
  return result;
}

function getDatesForDaysOfWeek(daysOfWeekNum) {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 3, 29);
  console.log(startDate)
  const dates = [];
  console.log(dates)

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

function findCheckIns(workOrderCheckIns) {
  const checkIns = [];

  for (const entry of workOrderCheckIns) {
    if (entry.Action === "Check In") {
      // Use the check-in date directly without timezone adjustment
      const checkInDate = new Date(entry.Date);
      checkIns.push({
        Date: checkInDate,
      });
    }
  }

  return checkIns;
}
function findMissedAndSuccessfulCheckIns(dates, checkIns) {
  const successfulCheckIns = [];
  const missedCheckIns = [];

  dates.forEach(date => {
      // Format the date to "MM/DD"
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

      // Calculate 12pm of the current date
      const dayStart = new Date(date.setHours(12, 0, 0, 0));

      // Calculate 3pm of the prior day
      const priorDay = new Date(date);
      priorDay.setDate(priorDay.getDate() - 1);
      const dayPriorEnd = new Date(priorDay.setHours(15, 0, 0, 0));

      const checkInFound = checkIns.some(checkIn => {
          const checkInDate = new Date(checkIn.Date);
          return checkInDate >= dayPriorEnd && checkInDate < dayStart;
      });

      if (!checkInFound) {
          missedCheckIns.push(formattedDate);
      } else {
          successfulCheckIns.push(formattedDate);
      }
  });

  // Remove duplicates
  const uniqueSuccessfulCheckIns = [...new Set(successfulCheckIns)];

  return { missedCheckIns, successfulCheckIns: uniqueSuccessfulCheckIns };
}

module.exports = { daysMissed };
