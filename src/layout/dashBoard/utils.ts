
export const getFullDate = (date: any) => {
  const dateParts = date.split('-');
  let newDate = `${dateParts[0]}-`;
  
  if (dateParts[1] && dateParts[1].length === 1) {
    newDate += `0${dateParts[1]}`;
  } else {
    newDate += dateParts[1];
  }
  
  newDate += '-';
  
  if (dateParts[2] && dateParts[2].length === 1) {
    newDate += `0${dateParts[2]}`;
  } else {
    newDate += dateParts[2];
  }
  
  return newDate;
};
