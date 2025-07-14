import React, { useState, useEffect } from "react";
import segmentIcon from "../../../assets/svg/SegmentIcon.svg";
import plusIcon from "../../../assets/svg/plus.svg";
import crossIcon from "../../../assets/svg/cross.svg";
import bluePlusIcon from "../../../assets/svg/blue-plus.svg";
import pencilIcon from "../../../assets/svg/pen.svg";
import trashIcon from "../../../assets/svg/trash-can.svg";
import "./SupportingMaterial.css";
import Select from "react-select";
import { List } from "lodash";

import AddedLinks from "./AddedLinks/AddedLinks";

interface SupportingMaterialOption {
  name: string;
  icon: string; // Adjust the type if needed
}

interface SupportingMaterialProps {
  options: SupportingMaterialOption[];
  fetchedPages?: any;
  list?: any;
  setAddedurls?: any;
}

interface AddedLink {
  url: string;
  locale?: string;
  variantName?: string;
  deviceType?: string;
  page?: any;
}

const suggestedSegments = [
  { icon: segmentIcon, title: "Healthcare Professionals", leads: 17, avatarColor: "#E6E3F7", avatarType: "doctor" },
  { icon: segmentIcon, title: "Medical staff in Chicago", leads: 17, avatarColor: "#FDF3E6", avatarType: "woman" },
  { icon: segmentIcon, title: "Registered nurses", leads: 17, avatarColor: "#E6F7F7", avatarType: "nurse" },
];

const avatarIcons: Record<string, JSX.Element> = {
  doctor: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#E6E3F7" />
      <path d="M20 24c3.314 0 6-2.239 6-5s-2.686-5-6-5-6 2.239-6 5 2.686 5 6 5z" stroke="#6C63FF" strokeWidth="2" />
      <circle cx="20" cy="15" r="3" stroke="#6C63FF" strokeWidth="2" />
    </svg>
  ),
  woman: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#FDF3E6" />
      <path d="M20 24c3.314 0 6-2.239 6-5s-2.686-5-6-5-6 2.239-6 5 2.686 5 6 5z" stroke="#F4B266" strokeWidth="2" />
      <circle cx="20" cy="15" r="3" stroke="#F4B266" strokeWidth="2" />
    </svg>
  ),
  nurse: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#E6F7F7" />
      <rect x="15" y="18" width="10" height="8" rx="4" stroke="#3EC6C6" strokeWidth="2" />
      <rect x="17" y="13" width="6" height="6" rx="3" stroke="#3EC6C6" strokeWidth="2" />
    </svg>
  ),
};

const SupportingMaterial: React.FC<SupportingMaterialProps> = ({ options, fetchedPages, list, setAddedurls }) : React.ReactElement => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<any>(suggestedSegments);
  const [selectedReferencePage, setSelectedReferencePage] = useState<string>("");
  const [externalLink, setExternalLink] = useState<string>("");
  const [addedLink, setAddedLink] = useState<AddedLink[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeSegments, setActiveSegments] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<AddedLink | string>("");


  useEffect(() => {
    setAddedurls(addedLink.map((link: any) => link.url));
  }, [addedLink]);


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

  const filteredSegments = selectedSegments.filter((segment: any) =>
    segment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const segmentOptions = filteredSegments.map((segment: any, index: number) => ({
    value: index,
    label: segment.title,
    segment,
  }));

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(addedLink[index]);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    setAddedLink(addedLink.filter((_, i) => i !== index));
  };

  const renderSectionContent = (option: string) => {
    switch (option) {
      case "List":
        return (
          <div className="option-section">
            <div className="list-section-heading">List</div>
            <Select
              className="segment-search-select"
              options={segmentOptions}
              isMulti
              onChange={(options: any) => {
                if (!options) {
                  setActiveSegments([]);
                } else if (Array.isArray(options)) {
                  setActiveSegments(options.map(opt => opt.value));
                }
              }}
              placeholder="Search for a list"
              isSearchable
              isClearable
              value={segmentOptions.filter((opt: any) => activeSegments.includes(opt.value))}
              styles={{
                control: (base) => ({ ...base, marginBottom: "16px", borderRadius: "10px", border: "1px solid #8C95A8", background: "#FFF" }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
                multiValue: (base) => ({
                  ...base,
                  borderRadius: "10px",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  borderRadius: "10px",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  borderRadius: "10px",
                }),
              }}
              formatOptionLabel={(option: any) => (
                <div style={{ display: "flex", alignItems: "center", borderRadius:"10px"}}>
                  {/* <span style={{ marginRight: 8 }}>{avatarIcons[filteredSegments[option.value]?.avatarType]}</span> */}
                  <span style={{ fontWeight: 600, marginRight: 8, borderRadius: "10px" }}>{option.label}</span>
                  <span style={{ color: "#8A94A6", borderRadius: "10px" }}>| {filteredSegments[option.value]?.leads} leads</span>
                </div>
              )}
            />
            <div className="segment-list">
              {filteredSegments.map((segment: any, index: number) => (
                <div
                  key={`segment-${index}`}
                  className="segment-item-container"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    // background: activeSegments.includes(index) ? "#F6F5FF" : "#fff",
                    border: activeSegments.includes(index) ? "1px solid #6C63FF" : "1px solid #E8EAEE",
                    borderRadius: "16px",
                    marginBottom: "12px",
                    padding: "16px 20px",
                    boxShadow: activeSegments.includes(index) ? "0 0 0 2px #E6E3F7" : "none",
                    cursor: "pointer"
                  }}
                  onClick={() => {
                    if (activeSegments.includes(index)) {
                      setActiveSegments(activeSegments.filter(i => i !== index));
                    } else {
                      setActiveSegments([...activeSegments, index]);
                    }
                  }}
                >
                  {/* <div style={{ marginRight: "16px" }}>
                    {avatarIcons[segment.avatarType]}
                  </div> */}
                  <span className="suggested-tag">Suggested</span>
                  <span className="suggested-list-title">{segment.title}</span>
                  <span className="suggested-list-condidates">| {segment.leads} leads</span>
                  <span
                    className="close-icon"
                    style={{ marginLeft: "auto", fontSize: "20px", color: "#8A94A6", cursor: "pointer" }}
                    onClick={e => { e.stopPropagation(); filterSegments(segment); }}
                  >
                    &#10005;
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case "Reference Page":
        return (
          <div className="option-section">
            <h3 className="reference-page-section-subheading">Reference Page</h3>
            {fetchedPages && (fetchedPages.contentPages?.length > 0 || fetchedPages.landingPages?.length > 0 || fetchedPages.blogs?.length > 0 || fetchedPages.emailTemplates?.length > 0) ? (
              <div className="reference-pages-list">
                <select
                  className="reference-page-select"
                  value={selectedReferencePage}
                  onChange={(e) => {
                    setSelectedReferencePage(e.target.value);
                    if (e.target.value) {
                      const allPages = [
                        ...(fetchedPages.contentPages || []),
                        ...(fetchedPages.landingPages || []),
                        ...(fetchedPages.blogs || []),
                        ...(fetchedPages.emailTemplates || [])
                      ];
                      const selectedPage = allPages.find((page: any) => 
                        page.url === e.target.value || page.fullUrl === e.target.value
                      );
                      if (selectedPage) {
                        setExternalLink(selectedPage.fullUrl || selectedPage.url);
                      }
                    }
                  }}
                >
                  <option value="">Select a reference page</option>
                  {fetchedPages.contentPages?.map((page: any, index: number) => (
                    <option key={`content-${page.url}-${index}`} value={page.url}>
                      {page.displayName} (Content Page)
                    </option>
                  ))}
                  {fetchedPages.landingPages?.map((page: any, index: number) => (
                    <option key={`landing-${page.url}-${index}`} value={page.url}>
                      {page.displayName} (Landing Page)
                    </option>
                  ))}
                  {fetchedPages.blogs?.map((blog: any, index: number) => (
                    <option key={`blog-${blog.url}-${index}`} value={blog.fullUrl}>
                      {blog.displayName || blog.title} (Blog)
                    </option>
                  ))}
                  {fetchedPages.emailTemplates?.map((template: any, index: number) => (
                    <option key={`email-${template.url}-${index}`} value={template.url}>
                      {template.displayName || template.templateName} (Email Template)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                className="reference-page-input"
                type="text"
                placeholder="Enter Page URL"
                value={selectedReferencePage}
                onChange={(e) => setSelectedReferencePage(e.target.value)}
              />
            )}
            <div className="reference-page-part">External Link</div>
            <input
              className="reference-page-input"
              type="text"
              placeholder="Enter Link URL"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
            />
            {addedLink.length > 0 && (
            <div className="reference-page-part">Added Link</div>
            )}
            {addedLink.map((link, index) => (
              <div key={index} className="input-with-icons-container">
                <input
                  className="reference-page-input input-with-icons"
                  type="text"
                  placeholder="Enter Link URL"
                  value={
                    typeof link === 'string' 
                      ? link 
                      : link.url 
                  }
                  readOnly
                />
                <span className="input-icon-group">
                  <img
                    src={pencilIcon}
                    alt="Edit"
                    className="input-icon"
                    onClick={() => handleEdit(index)}
                  />
                  <img
                    src={trashIcon}
                    alt="Delete"
                    className="input-icon"
                    onClick={() => handleDelete(index)}
                  />
                </span>
              </div>
            ))}
            <button className="add-link-button" onClick={() => { setEditIndex(null); setEditValue(""); setIsModalOpen(true); }}>
              <img src={bluePlusIcon} alt="bluePlusIcon" />
              Add Link
            </button>
            <AddedLinks
              addedLink={addedLink}
              setAddedLink={setAddedLink}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              editIndex={editIndex}
              editValue={editValue}
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
            onClick={() => toggleSection(option.name)}
            key={option.name}
            className="supporting-material-item"
            style={{ cursor: "pointer" ,backgroundColor: openSections.includes(option.name) ? "#E8EAEE" : "white" }}
          >
            <div
              className="option-header"
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img src={option.icon} alt={option.name} />
              <span style={{ marginLeft: "8px" }}>{option.name}</span>
              
            </div>
            <img src={openSections.includes(option.name) ? crossIcon : plusIcon} alt={openSections.includes(option.name) ? "crossIcon" : "plusIcon"} />
          </div>
        ))}
      </div>
      {openSections.map((section: string, idx: number) => (
        <React.Fragment key={section}>
          <div className="section-divider" />
          {renderSectionContent(section)}
        </React.Fragment>
      ))}
    </>
  );
};

export default SupportingMaterial;
