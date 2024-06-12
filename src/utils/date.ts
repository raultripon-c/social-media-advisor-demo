const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const moment=require('moment-timezone');
const formatDate = (date: string | undefined) => {
  if (date) {
    const parsedDate = new Date(date);
    return `${months[parsedDate.getMonth()]} ${parsedDate.getDate()}, ${parsedDate.getFullYear()}`;
  } return '';
};

export default formatDate;

export const FormatDateTime = (date: string | undefined) => {
  if (date) {
    const parsedDate = new Date(date);
    let year = parsedDate.getFullYear().toString().slice(-2);
    let hours = ("0" + parsedDate.getHours()).slice(-2);
    let minutes = ("0" + parsedDate.getMinutes()).slice(-2);
    return months[parsedDate.getMonth()] + " " + parsedDate.getDate() + " " + "’" + year + " at " + hours + ":" + minutes;
  } return '';
};

export const gmtToEst = (cell: any):any => {    
  var checkdate = new Date(cell);
  var jun = moment(checkdate);       
  return jun.tz('America/New_York').format(`MMM D 'YY \\at HH:mm`);
};

export const gmtToEstNew = (cell: any):any => {    
  var checkdate = new Date(cell);
  var jun = moment(checkdate);       
  return jun.tz('America/New_York').format(`MMM D, YYYY`);
};
export const customDateTimeFormat = (inputDate: string) => {
  const date = new Date(inputDate);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get month, day, year, hours, and minutes
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Pad single digit day and minutes with leading zeros
  const paddedDay = day < 10 ? "0" + day : day;
  const paddedMinutes = minutes < 10 ? "0" + minutes : minutes;

  // Format the date string
  const formattedDate = `${month} ${paddedDay}, ${year} ${hours}:${paddedMinutes}`;
  return formattedDate;
};



