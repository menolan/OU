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
  delay,
  daysOfWeek
) => {
  let results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((item) => processFunction(item, daysOfWeek, accessToken))
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

// Handle POST request to check missed check-ins
app.post("/days_missed", async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    // Extract data from the request body
    const { missedDaysIds, daysOfWeek } = req.body;
    console.log(missedDaysIds);
    const chunkSize = 5; // Process 100 work orders at a time
    const delay = 1000; // 45 seconds delay between chunks
    const results = await processInChunks(
      missedDaysIds,
      daysMissed,
      accessToken,
      chunkSize,
      delay,
      daysOfWeek
    );
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Missed Dates");

    // Define the column headers
    worksheet.columns = [
      { header: "Work Order Number", key: "workOrderId", width: 20 },
      { header: "Missed Dates (MM/DD)", key: "missedDates", width: 30 },
    ];

    // Add data to the worksheet
    results.forEach((row) => {
      worksheet.addRow(row);
    });

    // Generate the Excel file
    const excelFileName = "missed_dates.xlsx";
    const filePath = `./${excelFileName}`;

    workbook.xlsx.writeFile(filePath).then(() => {
      // Send the generated Excel file as a response
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
    });
  } catch (error) {
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
// // Snow Logs Fetch

// const accessToken =
//   "gAAAAFfsgqylAV5OYSSO04RDzZzouG2GTxZMIqTBML2m7zlWD0r7t1Ni_Myepi5iuWNfP93TdQPSXzMkm3OgqvKfnpStcrB2Rg149rYKeouI_rAoeZK3OQswHUVMLOuUw9GY2uRmxmclgAYAuHPHkxN55iByNvnTlRVKdv5Sh7ZRYTUQpAEAAIAAAABWYJ3trbNhaPytMWR6eysTc_jDPSVJkrlSb1xwqsjiREhsUT8t6cTA-X7P8oX--AFRTBmNBjf01zK3axIowWAE942IQwA5RD9FbiL43kuWOjU869tJnwQQp61e2kpEl6DQU-dml2WpxV9Mtv6OSW-tzghwqh5R042IRkRYW05m8d3aBwJCXVzbMwd4yE1ZlP0foKiTIcZY9Aiut3eVlGmqUSKo-kIK85Qv-Ki3St3bwvlkLE4JgpKr95_vUNFK24YeDXoaUNivmjGTqt3UoHXQ7eSILFodPkkPtYVFpDgl3c-iGchA77NWiSaS2Vr-GdOCn33ALpkVkqmfO18hS5-x2VziFsoMj9A8ssYIuhtpWY-af3omAhn0ZJdB4ftyjkhWUycb9w-VNxHyon9nCQh15mTBN2-9Zca-FQuQ2Nes0BCEtKOYxCfLY99dS-I1E_26FZ7CTreoYarsg9dIO5oa1iW05dP0Bu4ZgwRpcwmD6EiHdnBPdCagtc5yQ0-kejGruhBtRAwkKdeUPwfEo4TWWPgVm8wbNDYk1w4gb-V58Q"; // Update with your actual access token
// const apiUrl = "https://api.servicechannel.com/v3/workorders";
// // Function to fetch data for a given ID
// async function fetchDataFromApi(workOrderNumber) {
//   const apiUrl = `https://api.servicechannel.com/v3/workorders/${workOrderNumber}`;
//   const requestOptions = {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${accessToken}`,
//     },
//   };

//   try {
//     const response = await fetch(apiUrl, requestOptions);

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error(
//       `Error fetching data from the API for work order ${workOrderNumber}:`,
//       error
//     );
//     return null;
//   }
// }

// // Function to check if there is a "Check In" activity in the response
// function hasCheckInActivity(checkInActivities) {
//   return (
//     checkInActivities &&
//     checkInActivities.value &&
//     checkInActivities.value.some((activity) => activity.Action === "Check In")
//   );
// }

// // Function to fetch check-in activities from the specified API
// async function fetchCheckInActivities(workOrderNumber) {
//   const apiUrl = `https://api.servicechannel.com/v3/odata/workorders(${workOrderNumber})/Service.CheckInActivity()?%24count=true`;

//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${accessToken}`,
//   };

//   try {
//     const response = await fetch(apiUrl, { headers });
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(
//       `Error fetching check-in activities for work order ${workOrderNumber}:`,
//       error
//     );
//     return null;
//   }
// }

// // Function to fetch store information by LocationId
// async function fetchStoreInfoByLocationId(locationId) {
//   const apiUrl = `https://api.servicechannel.com/v3/locations/${locationId}`;
//   const requestOptions = {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization:
//         "Bearer ${accessToken}", // Update with your actual access token
//     },
//   };

//   try {
//     const response = await fetch(apiUrl, requestOptions);
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(
//       `Error fetching store info for LocationId ${locationId}:`,
//       error
//     );
//     return null;
//   }
// }

// // Function to process data for a list of work orders and extract specific properties
// async function extractDataForWorkOrders(workOrderNumbers) {
//   const extractedData = [];

//   // Split the work order numbers into chunks for parallel processing
//   const chunkSize = 10; // Adjust as needed
//   const workOrderChunks = [];
//   for (let i = 0; i < workOrderNumbers.length; i += chunkSize) {
//     const chunk = workOrderNumbers.slice(i, i + chunkSize);
//     workOrderChunks.push(chunk);
//   }

//   // Process each chunk in parallel
//   for (const chunk of workOrderChunks) {
//     const promises = chunk.map(async (workOrderNumber) => {
//       try {
//         const apiObject = await fetchDataFromApi(workOrderNumber);
//         if (!apiObject) {
//           console.warn(
//             `Work order with number ${workOrderNumber} not found in the API response.`
//           );
//           return null;
//         }

//         // Fetch store information using LocationId from apiObject
//         const locationId = apiObject.Location.Id;
//         const storeInfo = await fetchStoreInfoByLocationId(locationId);

//         // Fetch check-in activities
//         const checkInActivities = await fetchCheckInActivities(workOrderNumber);

//         // Check if there is a "Check In" activity
//         const hasCheckIn = hasCheckInActivity(checkInActivities);

//         return extractProperties(apiObject, storeInfo, hasCheckIn);
//       } catch (error) {
//         console.error(
//           `Error fetching and processing data for work order ${workOrderNumber}:`,
//           error
//         );
//         return null;
//       }
//     });

//     // Wait for all promises in the chunk to resolve
//     const chunkData = await Promise.all(promises);
//     extractedData.push(...chunkData.filter(Boolean)); // Filter out null values
//   }

//   return extractedData;
// }

// // Helper function to extract specific properties from the API response
// function extractProperties(matchingItem, storeInfo, hasCheckIn) {
//   const createdAt = matchingItem.CallDate
//     ? new Date(matchingItem.CallDate)
//     : null;

//   const formattedDate = createdAt ? createdAt.toLocaleDateString() : "N/A";

//   const formattedTime = createdAt
//     ? createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
//     : "N/A";

//   const ampm = createdAt
//     ? createdAt.toLocaleTimeString([], { hour12: true }).split(" ")[1]
//     : "N/A";

//   const problemDescription = matchingItem.Description || "N/A";
//   const problemDescriptionParts = problemDescription.split(
//     /NO \/|YES \/|N \/|Y \//
//   );

//   return {
//     Date: formattedDate,
//     Time: formattedTime,
//     AMPM: ampm,
//     Subscriber: matchingItem.Subscriber?.Name,
//     StoreId: matchingItem.Location.StoreId,
//     LocationCity: storeInfo?.City || "N/A",
//     LocationState: storeInfo?.State || "N/A",
//     WorkOrderNumber: matchingItem.Number || "N/A",
//     ProblemDescription:
//       problemDescriptionParts.length > 1
//         ? problemDescriptionParts[1].trim()
//         : "N/A",
//     Resolution: matchingItem.Resolution,
//     Caller: matchingItem.Caller || "N/A",
//     HasCheckIn: hasCheckIn,

//     // Add more properties as needed
//   };
// }

// // Function to convert data to CSV format and write to a file
// function convertToCSVAndWriteToFile(data, fileName) {
//   const header = Object.keys(data[0]).join(",");
//   const rows = data.map((item) =>
//     Object.values(item)
//       .map((value) => `"${value}"`)
//       .join(",")
//   );
//   const csvContent = `${header}\n${rows.join("\n")}`;

//   fs.writeFileSync(fileName, csvContent, "utf8");
// }

// // Function to fetch data for a list of work orders and log the result

// const workOrderNumbers = [
//   266803193,266805340,266806244,266806255,266807479,266807874,266808312,266809301,266810172,266811669,266816271,266816470,266818896,266858600,266860470,266860496,266863577,266864065,266865089,266865238,266865239,266865240,266866240,266866771,266867526,266870245,266875366,266880022,266880780,266896028,266926442,266956194,266966372,266966798,266967539,266968682,266970114,266971945,266972308,266972924,266973957,266974799,266976434,266977330,266978342,266982952,266983891,266984264,266985309,266987831,266989516,266990581,266990779,266996247,267006732,267006733,267006734,267006735,267006736,267006737,267006738,267006739,267006740,267006741,267006742,267006743,267006744,267006745,267006746,267006747,267006748,267006749,267006750,267006751,267006752,267006753,267006754,267006755,267010988,267015276,267015630,267016657,267020210,267020282,267021396,267021538,267022563,267024019,267025250,267027087,267027555,267037355,267041742,267043793,267045244,267045550,267046386,267046519,267046588,267046843,267047537,267048046,267048706,267048966,267051133,267051381,267053076,267053131,267054505,267054547,267055240,267055719,267060330,267061744,267065548,267066542,267069444,267070250,267073381,267090614,267091723,267093874,267094564,267147627,267150241,267157589,267160456,267169963,267207938,267230907,267232930,267237114,267237745,267294886,267309605,267340773,267400043,267401560,267401665,267402508,267402605,267402785,267402936,267402994,267403042,267403109,267403162,267403198,267403221,267403257,267403320,267403384,267403759,267403811,267403818,267403853,267403937,267403977,267404032,267404040,267404465,267405106,267405799,267405892,267406189,267408272,267408278,267408336,267409020,267410131,267410936,267452392,267453227,267455820,267457660,267458419,267460086,267460146,267460656,267461723,267463172,267513419,267514676,267514704,267515901,267516054,267516602,267522088,267523116

//   /* ... add more work order numbers ... */
// ]; // Your array of work order numbers
// // Function to fetch data for a list of work orders in chunks with a delay
// async function fetchDataInChunksWithDelay(
//   workOrderNumbers,
//   chunkSize,
//   delayBetweenChunks
// ) {
//   const totalChunks = Math.ceil(workOrderNumbers.length / chunkSize);

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Sheet 1');

//   for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
//     const start = chunkIndex * chunkSize;
//     const end = (chunkIndex + 1) * chunkSize;
//     const chunk = workOrderNumbers.slice(start, end);

//     try {
//       const extractedData = await extractDataForWorkOrders(chunk);
//       console.log(`Processed chunk ${chunkIndex + 1}/${totalChunks}`);

//       // Append data to the Excel file
//       extractedData.forEach((item) => {
//         worksheet.addRow(Object.values(item));
//       });

//       console.log(
//         `Data for chunk ${chunkIndex + 1} has been appended to the Excel file`
//       );

//       // Wait for the specified delay between chunks
//       if (chunkIndex < totalChunks - 1) {
//         console.log(
//           `Waiting for ${
//             delayBetweenChunks / 1000
//           } seconds before the next chunk...`
//         );
//         await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks));
//       }
//     } catch (error) {
//       console.error(`Error processing chunk ${chunkIndex + 1}:`, error);
//     }
//   }

//   // Save the workbook to a file
//   await workbook.xlsx.writeFile('output.xlsx');
//   console.log('Excel file saved as output.xlsx');
// }

// // Specify the chunk size and delay between chunks
// const chunkSize = 75;
// const delayBetweenChunks = 60000; // 1 minute in milliseconds

// // Call the main function to fetch data in chunks with a delay
// fetchDataInChunksWithDelay(workOrderNumbers, chunkSize, delayBetweenChunks);

fetchDataById();
