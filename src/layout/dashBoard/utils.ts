import {
  getRegionBasedOnDcCode,
  getRegionWiseAccessApi,
} from "../../utils/object.utils";

export const API_METHOD = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
};

export const ALERT_TYPE_CODES = [
  "certificate_manager",
  "certificate_expiry",
  "idp_certificate_expiry_alert",
  "credential_expiry_alert",
];

export const getAlertMessage = (
  alertTypeCode: string,
  differenceInDays: any
) => {
  switch (alertTypeCode) {
    case "certificate_manager":
    case "certificate_expiry":
      if (differenceInDays <= 0) {
        return "SSL expired";
      }
      return differenceInDays
        ? `SSL about to expire in ${differenceInDays} ${
            differenceInDays > 1 ? "days" : "day"
          }`
        : "SSL about to expire";
    case "idp_certificate_expiry_alert":
      if (differenceInDays <= 0) {
        return "Idp Certificate expired";
      }
      return differenceInDays
        ? `SSO Certificate about to expire in ${differenceInDays} ${
            differenceInDays > 1 ? "days" : "day"
          }`
        : "SSO Certificate about to expire";
    case "credential_expiry_alert":
      if (differenceInDays <= 0) {
        return "Credential expired";
      }
      return differenceInDays
        ? `Credential about to expire in ${differenceInDays} ${
            differenceInDays > 1 ? "days" : "day"
          }`
        : "Credential about to expire";
    default:
      return "About to Expire";
  }
};

export const extractNameFromEmail = (email: any) => {
  // Split the email by "@" symbol
  const parts = email.split("@");

  // Extract the name part and split it by "." symbol
  const nameParts = parts[0].split(".");

  // Capitalize the first letter of each word in the name
  const formattedName = nameParts
    .map((part: any) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formattedName || "Servicehub User";
};

// Format the dates in the desired format
export const formatDate = (date: any) => {
  if (date) {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    const seconds = String(parsedDate.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

export const apmFormattedDate = (date: Date) => {
  // Function to pad numbers with leading zeros if needed
  const pad = (num: any) => {
    return num < 10 ? "0" + num : num;
  };

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
};

export const getChildObject = (
  parent: any,
  childPath: any,
  actualResult = false
) => {
  let childObject = _.get(parent, childPath);
  if (actualResult) {
    return childObject;
  } else {
    return childObject || "";
  }
};

export const getChildOrDefault = (
  parent: any,
  childPath: any,
  defaultValue: any
) => {
  let childObject = _.get(parent, childPath);
  if (childObject === null) {
    return defaultValue;
  }
  return childObject;
};

export const getDataFromResponse = (parent: any, childPath: string) => {
  if (childPath.startsWith("$")) {
    let childObject = _.get(parent, childPath.substring(1));
    if (childObject === null) {
      return "";
    }
    return childObject;
  } else {
    return childPath;
  }
};

export const getAccessApiUrl = (
  partnerDcCode: any,
  ALL_DC_CODES: any,
  REGION_WISE_ACCESS_APIs: any,
  dcRegion: any
) => {
  let REGION_ACCESS_API: any;

  if (partnerDcCode) {
    const partnerRegion = getRegionBasedOnDcCode(ALL_DC_CODES, partnerDcCode);
    REGION_ACCESS_API = getRegionWiseAccessApi(
      REGION_WISE_ACCESS_APIs,
      partnerRegion
    );
  } else {
    REGION_ACCESS_API = getRegionWiseAccessApi(
      REGION_WISE_ACCESS_APIs,
      dcRegion
    );
  }
  return REGION_ACCESS_API;
};

export const getGreetingByTime = () => {
  // Get the current date and time
  const currentTime = new Date();

  // Get the hour of the day (0-23)
  const currentHour = currentTime.getHours();

  // Define the greetings based on the time of day
  let greeting;

  if (currentHour >= 0 && currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Evening";
  }

  return greeting;
};

export const getFormattedActivityLogDate = (milliseconds: any) => {
  const date = new Date(milliseconds);

  const options = { month: "short", day: "2-digit", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate;
};

export const getIconBgColor = (index: number) => {
  const bgColorArray = ["#FFFAE6", "#E6F9F3", "#EAE8FB"];

  return bgColorArray[index % 3];
};

export const getDateDifference = (
  expiryDateString: any,
  isSinceDate?: boolean
) => {
  // Get the current date
  const currentDate = new Date();

  // Convert the expiry date string to a Date object
  const expiryDate = new Date(expiryDateString);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = isSinceDate
    ? currentDate - expiryDate
    : expiryDate - currentDate;

  // Convert milliseconds to days
  const differenceInDays = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60 * 24)
  );
  return differenceInDays;
};
