import React, { useEffect, useRef, useState } from "react";
import "./HeaderDropdown.scss"; // Import the CSS file
import expand from "../../assets/images/expand.svg";
import dashBoardIcon from "../../assets/images/dashboard/dashboard_left_menu_item.svg";
import arrowRight from "../../assets/images/dashboard/arrowRight.svg";

interface Option {
  value: string;
  label: string;
  icon?: any;
  link?: any;
}

const HeaderDropdown: React.FC<{
  options: Option[];
  value?: string;
  type?: string;
  onChange?: (value: string) => void;
}> = ({ options, value, onChange, type }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (selectedValue: string, event: any) => {
    onChange?.(selectedValue);
    setIsOpen(false);
    };
  const dropdownContentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        isOpen &&
        dropdownContentRef.current &&
        !dropdownContentRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);
  return (
    <div className={`${type} dropdown ${isOpen ? "open" : ""}`}>
      <button
        className={`dropdown-button ${value ? "" : "no-value"}`}
        onMouseDown={toggleDropdown}
      >
        {value || "Select a tenant"}
        <img src={expand} className="dropdown-arrow"></img>
      </button>
      {isOpen && (
        <div className="dropdown-content" ref={dropdownContentRef}>
          {options.map((option) => (
            <div
              className={`${type} each-option`}
              key={option.value}
              onClick={(event: any) => handleOptionChange(option.value, event)}
            >
              {option.icon && (
                <div className="dropdown-icon">
                  <img src={option.icon} alt="icon"></img>
                </div>
              )}
              <div className="option-content">
                <span className={`option-label ${type}`}>{option.label}</span>
                {option.link && (
                  <div className="option-link">{option.link.label}</div>
                )}
              </div>
              <img
                src={arrowRight}
                alt=""
                className={`navigation-arrow ${type}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderDropdown;
