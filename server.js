const express = require("express");

const app = express();
const fs = require('fs');
const PORT = 4000;
const idList = [259919050,259919051,259919052,259919053,259919054,259919055,259919056,259919057,259919058,259919059,259919060,259919061,259919062,259919063,259919064,259919065,259919066,259919067,259919068,259919069,259919070,259919071,259919072,259919073,259919074,259919075,259919076,259919077,259919078,259919079,259919080,259919081,259919082,259919083,259919084,259919085,259919086,259919087,259919088,259919089,259919090,259919091,259919092,259919093,259919094,259919095,259919096,259919097,259919098,259919099,259919100,259919101,259919102,259919103,259919104,259919105,259919106,259919107,259919108,259919109,259919110,259919111,259919112,259919113,259919114,259919115,259919116,259919117,259919118,259919119,259919120,259919121,259919616,259919617,259919618,259919619,259919620,259919621,259919622,259919623,259919624,259919625,259920281,259920282,259920283,259920284,259920285,259920286,259920287,259920288,259920289,259920290,259920291,259920292,259920293,259920294,259920295,259920296,259920297,259920298,259920299,259920300,259920301,259920302,259920303,259920304,259920305,259920306,259920307,259920308,259920309,259920310,259920311,259920312,259920313,259920314,259920315,259920316,259920317,259920318,259920319,259920320,259920321,259920322,259920323,259920324,259920325,259920326,259920327,259920328,259920329,259920330,259920331,259920332,259920333,259920334,259920335,259920336,259920337,259920338,259920339,259920340,259920341,259920342,259920343
]
app.listen(PORT, () => console.log("Listening on port 4000"));

var myHeaders = new Headers();
myHeaders.append("content", "application/x-www-form-urlencoded");
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
myHeaders.append(
  "Authorization",
  "Bearer gAAAAFlwlMOM6hUXkBg-PQQFSPULBSPdSvVxTUzr3rzkfPMOctzUVyK1aX_xb1BCUCfRyo9Kx6f0egQbRe_IbeKg1uDxLzPtace358y6Vh5EKuch8eOBZfriViO1K9MBCM2kC6ikx-1Ya7mSQuYWYDwHEJmc9KQnTnc73B_blITG9_fQpAEAAIAAAAB3wRRMqnKOuARGro5miIj7YFJNbeNF5xtzSwwOLHFrlkp0brCAJsCN3NvDB4A4RW-F8CJ_OvTqXpOLwPVwptb6X49dQ2JqtNUKaRLCJv6WLr4MjruaI2U-PpJDt_eWc4kbPm4t1ktJFcEanliRs452DE9Ea8bJYcJjGECuPYAiLpm_kET1HfLrDUQbVxN_OESfXCIuoKTo7YnTuxlM3LqpJLlaGx54C5Fpjipb10_Wowjiwa_j9d7jdtZUvlGP4ZZLfWtJ-_QU7U6jb-evt3aZ6Y2XxC0d2mSJzylFn1u4Ctc5D_H6ddciNFZ9S7QBfips2vcq7PvJoZ4XA8SaC7Pwd3dmw4qXv4y3oV7mWEHjDMGQRJuCVrvZDeblYMydNy8c3r5NxdulfO_Im64kcQveUnQ2e6em56-4KdF8xa9XPCNxY9DBr-7InjNfOnr_9FIDpKzYBivNvLUAMGd_2Xn0x6izUi8sx-r3kNuhc8XPX_PWM0x9WcRNX09aYs18WRKO-ES8YpQbXnhbhndAj2_oX7wymXrRzMrhn2LY98bnWQ"
);
myHeaders.append(
  "Cookie",
  "_scglauth_sb2=kK1x2FmV2VUjNZWAH6NhdqW35vZDoNqrnW7WbrS+bU4=; fb_localization_sb2=en; sc_auth_SB2=7C638B6DE57873E3FE972E6C7446859500EF1AECE85C70146A6F4F80A7C4A40D6EFE08653EE5F6F6542222E7956CB6EFD8F08CC58B08614CB83C553BDC01012C63A1D61D76A9393A05AA2E5EAAC0A767AFE853990F8CFFB11B3B478FEB2B492A471C90514DA73AA56BADDF1A3ED09B17F3440C1A823280D61DF7139E259B2C01C0A6DCE02C30BC81EBA7486CBE6C894C95606C305D2C297A7A1CD7F2096A813C882B0C181531A294BF12CE8FB49C2E2B5A856871D15E8BAC9BBEC19CC02102825F18279B14E0CACDA39E0AA02F4D91B3E6FC4332"
);

var urlencoded = new URLSearchParams();
urlencoded.append(
  "refresh_token",
  "fVOr!IAAAAAg15zgoNM6SJqSwTrYcC_F-XoXv-KTCan9MUBXYrImS8QAAAAH3VAuGmV8mu8HYKUY1nOQUs-ucen-j6RsAalTIlozZ_wlTERH0QdWojxzQ0nG4vaGFyWH03Ttz5lH4ICh4PFJZvc3qqiWroW414V0xMEA5CSrQ01xaola3QRZ5kOeljr_vmQaNTjnZk9FGSWgOJnPvAQ-e7txzCPirFfo0xUr6grbC5rwuuWUi9wnvbxp3KtR4lpdgs-R_Or_EUZ5biz1ZqrTmavG0d9q7UKr4qLuzNr3FGrlDicn2roOMP2dgl8tlb3riF8ZcdZcl3IKAfhCWoBsHy8Y0O019O65P45YZkC3M7rG3_YVJ1AdHTOOz_yU"
);
urlencoded.append("grant_type", "refresh_token");

var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};


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