
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


export const getLastUpdatedDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("en-us", {
    "day": "numeric",
    "year": "numeric",
    "month": "long",
  })
}

export const getGreetingMessage = () => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

export enum SelectorType {
  ID = 'id',
  CLASS = 'class'
}

export const removeElements = (
  tagType: 'style' | 'link',
  isSingle: boolean,
  selectorMap: Map<SelectorType, string>
) => {
  selectorMap.forEach((value, selectorType) => {
    if (isSingle) {
      if (selectorType === SelectorType.ID) {
        const element = document.getElementById(value);
        element?.remove();
      } else {
        const selector = `${tagType}.${value}`;
        const element = document.querySelector(selector);
        element?.remove();
      }
    } else {
      const selector = selectorType === SelectorType.ID 
        ? `${tagType}#${value}` 
        : `${tagType}.${value}`;
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => element.remove());
    }
  });
};

