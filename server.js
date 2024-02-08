const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const ExcelJS = require("exceljs");
require("dotenv").config();
const schedule = require("node-schedule");
const { getAccessToken } = require("./Auth/getAccessToken.js");
const { updateStatus } = require("./WorkOrderAPI/updateStatus");
const { checkIn } = require("./WorkOrderAPI/checkIn");
const { checkOut } = require("./WorkOrderAPI/checkOut");
const { daysMissed } = require("./WorkOrderAPI/daysMissed.js");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const PORT = 4000;

app.listen(PORT, () => console.log("Listening on port 4000"));

// PUT endpoint to update status for multiple objects
app.put("/update_status", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const workOrderIds = req.body.status_ids;
    if (
      !workOrderIds ||
      !Array.isArray(workOrderIds) ||
      workOrderIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid work_order_ids in the request body" });
    }
    const chunkSize = 100; // Process 100 work orders at a time
    const delay = 45000; // 45 seconds delay between chunks
    const results = await processInChunks(
      workOrderIds,
      updateStatus,
      accessToken,
      chunkSize,
      delay
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to add resolution to a work order
app.post("/resolution", async (req, res) => {
  const { workOrderIds } = req.body; // Expecting an array of IDs
  const accessToken = await getAccessToken(); // Assuming getAccessToken function is defined and available

  const responses = await Promise.all(
    workOrderIds.map(async (workorderId) => {
      const apiUrl = `https://api.servicechannel.com/v3/workorders/${workorderId}/resolution`;
      const requestOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const resolutionData = {
        Resolution: "Completed.",
      };
      try {
        const response = await axios.post(
          apiUrl,
          resolutionData,
          requestOptions
        );
        return { workorderId, success: true, resolutionId: response.data }; // Adjust based on actual API response structure
      } catch (error) {
        console.error(
          `Error adding resolution for work order ID ${workorderId}:`,
          error.message
        );
        return { workorderId, success: false, error: error.message };
      }
    })
  );

  res.json(responses);
});

// POST endpoint to perform check-in for multiple work orders
app.post("/check_in", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const workOrderIds = req.body.work_order_ids;
    console.log(workOrderIds);
    if (
      !workOrderIds ||
      !Array.isArray(workOrderIds) ||
      workOrderIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid work_order_ids in the request body" });
    }
    const chunkSize = 100; // Process 100 work orders at a time
    const delay = 45000; // 45 seconds delay between chunks
    const results = await processInChunks(
      workOrderIds,
      checkIn,
      accessToken,
      chunkSize,
      delay
    );
    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// POST endpoint to perform check-out for multiple work orders
app.post("/check_out", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const workOrderIds = req.body.work_order_ids;
    console.log(workOrderIds);
    if (
      !workOrderIds ||
      !Array.isArray(workOrderIds) ||
      workOrderIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid work_order_ids in the request body" });
    }

    const chunkSize = 100; // Process 100 work orders at a time
    const delay = 45000; // 45 seconds delay between chunks
    const results = await processInChunks(
      workOrderIds,
      checkOut,
      accessToken,
      chunkSize,
      delay
    );
    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

const processInChunks = async (
  items,
  processFunction,
  accessToken,
  chunkSize,
  delay
) => {
  let results = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((item) => processFunction(item, accessToken))
    );
    results = [...results, ...chunkResults];
    if (i + chunkSize < items.length) {
      // If there are more items to process
      console.log(`Waiting ${delay}ms before processing the next chunk...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return results;
};

const processInChunksSubs = async (
  groups,
  processFunction,
  accessToken,
  chunkSize,
  delay
) => {
  let groupResults = {};

  for (const [groupKey, items] of Object.entries(groups)) {
    let results = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);

      console.log(
        `Processing chunk: ${i / chunkSize + 1}, Group: ${groupKey}, Size: ${
          chunk.length
        }`
      );

      const chunkResults = await Promise.all(
        chunk.map(async (item) => {
          const daysOfWeekNum = item.daysOfWeek
            .split(",")
            .map((day) => parseInt(day.trim(), 10));

          // Ensure the async operation is awaited and results are captured
          return processFunction(item.workOrderId, daysOfWeekNum, accessToken);
        })
      );


      results = [...results, ...chunkResults];

      if (i + chunkSize < items.length) {
        console.log(
          `Waiting ${delay}ms before processing the next chunk in group ${groupKey}...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    groupResults[groupKey] = results;
  }

  return groupResults; // Ensure this is what's being returned
};

// Function to fetch data for a given ID
async function fetchDataById(id) {
  const accessToken = await getAccessToken();
  const apiUrl = `https://api.servicechannel.com/v3/workorders/${id}/notes?paging=1%3A9999`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}, URL: ${apiUrl}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Function to process data for a list of IDs and count occurrences (limited to 30 iterations)
async function countOccurrencesForIdList(idList) {
  const results = [];

  for (const id of idList) {
    const jsonArray = await fetchDataById(id);

    if (jsonArray && Array.isArray(jsonArray.Notes)) {
      let occurrences = 0;

      for (const note of jsonArray.Notes) {
        const noteDataValue = note.NoteData;

        // Check if noteDataValue contains a specific set of text
        if (
          noteDataValue &&
          noteDataValue.includes("to <b>IN PROGRESS/ON SITE</b>.")
        ) {
          occurrences += 1;
        }
      }

      // Add the number of occurrences for the current ID to results
      results.push({ id, occurrences });
    }
  }

  return results;
}

async function readAndGroupExcelFile(excelPath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const worksheet = workbook.getWorksheet(1); // Assuming data is in the first worksheet

  const groups = {};
  worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
    if (rowNumber > 1) {
      const workOrderId = row.getCell(18).value;
      const daysOfWeek = row.getCell(5).value;
      const sweepingSubs = row.getCell(10).value; // Assuming "Sweeping Subs" is in the third column

      if (!groups[sweepingSubs]) {
        groups[sweepingSubs] = [];
      }

      groups[sweepingSubs].push({ workOrderId, daysOfWeek });
    }
  });

  return groups;
}

// Handle GET request to check missed check-ins
app.get("/days_missed", async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    // Assuming the excelPath is correctly provided or determined here
    const excelPath = "Sweeping_and_Portering_work_orders_2024.xlsx";
    const groups = await readAndGroupExcelFile(excelPath);
    const chunkSize = 50; // Process 100 work orders at a time
    const delay = 45000; // 45 seconds delay between chunks
    const groupResults = await processInChunksSubs(
      groups,
      daysMissed,
      accessToken,
      chunkSize,
      delay
    );
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Missed Dates");

    // Define the column headers
    worksheet.columns = [
      { header: "Work Order Number", key: "workOrderId", width: 20 },
      { header: "Missed Dates (MM/DD)", key: "missedDates", width: 30 },
      { header: "Sweeping Subs", key: "sweepingSubs", width: 30 }, // New column for Sweeping Subs
    ];

    Object.entries(groupResults).forEach(([groupName, workOrders]) => {
      workOrders.forEach((workOrder) => {
        worksheet.addRow({
          workOrderId: workOrder.workOrderId,
          missedDates: workOrder.missedDates.join(", "),
          sweepingSubs: groupName, // Assuming you want to label each row with its group name
        });
      });
    });

    // Then, write the Excel file as before
    const excelFileName = "missed_dates.xlsx";
    const filePath = `./${excelFileName}`;

    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel file written to ${filePath}`);

    // Set headers and stream the file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${excelFileName}`
    );
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Failed to create or send Excel file:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// POST endpoint to check occurrences for a list of work order IDs
app.post("/check_occurrences", async (req, res) => {
  const workOrderIds = req.body.workOrderIds;

  if (
    !workOrderIds ||
    !Array.isArray(workOrderIds) ||
    workOrderIds.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid workOrderIds in the request body" });
  }

  try {
    const results = await countOccurrencesForIdList(workOrderIds);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error counting occurrences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Auto check in scheduler
const job = schedule.scheduleJob("0 4 * * 2", async () => {
  const accessToken = await getAccessToken();

  // Replace with the actual work order ID you want to check
  const workOrderId = 267468264;

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

    // Check if the time difference is greater than 10 hours (in milliseconds)
    const tenHoursInMilliseconds = 10 * 60 * 60 * 1000;
    if (timeDifference > tenHoursInMilliseconds) {
      // Perform the check-in because the most recent check-in was over 10 hours ago
      console.log("Performing check-in");
      await checkIn(workOrderId, accessToken);
      await new Promise((resolve) => setTimeout(resolve, 24 * 60 * 1000)); // 24 minutes in milliseconds
      const accessToken = await getAccessToken();
      await checkOut(workOrderId, accessToken);
    } else {
      // Do not perform the check-in because the most recent check-in was within 10 hours
      console.log("Skipping check-in");
    }
  } else {
    // 'Value' property is an empty array, you may handle this case accordingly
    console.log("No check-ins found.");
    console.log("Performing check-in");
    await checkIn(workOrderId, accessToken);
    await new Promise((resolve) => setTimeout(resolve, 24 * 60 * 1000)); // 24 minutes in milliseconds
    accessToken = await getAccessToken();
    await checkOut(workOrderId, accessToken);
  }
});
// Snow Logs Fetch

// Function to fetch data for a given ID
async function fetchDataFromApi(workOrderNumber, accessToken) {
  const apiUrl = `https://api.servicechannel.com/v3/workorders/${workOrderNumber}`;
  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    const response = await fetch(apiUrl, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching data from the API for work order ${workOrderNumber}:`,
      error
    );
    return null;
  }
}

// Function to check if there is a "Check In" activity in the response
function hasCheckInActivity(checkInActivities) {
  return (
    checkInActivities &&
    checkInActivities.value &&
    checkInActivities.value.some((activity) => activity.Action === "Check In")
  );
}

// Function to fetch check-in activities from the specified API
async function fetchCheckInActivities(workOrderNumber, accessToken) {
  const apiUrl = `https://api.servicechannel.com/v3/odata/workorders(${workOrderNumber})/Service.CheckInActivity()?%24count=true`;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching check-in activities for work order ${workOrderNumber}:`,
      error
    );
    return null;
  }
}

// Function to fetch store information by LocationId
async function fetchStoreInfoByLocationId(locationId, accessToken) {
  const apiUrl = `https://api.servicechannel.com/v3/locations/${locationId}`;
  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Update with your actual access token
    },
  };

  try {
    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `Error fetching store info for LocationId ${locationId}:`,
      error
    );
    return null;
  }
}

// Function to process data for a list of work orders and extract specific properties
async function extractDataForWorkOrders(workOrderNumbers, accessToken) {
  const extractedData = [];

  // Split the work order numbers into chunks for parallel processing
  const chunkSize = 10; // Adjust as needed
  const workOrderChunks = [];
  for (let i = 0; i < workOrderNumbers.length; i += chunkSize) {
    const chunk = workOrderNumbers.slice(i, i + chunkSize);
    workOrderChunks.push(chunk);
  }

  // Process each chunk in parallel
  for (const chunk of workOrderChunks) {
    const promises = chunk.map(async (workOrderNumber) => {
      try {
        const apiObject = await fetchDataFromApi(workOrderNumber, accessToken);
        if (!apiObject) {
          console.warn(
            `Work order with number ${workOrderNumber} not found in the API response.`
          );
          return null;
        }

        // Fetch store information using LocationId from apiObject
        const locationId = apiObject.Location.Id;
        const storeInfo = await fetchStoreInfoByLocationId(
          locationId,
          accessToken
        );

        // Fetch check-in activities
        const checkInActivities = await fetchCheckInActivities(
          workOrderNumber,
          accessToken
        );

        // Check if there is a "Check In" activity
        const hasCheckIn = hasCheckInActivity(checkInActivities, accessToken);

        return extractProperties(apiObject, storeInfo, hasCheckIn);
      } catch (error) {
        console.error(
          `Error fetching and processing data for work order ${workOrderNumber}:`,
          error
        );
        return null;
      }
    });

    // Wait for all promises in the chunk to resolve
    const chunkData = await Promise.all(promises);
    extractedData.push(...chunkData.filter(Boolean)); // Filter out null values
  }

  return extractedData;
}

// Helper function to extract specific properties from the API response
function extractProperties(matchingItem, storeInfo, hasCheckIn) {
  const createdAt = matchingItem.CallDate
    ? new Date(matchingItem.CallDate)
    : null;

  const formattedDate = createdAt ? createdAt.toLocaleDateString() : "N/A";

  const formattedTime = createdAt
    ? createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "N/A";

  const ampm = createdAt
    ? createdAt.toLocaleTimeString([], { hour12: true }).split(" ")[1]
    : "N/A";

  const problemDescription = matchingItem.Description || "N/A";
  const problemDescriptionParts = problemDescription.split(
    /NO \/|YES \/|N \/|Y \//
  );

  return {
    Date: formattedDate,
    Time: formattedTime,
    AMPM: ampm,
    Subscriber: matchingItem.Subscriber?.Name,
    StoreId: matchingItem.Location.StoreId,
    LocationCity: storeInfo?.City || "N/A",
    LocationState: storeInfo?.State || "N/A",
    WorkOrderNumber: matchingItem.Number || "N/A",
    ProblemDescription:
      problemDescriptionParts.length > 1
        ? problemDescriptionParts[1].trim()
        : "N/A",
    Resolution: matchingItem.Resolution,
    Caller: matchingItem.Caller || "N/A",
    HasCheckIn: hasCheckIn,

    // Add more properties as needed
  };
}

// Function to convert data to CSV format and write to a file
function convertToCSVAndWriteToFile(data, fileName) {
  const header = Object.keys(data[0]).join(",");
  const rows = data.map((item) =>
    Object.values(item)
      .map((value) => `"${value}"`)
      .join(",")
  );
  const csvContent = `${header}\n${rows.join("\n")}`;

  fs.writeFileSync(fileName, csvContent, "utf8");
}

// Function to fetch data for a list of work orders and log the result

const workOrderNumbers = [
  267631147, 267632050, 267633910, 267633931, 267634883, 267635653, 267635658,
  267635659, 267635660, 267635732, 267640170, 267643055, 267697058, 267698989,
  267710491, 267730646, 267730655, 267774711, 267775137, 267777566, 267778266,
  267778966, 267780278, 267780579, 267784686, 267788675, 267788885, 267788992,
  267790979, 267791907, 267823963, 267824039, 267824358, 267825350, 267827624,
  267828174, 267830106, 267834064, 267834185, 267838363, 267846077, 267870213,
  267885430, 267911512, 267911538, 267911928, 267911997, 267912965, 267914056,
  267918127, 267918642, 267918678, 267921061, 267953769, 268075772, 268077415,
  268426621, 268496033, 268679134, 268703854,

  /* ... add more work order numbers ... */
]; // Your array of work order numbers
// Function to fetch data for a list of work orders in chunks with a delay
async function fetchDataInChunksWithDelay(
  workOrderNumbers,
  chunkSize,
  delayBetweenChunks
) {
  const accessToken = await getAccessToken();
  const totalChunks = Math.ceil(workOrderNumbers.length / chunkSize);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = (chunkIndex + 1) * chunkSize;
    const chunk = workOrderNumbers.slice(start, end);

    try {
      const extractedData = await extractDataForWorkOrders(chunk, accessToken);
      console.log(`Processed chunk ${chunkIndex + 1}/${totalChunks}`);

      // Append data to the Excel file
      extractedData.forEach((item) => {
        worksheet.addRow(Object.values(item));
      });

      console.log(
        `Data for chunk ${chunkIndex + 1} has been appended to the Excel file`
      );

      // Wait for the specified delay between chunks
      if (chunkIndex < totalChunks - 1) {
        console.log(
          `Waiting for ${
            delayBetweenChunks / 1000
          } seconds before the next chunk...`
        );
        await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks));
      }
    } catch (error) {
      console.error(`Error processing chunk ${chunkIndex + 1}:`, error);
    }
  }

  // Save the workbook to a file
  await workbook.xlsx.writeFile("output.xlsx");
  console.log("Excel file saved as output.xlsx");
}

// Specify the chunk size and delay between chunks
const chunkSize = 75;
const delayBetweenChunks = 60000; // 1 minute in milliseconds

// Call the main function to fetch data in chunks with a delay
// fetchDataInChunksWithDelay(workOrderNumbers, chunkSize, delayBetweenChunks);

// fetchDataById();
