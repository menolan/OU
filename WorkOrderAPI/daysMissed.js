const axios = require("axios");

// Function to count missed days for check-ins for a list of work orders
async function daysMissed(missedDaysId, daysOfWeek, accessToken) {
  const daysOfWeekNum = daysOfWeek.map((day) => parseInt(day, 10));
  const workOrderCheckIns = await fetchCheckInsForWorkOrder(
    missedDaysId,
    accessToken
  );
  async function fetchCheckInsForWorkOrder(missedDaysId, accessToken) {
    console.log("fetching");
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
        `Error fetching check-ins for work order ID ${workOrderId}:`,
        error.message
      );
      return [];
    }
  }
  console.log(workOrderCheckIns, "work order checkins");
  console.log(daysOfWeekNum, "days of week");
  const dates = getDatesForDaysOfWeek(daysOfWeekNum);
  console.log(dates, "dates for days of week");
  const checkIns = findCheckIns(workOrderCheckIns);
  console.log(checkIns, "check in dates");
  const missedCheckIns = findMissedCheckIns(dates, checkIns);
  console.log(missedCheckIns);
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
