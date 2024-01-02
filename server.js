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
  262158265,262159243,262158266,262158267,262158268,262158269,262158270,262158271,262159244,262158272,262158273,262158274,262158275,262159245,262158276,262158277,262159246,262158278,262158279,262158280,262159247,262158281,262158282,262158283,262159248,262159249,262158284,262159250,262158285,262158286,262158287,262159251,262158288,262159256,262159257,262159258,262159259,262159260,262158499,262158500,262158501,262158502,262158503,262158504,262158505,262158506,262158507,262158508,262159262,262159263,262159264,262159265,262159266,262159267,262159268,262159269,262159270,262159271,262159272,262159273,262159274,262159275,262159276,262159277,262159278,262159279,262159280,262159281,262159282,262159283,262159284,262159285,262159286,262159287,262159288,262159289,262159290,262159291,262159292,262159293,262159294,262159295,262159296,262159297,262159298,262158221,262158222,262158223,262158224,262158225,262158226,262158227,262158228,262158229,262158230,262158231,262158232,262158233,262158234,262158235,262158236,262158237,262158238,262158239,262158240,262158241,262158242,262158289,262158290,262158291,262159252,262159253,262159254,262158243,262158244,262158245,262158246,262158247,262158248,262158249,262158250,262158251,262158252,262158253,262158254,262158255,262158256,262158257,262158258,262158259,262158260,262158261,262159261,262158292,262159239,262159240,262159299,262159255,262159241,262158262,262158263,262159300,262158264,262159242,262159301

];

app.listen(PORT, () => console.log("Listening on port 4000"));

const myHeaders = new Headers();
myHeaders.append("content", "application/x-www-form-urlencoded");
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append(
  "Authorization",
  "Bearer gAAAAH2o6B8MaLQwe0fRUtI_KzWo6dcVqknpx8r4K41Sa4KihyQiGwhaTYxRSPYB8fxZT13ZtfxwTE_IxsGfWWa-IJYpvls4sIH-iRiao609JqAio-qg_PyoHe8x53tFkXlDAo6LSfW8_GOGp1MPibfyg5PzKUf4L5cZYfnu34BFKJZjpAEAAIAAAAAK-3tyZLE4fYri-BP7Tr8cs6OOcTkf9xYjMQFGHYiMeefUhw_-hcp3rzrs6eKi9dCpzeX9rQgnDaZgJ76ifYFPVhvK5w0VhG1FDQUEAtJTRX92s1EA4xnI9qeMqcfoZt8VqkUJxODMqzYEJ0WbrfcFz1ALks5yVBUdaUbhwOAC9PHOQl_GP2QwE6wJEDEWDpUeGfF2ybkW6dj7I6MPfWS1ETdQVlKUTl9WbVBXOYfK_XJGRm3ZLIpgnAlJTlj-m4pvAeXL1Ekk-yDAy4FS01xGg8tbJfr4pS87Xx127WrTy-Q5vYw-JGwlx6MavnTS7p4KABixM7UNhi5Vjo2ngCUJNI9gyKqlk3pKZu93ZEB9ThImAyXLzOCySeGBKgAa_wDUBsLD-QjRWIBgrJ4PzIH-11CDlsddh8xtJINtpOe7RxAycE-GjZ6i5IVN8sVxQ77IdjHy6vyU-Loq7lKW2YHdR5VvUGIi3QkCsFtBm8_bgBu6l10dY3iQQDQTfrweTn5r9f1yJtVrs0qtOzWM2ZjbVvYiJ1-Zs0nhNAritol_Kw"
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
        "Bearer gAAAABcT08FN6ruan77-trXaZ9WYPEEKULx7c21namnUtHM3sMuW1jfWfXFdB4AiS_NlTmIOJPGJi0eHHX5kQyBzAy5W5KoTk7dD5K1kEzNYfw6BbC1BmjYiNq0Mj2NA8G36zy6_hYZZWgDLMXHkhFP-dOTDZHHcUS5eHsCTcPaEmXW6pAEAAIAAAAA18BtgHd5VJKiT03y8kt8uf_hGXgCUeupreFMjrrZ7br0VaU9BjtFaHNZTt1faVJ_cSmWWtv3AvPPWN_4asL5BZ8Swt7o7vGnZFyL7Df0LmZ3vJX9GItsy4nmMCGNtQ3oPh3cnC0oozlZ5usbWAABtR12ZyFUZeqyD6tb2nvnoUUEiFBw0WOv7XC_IbjYXDkAPrskcY1Dk8bMc6TU9mWVGRF4mCC-o9FryXwpb80KUKr-SKxekkbDFSkwaJQjoFMr7vHvlozKPmsarWdM4f--E-OquNJ0LWPTyJN2nrwWPOY5MZSjX7CZFQwm6RuLLF6nergmhTfNmoSlfV8pxO30Rjn5fPfcyGH7-lev0PHzifP2RfaAvV2GAoHFSCZHcVhkdnstraNtNOtycOU4SYOtJDHxn4qUOT836FqjbcLmitebddRqckkXFguv189NklXVhwP-OTCqjG0Oc2VU8Wzp8v8a0WqEGAjZROTdKiqZcI5cVqLwBmPcLC6ejsGiQLZNu9mxHkWuQU7i-iEH5uscH01O2OjP5yGWlmRIGOpHqXw", // Update with your actual access token
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

// Function to fetch data for a given ID
async function fetchDataById(id) {
    const apiUrl = `https://api.servicechannel.com/v3/workorders/${id}/notes?paging=1%3A9999`;

    try {
      const response = await fetch(apiUrl, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data; // Assuming the response is a JSON array
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  }

 // Function to process data for a list of IDs and count occurrences (limited to 30 iterations)
async function countOccurrencesForIdList(idList) {
    for (const id of idList) {
      const jsonArray = await fetchDataById(id);

      if (jsonArray && Array.isArray(jsonArray.Notes)) {
        let occurrences = 0;

        for (const note of jsonArray.Notes) {
          const noteDataValue = note.NoteData;

          // Check if noteDataValue contains a specific set of text
          if (noteDataValue && noteDataValue.includes('to <b>IN PROGRESS/ON SITE</b>.')) {
            occurrences += 1;
          }
        }

        // Log the number of occurrences for the current ID
        console.log(`ID: ${id}, Occurrences: ${occurrences}`);
      }
    }
  }

  // Call the function
  countOccurrencesForIdList(idList)
    .catch(error => {
      console.error('Error counting occurrences:', error);
    });

// // Snow Logs Fetch

// const accessToken =
//   "gAAAABtOLCJG8V1M5qiWgcZukkSAmjGMlv4b6QgABxS8_GhL0MUNAEBgS_M-7YO5_M0QrZTWJnnT5heaHMGhuo5ispOrljUfvdrCuwyitgiFhnpZSRxHFFfVNy5KmFUiviudsbHzIsCeRtsnc_G99_FA-7nM7Sy2JUdb6B5K5BhLZf-3pAEAAIAAAACEMD0AEmyc6OrKFxlVmZI8LQNBGum_is_u_Q17WH2bQnXADgwYnOuxx16JnCTb3UpT2fiFmsyaZrpZH7lD8tSid3Yd9QPsl4ZgpmeXlRKDLpB__aH9L5dhOR-xCcCh9nM-qgUPFQCKYeYMsGHVFhjOv_ZivMdejjGIu7CAR0tO29HbFJMkprfMktjfmGzZPQK6LpHYH30YLkj1rqUyjS9bApoCcZ7tsY0erBRaEsRlm1O25X7BlbqZu6FszjHu2rC_OrkWwb3axQwMIX6XTc1BFfkK67afz4jufrfZKsGok8yUq1ymzOeEImSDEd9UreR1TYUS-2JFuxvOT_4QGRs5JC1hj6wzxzvebnES7Kz_dYnn5gFDRKdfDEFKrfwLJbaVCWcLB1RwhPJxN198foQsFbOOqvcN8iduVyDBfVJC2cHBQ7p2AM3wUcAMhy1P6b1fX5jjnKG1fmp0hX0rR5ejDsHFbLTuJRlraxQfJdkcFgPniiJSBZTyR0OXHJwffPTYPwGhNZHYZmj-cI4M0V8-TK6xZj6O1Wt8o5mOfCsp2A"; // Update with your actual access token
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

// // Function to fetch store information by LocationId
// async function fetchStoreInfoByLocationId(locationId) {
//   const apiUrl = `https://api.servicechannel.com/v3/locations/${locationId}`;
//   const requestOptions = {
//     headers: {
//       "Content-Type": "application/json",
//       Authorization:
//         "Bearer gAAAABtOLCJG8V1M5qiWgcZukkSAmjGMlv4b6QgABxS8_GhL0MUNAEBgS_M-7YO5_M0QrZTWJnnT5heaHMGhuo5ispOrljUfvdrCuwyitgiFhnpZSRxHFFfVNy5KmFUiviudsbHzIsCeRtsnc_G99_FA-7nM7Sy2JUdb6B5K5BhLZf-3pAEAAIAAAACEMD0AEmyc6OrKFxlVmZI8LQNBGum_is_u_Q17WH2bQnXADgwYnOuxx16JnCTb3UpT2fiFmsyaZrpZH7lD8tSid3Yd9QPsl4ZgpmeXlRKDLpB__aH9L5dhOR-xCcCh9nM-qgUPFQCKYeYMsGHVFhjOv_ZivMdejjGIu7CAR0tO29HbFJMkprfMktjfmGzZPQK6LpHYH30YLkj1rqUyjS9bApoCcZ7tsY0erBRaEsRlm1O25X7BlbqZu6FszjHu2rC_OrkWwb3axQwMIX6XTc1BFfkK67afz4jufrfZKsGok8yUq1ymzOeEImSDEd9UreR1TYUS-2JFuxvOT_4QGRs5JC1hj6wzxzvebnES7Kz_dYnn5gFDRKdfDEFKrfwLJbaVCWcLB1RwhPJxN198foQsFbOOqvcN8iduVyDBfVJC2cHBQ7p2AM3wUcAMhy1P6b1fX5jjnKG1fmp0hX0rR5ejDsHFbLTuJRlraxQfJdkcFgPniiJSBZTyR0OXHJwffPTYPwGhNZHYZmj-cI4M0V8-TK6xZj6O1Wt8o5mOfCsp2A", // Update with your actual access token
//     },
//   };

//   try {
//     const response = await fetch(apiUrl, requestOptions);
//     ;
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

//   for (const workOrderNumber of workOrderNumbers) {
//     try {
//       const apiObject = await fetchDataFromApi(workOrderNumber);
//       if (!apiObject) {
//         console.warn(
//           `Work order with number ${workOrderNumber} not found in the API response.`
//         );
//         continue;
//       }

//       // Fetch store information using LocationId from apiObject
//       const locationId = apiObject.Location.Id;
//       const storeInfo = await fetchStoreInfoByLocationId(locationId);

//       const extractedItem = extractProperties(apiObject, storeInfo);

//       extractedData.push(extractedItem);
//     } catch (error) {
//       console.error(
//         `Error fetching and processing data for work order ${workOrderNumber}:`,
//         error
//       );
//     }
//   }

//   return extractedData;
// }

// // Helper function to extract specific properties from the API response
// function extractProperties(matchingItem, storeInfo) {
//   const createdAt = matchingItem.CallDate
//     ? new Date(matchingItem.CallDate)
//     : null;

//   const formattedDate = createdAt
//     ? createdAt.toLocaleDateString()
//     : "N/A";

//   const formattedTime = createdAt
//     ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     : "N/A";

//   const ampm = createdAt
//     ? createdAt.toLocaleTimeString([], { hour12: true }).split(' ')[1]
//     : "N/A";

//     const problemDescription = matchingItem.Description || "N/A";
//     const problemDescriptionParts = problemDescription.split(/NO \/|YES \/|N \/|Y \//);

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

//   fs.writeFileSync(fileName, csvContent, 'utf8');
// }

// // Function to fetch data for a list of work orders and log the result
// async function fetchDataFromApiForWorkOrders() {
//   const workOrderNumbers = [
//     260400901,260604481,260607746,261238367,261249844,261267034,261325525,261398217,262213017,262217492,262217923,262269838,262501261,262547273,262553934,262589960,262595126,262595169,262595275,262602113,262647083,262647990,262672314,262674971,262676648,262685137,262686304,262694799,263227848,263313475,263314264,263317797,263392754,263392913,263393129,263393599,263394025,263394992,263441372,263442910,263445679,263471570,263471796,263472324,263472406,263472627,263481565,263525505,263704167,263708130,263753859,263754121,263756236,263756833,263899441,263902477,263905757,263928670,263928730,264098472,264317658,264320974,264323167,264385153,264622255,264667483,264673919,264695224,264695660,264695806,264696282,264696303,264772444,264772631


//     /* ... add more work order numbers ... */,
//   ]; // Your array of work order numbers

//   try {
//     const extractedData = await extractDataForWorkOrders(workOrderNumbers);
//     console.log(extractedData);

//     // Specify the file name (e.g., output.csv)
//     const fileName = 'output.csv';
    
//     // Convert data to CSV format and write to file
//     convertToCSVAndWriteToFile(extractedData, fileName);

//     console.log(`CSV data has been written to ${fileName}`);
//   } catch (error) {
//     console.error("Error fetching and processing data:", error);
//   }
// }

// // Call the main function to fetch data for a list of work orders


// // Call the main function to fetch data for a list of work orders
// fetchDataFromApiForWorkOrders();