const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs")

const app = express();

app.use(bodyParser.json());
app.use(cors());

const PORT = 4000;
const idList = [
  264389601,264389777,264389602,264389603,264389604,264389605,264389606,264389607,264389778,264389608,264389609,264389610,264389611,264389779,264389612,264389613,264389780,264389614,264389615,264389616,264389781,264389617,264389618,264389619,264389782,264389783,264389620,264389784,264389621,264389622,264389623,264389785,264389624,264389790,264389791,264389792,264389793,264389794,264388899,264388900,264388901,264388902,264388903,264388904,264388905,264388906,264388907,264389556,264389796,264389797,264389798,264389799,264389800,264389801,264389802,264389803,264389804,264389805,264389806,264389807,264389808,264389809,264389810,264389811,264389812,264389813,264389814,264389815,264389816,264389817,264389818,264389819,264389820,264389821,264389822,264389823,264389824,264389825,264389826,264389827,264389828,264389829,264389830,264389831,264389832,264389557,264389558,264389559,264389560,264389561,264389562,264389563,264389564,264389565,264389566,264389567,264389568,264389569,264389570,264389571,264389572,264389573,264389574,264389575,264389576,264389577,264389578,264389625,264389626,264389627,264389786,264389787,264389788,264389579,264389580,264389581,264389582,264389583,264389584,264389585,264389586,264389587,264389588,264389589,264389590,264389591,264389592,264389593,264389594,264389595,264389596,264389597,264389795,264389772,264389773,264389774,264389833,264389789,264389775,264389598,264389599,264389834,264389600,264389776,264389835

];

app.listen(PORT, () => console.log("Listening on port 4000"));

const myHeaders = new Headers();
myHeaders.append("content", "application/x-www-form-urlencoded");
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append(
  "Authorization",
  "Bearer gAAAAIKJTphYNajEsLtX2662_ZwZx4RSvTPt5wxoY4MTYrWfad3pwyt8BK3mIv3MrOvA8RaRtE5WoLSaIWddGyK1Jv_LzB6i7DEjb9Ke5giltJNd8BXPzpSxG_XJHgqL1cui5HrMkLVxqbyZ1oTiAJ-cgvZj6Sgh6UR2W5z5SAupQxZJpAEAAIAAAABcPlNR4Sf6VTOe5tElioL3wtGy8lBd7Fs1cFkG5P985TlyUpIhwiL6DbpfE4IFd6jxj7JuREoSRPt9jhIvu5lANo4Z9VwceLV2U6KCLnUdhzIseFWAxj_gIkBkwzzPggJBHO1HKWpXRKGZvl0FslcU8GjjUD4bnBl9-GhImLDxiZrUma12hhAL8U22DKFAffjSxAfQUr2tCBl5kVOcGiHPTG_ud4eMToMNRKWxinMkzV9CFyBUCsMF95i8Xu9_56R-EtO20lcH-hfTJ3qLPono8FgGjl3E9iqnlLMK3eA7K8jp_HefdhMiJSkfUXtofipho6vb24DIaB1dHmfGrc31oB9oHnqb89xJA_QXY1c0roTgPaLzmBPNYZ8Ylfrqs3c22Qg7ZNCzPxsnDXQICVhOPnyt12no9IrwGcswRj8XugYCaFYwQLKzjGBlBHaenzy4G00BLoSPAo0Sk7Xdf7mfQaNSfbej_chIyAtS6kBIt9SBt4tTvwmUJZM2tOLLbmOGR7E5p9XfrxO8XmiA8S-c46fiMhTOIGhgiru7gj-XJQ"
);
myHeaders.append(
  "Cookie",
  "_scglauth_sb2=kK1x2FmV2VUjNZWAH6NhdqW35vZDoNqrnW7WbrS+bU4=; fb_localization_sb2=en; sc_auth_SB2=7C638B6DE57873E3FE972E6C7446859500EF1AECE85C70146A6F4F80A7C4A40D6EFE08653EE5F6F6542222E7956CB6EFD8F08CC58B08614CB83C553BDC01012C63A1D61D76A9393A05AA2E5EAAC0A767AFE853990F8CFFB11B3B478FEB2B492A471C90514DA73AA56BADDF1A3ED09B17F3440C1A823280D61DF7139E259B2C01C0A6DCE02C30BC81EBA7486CBE6C894C95606C305D2C297A7A1CD7F2096A813C882B0C181531A294BF12CE8FB49C2E2B5A856871D15E8BAC9BBEC19CC02102825F18279B14E0CACDA39E0AA02F4D91B3E6FC4332"
);

var urlencoded = new URLSearchParams();
urlencoded.append(
  "refresh_token",
  "ZXgh!IAAAAAoYef40U00WWWtvzmqMQxRovmbfhFr3AaWn2zreuNHm8QAAAAHMuwjHHNp7tcXX5uRH73C388t1wEyMr0hWoDjJuh9MD9qxajVHukLoXKy6ZsEGsG4U89170kVxewJSMgjxbSvENK_q4-rpoblsYN7g2ipohXFlU3OKjS7cjosKeW7WixyhWGqrrhzB8mYJTNxm5VeZR5ArIiB5M0kceCIjZKJ7sowTJGRIadppJnr8lKAetD1XQdnL1Gw9EytTDiZSNs25gp5kV8w5r_38XSoXS2qlKg3QQ78U8sclVQeanVVkaEabLamwZqlWNPw1pwNIRTvQvRWlco8bHVVKt-ij1onMGM_Bx41Mi5TCWT7SepNrRf4"
);
urlencoded.append("grant_type", "refresh_token");

var requestOptions = {
  headers: myHeaders,
};

// PUT endpoint to update status for multiple objects
app.put("/update_status", async (req, res) => {
  const baseUrl = `https://api.servicechannel.com/v3/workorders`; // Update with the base URL

  const objectIds = req.body.object_ids;

  if (!objectIds || !Array.isArray(objectIds) || objectIds.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid object_ids in the request body" });
  }

  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer gAAAAIKJTphYNajEsLtX2662_ZwZx4RSvTPt5wxoY4MTYrWfad3pwyt8BK3mIv3MrOvA8RaRtE5WoLSaIWddGyK1Jv_LzB6i7DEjb9Ke5giltJNd8BXPzpSxG_XJHgqL1cui5HrMkLVxqbyZ1oTiAJ-cgvZj6Sgh6UR2W5z5SAupQxZJpAEAAIAAAABcPlNR4Sf6VTOe5tElioL3wtGy8lBd7Fs1cFkG5P985TlyUpIhwiL6DbpfE4IFd6jxj7JuREoSRPt9jhIvu5lANo4Z9VwceLV2U6KCLnUdhzIseFWAxj_gIkBkwzzPggJBHO1HKWpXRKGZvl0FslcU8GjjUD4bnBl9-GhImLDxiZrUma12hhAL8U22DKFAffjSxAfQUr2tCBl5kVOcGiHPTG_ud4eMToMNRKWxinMkzV9CFyBUCsMF95i8Xu9_56R-EtO20lcH-hfTJ3qLPono8FgGjl3E9iqnlLMK3eA7K8jp_HefdhMiJSkfUXtofipho6vb24DIaB1dHmfGrc31oB9oHnqb89xJA_QXY1c0roTgPaLzmBPNYZ8Ylfrqs3c22Qg7ZNCzPxsnDXQICVhOPnyt12no9IrwGcswRj8XugYCaFYwQLKzjGBlBHaenzy4G00BLoSPAo0Sk7Xdf7mfQaNSfbej_chIyAtS6kBIt9SBt4tTvwmUJZM2tOLLbmOGR7E5p9XfrxO8XmiA8S-c46fiMhTOIGhgiru7gj-XJQ", // Update with your actual access token
    },
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const promises = objectIds.map(async (objectId, index) => {
    const data = {
      Status: {
        Primary: "COMPLETED",
        Extended: "PENDING CONFIRMATION", // Example extended status, update as needed
      },
      Note: `done.`,
    };

    // Add a delay of 0.5 seconds between requests
    if (index > 0) {
      await delay(500);
    }

    try {
      const response = await axios.put(
        `${baseUrl}/${objectId}/status`,
        data,
        requestOptions
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating status for Object ID ${objectId}: ${error.message}`
      );
      return { error: `Error updating status for Object ID ${objectId}` };
    }
  });

  try {
    const responses = await Promise.all(promises);
    res.status(200).json(responses);
  } catch (error) {
    console.error(`Error making external PUT requests: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// // Function to fetch data for a given ID
// async function fetchDataById(id) {
//     const apiUrl = `https://api.servicechannel.com/v3/workorders/${id}/notes?paging=1%3A9999`;

//     try {
//       const response = await fetch(apiUrl, requestOptions);

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const data = await response.json();
//       return data; // Assuming the response is a JSON array
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       return null;
//     }
//   }

//  // Function to process data for a list of IDs and count occurrences (limited to 30 iterations)
// async function countOccurrencesForIdList(idList) {
//     for (const id of idList) {
//       const jsonArray = await fetchDataById(id);

//       if (jsonArray && Array.isArray(jsonArray.Notes)) {
//         let occurrences = 0;

//         for (const note of jsonArray.Notes) {
//           const noteDataValue = note.NoteData;

//           // Check if noteDataValue contains a specific set of text
//           if (noteDataValue && noteDataValue.includes('to <b>IN PROGRESS/ON SITE</b>.')) {
//             occurrences += 1;
//           }
//         }

//         // Log the number of occurrences for the current ID
//         console.log(`ID: ${id}, Occurrences: ${occurrences}`);
//       }
//     }
//   }

//   // Call the function
//   countOccurrencesForIdList(idList)
//     .catch(error => {
//       console.error('Error counting occurrences:', error);
//     });

// Snow Logs Fetch

const accessToken =
  "gAAAAIKJTphYNajEsLtX2662_ZwZx4RSvTPt5wxoY4MTYrWfad3pwyt8BK3mIv3MrOvA8RaRtE5WoLSaIWddGyK1Jv_LzB6i7DEjb9Ke5giltJNd8BXPzpSxG_XJHgqL1cui5HrMkLVxqbyZ1oTiAJ-cgvZj6Sgh6UR2W5z5SAupQxZJpAEAAIAAAABcPlNR4Sf6VTOe5tElioL3wtGy8lBd7Fs1cFkG5P985TlyUpIhwiL6DbpfE4IFd6jxj7JuREoSRPt9jhIvu5lANo4Z9VwceLV2U6KCLnUdhzIseFWAxj_gIkBkwzzPggJBHO1HKWpXRKGZvl0FslcU8GjjUD4bnBl9-GhImLDxiZrUma12hhAL8U22DKFAffjSxAfQUr2tCBl5kVOcGiHPTG_ud4eMToMNRKWxinMkzV9CFyBUCsMF95i8Xu9_56R-EtO20lcH-hfTJ3qLPono8FgGjl3E9iqnlLMK3eA7K8jp_HefdhMiJSkfUXtofipho6vb24DIaB1dHmfGrc31oB9oHnqb89xJA_QXY1c0roTgPaLzmBPNYZ8Ylfrqs3c22Qg7ZNCzPxsnDXQICVhOPnyt12no9IrwGcswRj8XugYCaFYwQLKzjGBlBHaenzy4G00BLoSPAo0Sk7Xdf7mfQaNSfbej_chIyAtS6kBIt9SBt4tTvwmUJZM2tOLLbmOGR7E5p9XfrxO8XmiA8S-c46fiMhTOIGhgiru7gj-XJQ"; // Update with your actual access token
const apiUrl = "https://api.servicechannel.com/v3/workorders";
// Function to fetch data for a given ID
async function fetchDataFromApi(workOrderNumber) {
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
async function fetchCheckInActivities(workOrderNumber) {
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
    console.error(`Error fetching check-in activities for work order ${workOrderNumber}:`, error);
    return null;
  }
}


// Function to fetch store information by LocationId
async function fetchStoreInfoByLocationId(locationId) {
  const apiUrl = `https://api.servicechannel.com/v3/locations/${locationId}`;
  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer gAAAAIKJTphYNajEsLtX2662_ZwZx4RSvTPt5wxoY4MTYrWfad3pwyt8BK3mIv3MrOvA8RaRtE5WoLSaIWddGyK1Jv_LzB6i7DEjb9Ke5giltJNd8BXPzpSxG_XJHgqL1cui5HrMkLVxqbyZ1oTiAJ-cgvZj6Sgh6UR2W5z5SAupQxZJpAEAAIAAAABcPlNR4Sf6VTOe5tElioL3wtGy8lBd7Fs1cFkG5P985TlyUpIhwiL6DbpfE4IFd6jxj7JuREoSRPt9jhIvu5lANo4Z9VwceLV2U6KCLnUdhzIseFWAxj_gIkBkwzzPggJBHO1HKWpXRKGZvl0FslcU8GjjUD4bnBl9-GhImLDxiZrUma12hhAL8U22DKFAffjSxAfQUr2tCBl5kVOcGiHPTG_ud4eMToMNRKWxinMkzV9CFyBUCsMF95i8Xu9_56R-EtO20lcH-hfTJ3qLPono8FgGjl3E9iqnlLMK3eA7K8jp_HefdhMiJSkfUXtofipho6vb24DIaB1dHmfGrc31oB9oHnqb89xJA_QXY1c0roTgPaLzmBPNYZ8Ylfrqs3c22Qg7ZNCzPxsnDXQICVhOPnyt12no9IrwGcswRj8XugYCaFYwQLKzjGBlBHaenzy4G00BLoSPAo0Sk7Xdf7mfQaNSfbej_chIyAtS6kBIt9SBt4tTvwmUJZM2tOLLbmOGR7E5p9XfrxO8XmiA8S-c46fiMhTOIGhgiru7gj-XJQ", // Update with your actual access token
    },
  };

  try {
    const response = await fetch(apiUrl, requestOptions);
    ;
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
async function extractDataForWorkOrders(workOrderNumbers) {
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
        const apiObject = await fetchDataFromApi(workOrderNumber);
        if (!apiObject) {
          console.warn(`Work order with number ${workOrderNumber} not found in the API response.`);
          return null;
        }

        // Fetch store information using LocationId from apiObject
        const locationId = apiObject.Location.Id;
        const storeInfo = await fetchStoreInfoByLocationId(locationId);

        // Fetch check-in activities
        const checkInActivities = await fetchCheckInActivities(workOrderNumber);

        // Check if there is a "Check In" activity
        const hasCheckIn = hasCheckInActivity(checkInActivities);

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

  const formattedDate = createdAt
    ? createdAt.toLocaleDateString()
    : "N/A";

  const formattedTime = createdAt
    ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "N/A";

  const ampm = createdAt
    ? createdAt.toLocaleTimeString([], { hour12: true }).split(' ')[1]
    : "N/A";

    const problemDescription = matchingItem.Description || "N/A";
    const problemDescriptionParts = problemDescription.split(/NO \/|YES \/|N \/|Y \//);

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

  fs.writeFileSync(fileName, csvContent, 'utf8');
}

// Function to fetch data for a list of work orders and log the result

const workOrderNumbers = [
    260400901,260604481,260607746,261238367,261249844,261267034,261325525,261398217,262213017,262217492,262217923,262269838,262501261,262547273,262553934,262589960,262595126,262595169,262595275,262602113,262647083,262647990,262672314,262674971,262676648,262685137,262686304,262694799,263227848,263313475,263314264,263317797,263392754,263392913,263393129,263393599,263394025,263394992,263441372,263442910,263445679,263471570,263471796,263472324,263472406,263472627,263481565,263525505,263704167,263708130,263753859,263754121,263756236,263756833,263899441,263902477,263905757,263928670,263928730,264098472,264317658,264320974,264323167,264385153,264622255,264667483,264673919,264695224,264695660,264695806,264696282,264696303,264772444,264772631,265337369,265522531,265552417,265570103,265614804,265616600,265618768,265626399,265653917,265723825,265815137,265819214,265828045,265828600,265829380,265829929,265831961,265833077,265833655,265853325,265854541,265854593,265854929,265855689,265855824,265857655,265858344,265858970,265859880,265860506,265860778,265861354,265861662,265862472,265864245,265864262,265866257,265867362,265870481,265870891,265871235,265871546,265872669,265872836,265873974,265873984,265874168,265874330,265875043,265876436,265900245,265900329,265900613,265900630,265900743,265900815,265900905,265901138,265901192,265901220,265901256,265901384,265901430,265901538,265901703,265901712,265901793,265902078,265902117,265902502,265902594,265902656,265902964,265903296,265903706,265903847,265903958,265904527,265905531,265905690,265906315,265906433,265906513,265906756,265906909,265907037,265907647,265907760,265908593,265909048,265909388,265910330,265912170,265912599,265916340,265924880,265954041,265954746,265954844,265956711,265957119,265957402,265957432,265958330,265958538,265958933,265958999,265959211,265961094,265961491,265961972,265963876,265963879,265964577,265964920,265964921,265965824,265967425,265967495,265986216,265986780,265987010,265987023,265987134,265989048,265989235,265989559,265989585,265989615,265990054,265990253,265992796,265994522,266016116,266021599,266035963,266040490,266052221,266056463,266057032,266057622,266071997,266091540,266094304




    /* ... add more work order numbers ... */,
  ]; // Your array of work order numbers
// Function to fetch data for a list of work orders in chunks with a delay
async function fetchDataInChunksWithDelay(workOrderNumbers, chunkSize, delayBetweenChunks) {
  const totalChunks = Math.ceil(workOrderNumbers.length / chunkSize);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = (chunkIndex + 1) * chunkSize;
    const chunk = workOrderNumbers.slice(start, end);

    try {
      const extractedData = await extractDataForWorkOrders(chunk);
      console.log(`Processed chunk ${chunkIndex + 1}/${totalChunks}`);

      // Convert data to CSV format
      const csvContent = extractedData
        .map(item => Object.values(item).map(value => `"${value}"`).join(","))
        .join("\n");

      // Append data to the CSV file
      fs.appendFileSync('output.csv', csvContent, 'utf8');

      console.log(`CSV data for chunk ${chunkIndex + 1} has been appended to output.csv`);

      // Wait for the specified delay between chunks
      if (chunkIndex < totalChunks - 1) {
        console.log(`Waiting for ${delayBetweenChunks / 1000} seconds before the next chunk...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenChunks));
      }
    } catch (error) {
      console.error(`Error processing chunk ${chunkIndex + 1}:`, error);
    }
  }
}

// Specify the chunk size and delay between chunks
const chunkSize = 50;
const delayBetweenChunks = 60000; // 1 minute in milliseconds

// Call the main function to fetch data in chunks with a delay
fetchDataInChunksWithDelay(workOrderNumbers, chunkSize, delayBetweenChunks);

// fetchDataById()