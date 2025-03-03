import React, { useState } from "react";
import segmentIcon from "../../../assets/svg/SegmentIcon.svg";
import "./SupportingMaterial.css";

interface SupportingMaterialOption {
  name: string;
  icon: string; // Adjust the type if needed
}

interface SupportingMaterialProps {
  options: SupportingMaterialOption[];
}

const suggestedSegments = [
  { icon: segmentIcon, title: "HealthCare Professionals 1" },
  { icon: segmentIcon, title: "HealthCare Professionals 2" },
  { icon: segmentIcon, title: "HealthCare Professionals 3" },
];

const SupportingMaterial: React.FC<SupportingMaterialProps> = ({ options }) => {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const [selectedSegments, setSelectedSegments] = useState<any>(suggestedSegments);

  const toggleSection = (name: string) => {
    if (openSections.includes(name)) {
      setOpenSections(openSections.filter((item) => item !== name));
    } else {
      setOpenSections([...openSections, name]);
    }
  };

  const filterSegments = (segment: any): void => {
    setSelectedSegments(selectedSegments.filter((item: any) => item.title !== segment.title));
  };

  const renderSectionContent = (option: string) => {
    switch (option) {
      case "Segments":
        return (
          <div className="option-section">
            {selectedSegments.map((segment: any) => (
              <div className="segment-item-container">
                <img src={segment.icon} alt={segment.title} />
                <span className="suggested-tag">Suggested</span>
                <span style={{ marginLeft: "10px" }}>{segment.title}</span>
                <span className="close-icon" style={{ marginLeft: "8px" }} onClick={() => filterSegments(segment)}>
                  &#10005;
                </span>
              </div>
            ))}
          </div>
        );
      case "Reference Page":
        return (
          <div className="option-section">
            <h3 className="reference-page-section-subheading">Reference Page and external links</h3>
            <div className="reference-page-part">Reference Page</div>
            <input
              className="reference-page-input"
              type="text"
              placeholder="Enter Page URL"
              value={"Sample Page Name"}
            />
            <div className="reference-page-part">External Link</div>
            <input
              className="reference-page-input"
              type="text"
              placeholder="Enter Link URL"
              value={"https://example.com"}
            />
          </div>
        );
      default:
        return (
          <div className="option-section">
            <h3>Default: {option} Details</h3>
            <p>This section contains detailed information about {option}.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="supporting-material-container">
        {options.map((option) => (
          <div
            key={option.name}
            className="supporting-material-item"
            style={{ backgroundColor: openSections.includes(option.name) ? "#E8EAEE" : "white" }}
          >
            <div
              className="option-header"
              onClick={() => toggleSection(option.name)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img src={option.icon} alt={option.name} />
              <span style={{ marginLeft: "8px" }}>{option.name}</span>
            </div>
          </div>
        ))}
      </div>
      {openSections.map((section: string) => renderSectionContent(section))}
    </>
  );
};

export default SupportingMaterial;
