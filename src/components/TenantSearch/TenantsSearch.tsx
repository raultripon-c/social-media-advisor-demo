import React from "react";

import searchIcon from "../../assets/images/search-grey.svg";
import clearIcon from "../../assets/images/cross-grey.svg";

import "./TenantsSearch.scss";

export const Search = (props: any) => {
  const {
    size = "small",
    placeholder,
    onSearchClick,
    onClearClicked,
    onValueChange,
    value = undefined,
    style,
    reference,
  } = props;

  // Function to determine class name based on size
  const getClassNameForSize = () => {
    switch (size) {
      case "small":
        return "txe-small";
      case "large":
        return "txe-large";
      default:
        return "txe-medium";
    }
  };

  // Rendering the search input and icons
  return (
    <div
      className={`ph-search-container ${getClassNameForSize()}`}
      style={style}
    >
      <div className="search-icon" onClick={onSearchClick}>
        <img src={searchIcon} className="search-icon-img" alt="search-icon" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => onValueChange(event)}
        placeholder={placeholder}
        className="search-input"
        ref={reference}
      />
      {value?.length > 0 && onClearClicked && (
        <div className="clear-icon" onClick={onClearClicked}>
          <img src={clearIcon} className="clear-icon-img" alt="clear-icon" />
        </div>
      )}
    </div>
  );
};
