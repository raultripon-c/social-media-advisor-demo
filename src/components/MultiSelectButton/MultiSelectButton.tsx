import React, { useState, useEffect } from "react";
import checkedIcon from "../../assets/svg/check.svg";

interface MultiSelectButtonsProps {
  options: string[];
  initialSelected?: string[];
  onSelectionChange: (selected: string[]) => void;
}

const MultiSelectButtons: React.FC<MultiSelectButtonsProps> = ({
  options,
  initialSelected = [],
  onSelectionChange,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelected);

  useEffect(() => {
    setSelectedOptions(initialSelected);
  }, [initialSelected]);

  const handleButtonClick = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];

    setSelectedOptions(newSelection);
    onSelectionChange(newSelection);
  };

  return (
    <div>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleButtonClick(option)}
          style={{
            backgroundColor: selectedOptions.includes(option) ? "#EAE8FB" : "",
            color: "black",
            border: "1px solid #8C95A8",
            borderRadius: "5px",
            padding: "8px 16px",
            margin: "4px",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {selectedOptions.includes(option) && (
            <span style={{ marginRight: "8px" }}>
              <img src={checkedIcon} alt="Checked Icon"></img>
            </span>
          )}
          {option}
        </button>
      ))}
    </div>
  );
};

export default MultiSelectButtons;
