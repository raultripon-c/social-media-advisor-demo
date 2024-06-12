import React, { useState } from "react";

import searchIcon from "../../assets/images/searchIcon.svg";

import "./CustomSearchSidebar.scss";

const CustomSearch = (props: any) => {
  const { placeholder, searchText, onSearch, style } = props;
  let input;

  const [inputValue, setInputValue] = useState(searchText ? searchText : "");

  const handleChange = (event: any) => {
    setInputValue(event.target.value);
    onSearch && onSearch(event.target.value);
  };


  return (
    <div className="custom-search" style={style}>
      <input
        className="search-box-input"
        ref={(n) => (input = n)}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        size={placeholder?.length}
        onChange={handleChange}
      />
      <img
        id="search-img"
        className="cursor-pointer"
        style={{ background: "transparent" }}
        src={searchIcon}
        alt={"search-icon"}
      />
    </div>
  );
};

export default CustomSearch;
