import React, { useState, useEffect, useRef } from "react";
import segmentIcon from "../../../assets/svg/SegmentIcon.svg";
import plusIcon from "../../../assets/svg/plus.svg";
import crossIcon from "../../../assets/svg/cross.svg";
import bluePlusIcon from "../../../assets/svg/blue-plus.svg";
import pencilIcon from "../../../assets/svg/pen.svg";
import trashIcon from "../../../assets/svg/trash-can.svg";
import searchIcon from "../../../assets/images/search-grey.svg";
import Select from "react-select";
import "./SupportingMaterial.css";

import AddedLinks from "./AddedLinks/AddedLinks";

// Debounce utility function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  const debouncedFunc = (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
  debouncedFunc.cancel = () => clearTimeout(timeoutId);
  return debouncedFunc;
};

interface SupportingMaterialOption {
  name: string;
  icon: string; // Adjust the type if needed
}

interface SupportingMaterialProps {
  options: SupportingMaterialOption[];
  fetchedPages?: any;
  list?: any;
  setAddedurls?: any;
  suggestedLists?: any;
  onListSearch?: (searchTerm: string) => void;
  selectedListsData?: any[];
  setSelectedListsData?: (data: any[]) => void;
}

interface AddedLink {
  url: string;
  locale?: string;
  variantName?: string;
  deviceType?: string;
  page?: any;
}

interface ListItem {
  listId: string;
  displayName: string;
  listenerCount?: number;
  type?: string;
  status?: string;
}

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

const SupportingMaterial: React.FC<SupportingMaterialProps> = ({ options, fetchedPages, list, setAddedurls , suggestedLists, onListSearch, selectedListsData, setSelectedListsData}) : React.ReactElement => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  
  // Helper function to format selected lists data
  const formatSelectedListsData = (lists: any[]) => {
    return lists.map((list) => {
      // Handle react-select option format (from dropdown)
      if (list.value && list.label) {
        return {
          listId: list.value,
          name: list.label,
          type: 'dynamic',
          status: list.status || null
        };
      }
      
      // Handle suggested segments format
      if (list.listId && list.title) {
        return {
          listId: list.listId,
          name: list.title,
          type: list.type || 'suggested',
          status: list.status || null
        };
      }
      
      // Handle original list format
      return {
        listId: list.listId || list.id,
        name: list.displayName || list.name,
        type: list.type || '',
        status: list.status || null
      };
    });
  };

  // Convert suggestedLists to the format we need
  const suggestedSegments = suggestedLists && suggestedLists.length > 0 ? 
    suggestedLists.map((item: any, index: number) => ({
      icon: segmentIcon, 
      title: item.displayName, 
      leads: item.listenerCount || 0, 

      listId: item.listId,
      type: item.type || 'suggested',
      status: item.status || ""
    })) : [];
  
  const [selectedSegments, setSelectedSegments] = useState<any>(suggestedSegments);
  const [dynamicLists, setDynamicLists] = useState<ListItem[]>([]);
  const [selectedReferencePage, setSelectedReferencePage] = useState<string>("");
  const [externalLink, setExternalLink] = useState<string>("");
  const [addedLink, setAddedLink] = useState<AddedLink[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [listSearchTerm, setListSearchTerm] = useState<string>("");
  const [activeSegments, setActiveSegments] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<AddedLink | string>("");
  const [selectedLists, setSelectedLists] = useState<any>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debouncedGetSuggestedData = useRef<any>();

  // Update suggested segments when suggestedLists changes
  useEffect(() => {
    if (suggestedLists && suggestedLists.length > 0) {
      const newSuggestedSegments = suggestedLists.map((item: any, index: number) => ({
        title: item.displayName, 
        leads: item.listenerCount || 0, 
        listId: item.listId,
        type: item.type || '',
        status: item.status || ""
      }));
      setSelectedSegments(newSuggestedSegments);
      
      // Don't set suggested segments as active by default
      setActiveSegments([]);
      
      // Initialize selectedListsData with empty array since no lists are selected by default
      if (setSelectedListsData) {
        setSelectedListsData([]);
      }
    }
  }, [suggestedLists, setSelectedListsData]);

  // Initialize debounced search
  useEffect(() => {
    debouncedGetSuggestedData.current = debounce(
      async (searchValue: string, onListSearch: Function) => {
        if (searchValue && searchValue.length >= 1 && onListSearch) {
          setIsSearching(true);
          onListSearch(searchValue);
          setIsSearching(false);
        }
      },
      300
    );

    return () => {
      debouncedGetSuggestedData.current.cancel(); // Cleanup on unmount
    };
  }, []);

  // Update dynamic lists when list prop changes
  useEffect(() => {
    if (list && Array.isArray(list)) {
      const dynamicListItems = list.map((item: any) => ({
        listId: item.listId || item.id,
        displayName: item.displayName || item.name,
        listenerCount: item.listenerCount || 0,
        status: item.status || "",
        type: item.type || 'dynamic_candidates' as const
      }));
      setDynamicLists(dynamicListItems);
    }
  }, [list]);

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
    const updatedSegments = selectedSegments.filter((item: any) => item.title !== segment.title);
    setSelectedSegments(updatedSegments);
    
    // Update active segments to remove the index of the filtered segment
    const segmentIndex = selectedSegments.findIndex((item: any) => item.title === segment.title);
    const updatedActiveSegments = activeSegments.filter(i => i !== segmentIndex);
    setActiveSegments(updatedActiveSegments);
    
    // Update the selectedListsData with remaining selected lists
    const activeSuggestedSegments = updatedSegments.filter((_: any, index: number) => 
      updatedActiveSegments.includes(index)
    );
    
    const allSelectedLists = [
      ...(selectedLists || []),
      ...activeSuggestedSegments
    ];
    
    if (setSelectedListsData) {
      setSelectedListsData(formatSelectedListsData(allSelectedLists));
    }
  };

  // Handle list search
  const handleListSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setListSearchTerm(value);
  };

  // Handle search button click or enter key
  const handleSearchSubmit = () => {
    if (onListSearch && listSearchTerm.trim()) {
      setIsSearching(true);
      onListSearch(listSearchTerm.trim());
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(addedLink[index]);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    setAddedLink(addedLink.filter((_, i) => i !== index));
  };

  const handleListSelectionChange = (selectedOption: any) => {
    setSelectedLists(selectedOption);
    
    // Get active suggested segments (those that are selected)
    const activeSuggestedSegments = selectedSegments.filter((_: any, index: number) => activeSegments.includes(index));
    
    // Combine dropdown selections with suggested list selections
    const allSelectedLists = [
      ...(selectedOption || []),
      ...activeSuggestedSegments
    ];
    
    if (setSelectedListsData) {
      setSelectedListsData(formatSelectedListsData(allSelectedLists));
    }
  };

  const renderSectionContent = (option: string) => {
    switch (option) {
      case "List":
        return (
          <div className="option-section-list">
            <div className="list-section-heading">List</div>
            
            <Select
              options={dynamicLists.map(item => ({
                value: item.listId,
                label: item.displayName,
                status: item.status || "",
                type: item.type || ""
              }))}
              value={selectedLists}
              onChange={handleListSelectionChange}
              placeholder="Search and select lists..."
              isMulti
              isSearchable
              styles={{
                control: (base) => ({
                  ...base,
                  border: "1px solid #E8EAEE",
                  borderRadius: "10px",
                  cursor: "pointer"
                })
              }}
              isLoading={isSearching}
              onInputChange={(inputValue, actionMeta) => {
                if (actionMeta.action === 'input-change') {
                  setListSearchTerm(inputValue);
                  debouncedGetSuggestedData.current(inputValue, onListSearch);
                }
              }}
              noOptionsMessage={() => "No lists found. Try searching for a different term."}
              loadingMessage={() => "Searching..."}
            />
            
            {/* Suggested Lists Section */}
            {selectedSegments.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ 
                  fontSize: "14px", 
                  fontWeight: "600", 
                  color: "#333", 
                  marginBottom: "8px" 
                }}>
                  Suggested Lists
                </div>
                <div className="segment-list">
                  {selectedSegments.map((segment: any, index: number) => (
                    <div
                      key={`suggested-${index}`}
                      className="segment-item-container"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: activeSegments.includes(index) ? "1px solid #6C63FF" : "1px solid #E8EAEE",
                        borderRadius: "16px",
                        marginBottom: "12px",
                        padding: "16px 20px",
                        boxShadow: activeSegments.includes(index) ? "0 0 0 2px #E6E3F7" : "none",
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        let newActiveSegments;
                        if (activeSegments.includes(index)) {
                          newActiveSegments = activeSegments.filter(i => i !== index);
                        } else {
                          newActiveSegments = [...activeSegments, index];
                        }
                        setActiveSegments(newActiveSegments);
                        
                        // Update the selectedListsData with all selected lists
                        const activeSuggestedSegments = selectedSegments.filter((_: any, idx: number) => 
                          newActiveSegments.includes(idx)
                        );
                        
                        const allSelectedLists = [
                          ...(selectedLists || []),
                          ...activeSuggestedSegments
                        ];
                        
                        if (setSelectedListsData) {
                          setSelectedListsData(formatSelectedListsData(allSelectedLists));
                        }
                      }}
                    >
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
            )}
            
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
