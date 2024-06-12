import React from "react";
import "./Avatar.scss";

const getInitials = (userName: string) => {
  var names = userName?.trim().split(" "),
    initials = names && names[0].substring(0, 1).toUpperCase();

  if (names?.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

export const stringToHSLColor = (str: string, s, l) => {
  var hash = 0;
  for (var i = 0; i < str?.length; i++) {
    hash = str?.charCodeAt(i) + ((hash << 5) - hash);
  }

  var h = hash % 360;
  return "hsl(" + h + ", " + s + "%, " + l + "%)";
};

function getUsernameFromEmail(email: string) {
  // Split the email address by "@" symbol
  const parts = email.split("@")[0].split(".");

  // Capitalize the first letter of each part and join them with a space
  const formattedUsername = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return formattedUsername;
}

/**
 * Functional component for an Avatar
 * @param {string} userEmail - The user's email address used to derive initials
 * @param {number} size - The size of the avatar (in pixels)
 * @param {number} fontSize - The font size of the initials (in pixels)
 */
export const Avatar = ({ userEmail, size, fontSize, background }) => {
  // Object to hold styles for the avatar container and username
  let containerStyle = {};
  let userNameStyle = {};

  let userName = getUsernameFromEmail(userEmail);

  // Setting styles for the avatar container and username based on size and font size
  containerStyle["height"] = `${size}px`;
  containerStyle["width"] = `${size}px`;
  containerStyle["backgroundColor"] = background
    ? background
    : stringToHSLColor(userName, "30", "80");
  userNameStyle["height"] = `${size}px`;
  userNameStyle["width"] = `${size}px`;
  userNameStyle["fontSize"] = `${fontSize}px`;

  // Rendering the Avatar component
  return (
    <div className="avatar-container" style={containerStyle}>
      {/* Displaying the extracted initials from the username */}
      <div className="avatar-user-name" style={userNameStyle}>
        {/* Get initials from the user's email */}
        {getInitials(userName)}
      </div>
    </div>
  );
};
