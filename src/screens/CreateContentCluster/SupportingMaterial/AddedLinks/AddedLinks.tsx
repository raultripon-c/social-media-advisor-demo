import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../../components/Modal/Modal';
import { APIService } from '../../../../utils/api.service';

import "./AddedLinks.css";
import { log } from 'console';

const LINK_TYPES = [
  { label: 'Web Address (URL)', value: 'web' },
  { label: 'Inner Pages', value: 'inner' },
];



interface AddedLink {
  url: string;
  locale?: string;
  variantName?: string;
  deviceType?: string;
  page?: any;
  linkType?: string;
}

interface AddedLinksProps {
  isOpen: boolean;
  onClose: () => void;
  addedLink: AddedLink[];
  setAddedLink: (links: AddedLink[]) => void;
  editIndex?: number | null;
  editValue?: any | AddedLink;
}

const AddedLinks: React.FC<AddedLinksProps> = ({ isOpen, onClose, addedLink, setAddedLink, editIndex = null, editValue = '' }) => {
  const [linkType, setLinkType] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [personas, setPersonas] = useState<Array<{ label: string; value: string }>>([]);
  const [persona, setPersona] = useState('');
  const [locales, setLocales] = useState<Array<{ label: string; value: string }>>([]);
  const [locale, setLocale] = useState('');
  const [pages, setPages] = useState<Array<{ label: string; value: string }>>([]);
  const [page, setPage] = useState<any | null>(null);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pageSearchTerm, setPageSearchTerm] = useState('');
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const pageDropdownRef = useRef<HTMLDivElement>(null);

  const filteredPages = pages.filter(pg =>
    pg.label.toLowerCase().includes(pageSearchTerm.toLowerCase())
  );

  // Get selected tenant from localStorage
  const selectedTenant = JSON.parse(localStorage.getItem("selectedTenant") || "{}");

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(event.target as Node)) {
        setIsPageDropdownOpen(false);
      }
    };

    if (isPageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPageDropdownOpen]);

  // Helper function to map site variants to user-friendly labels
  const mapSiteVariantToLabel = (variant: string): string => {
    const variantMap: { [key: string]: string } = {
      'internal': 'Employee Experience',
      'external': 'Career Site',
      'newvariant': 'New Variant'
    };
    return variantMap[variant] || variant;
  };


  useEffect(() => {
    if(linkType === 'inner'){
      if(typeof editValue === 'object' && editValue){
        setPages([]);
        setPage('');
        setPageSearchTerm('');
        setIsPageDropdownOpen(false);
        if(persona && locale){
          fetchAllPages();
        }
      }
      else if(editIndex === null){
        setPages([]);
        setPage('');
        setPageSearchTerm('');
        setIsPageDropdownOpen(false);
        if(persona && locale){
          fetchAllPages();
        }
      }
    }
  }, [linkType, persona, locale]);

  // Function to fetch all pages
  const fetchAllPages = async () => {
    if (isOpen && selectedTenant?.refNum && persona && locale) {
      setPagesLoading(true);
      try {
        const payload = {
          refNum: selectedTenant.refNum,
          locale: locale,
          variantName: persona,
          deviceType: "desktop"
        };
        const response = await APIService.getAllPages(payload);
        console.log('getAllPages API response:', response);
        console.log('selectedTenant.refNum:', selectedTenant.refNum);
        console.log('payload:', payload);

        // Handle the specific API response structure
        const allPages = response;

        if (allPages && Array.isArray(allPages)) {
          const formattedPages = allPages
            .filter((page: any) => page.displayName?.toLowerCase() !== 'category')
            .map((page: any) => {
              return {
                label: page.displayName,
                value: page
              };
            });
          console.log('Formatted pages:', formattedPages);
          setPages(formattedPages);
        } else {
          console.log('API response data is not an array or is null:', allPages);
          // Fallback to default pages if API fails
          const fallbackPages = [
            { label: 'Human Resources', value: 'hr' },
            { label: 'About Us', value: 'about' },
            { label: 'Contact', value: 'contact' },
            { label: 'Careers', value: 'careers' },
          ];
          setPages(fallbackPages);
          if (!page) {
            setPage(fallbackPages[0].value);
          }
        }
      } catch (error) {
        console.error('Error fetching all pages:', error);
        // Fallback to default pages if API fails
        const fallbackPages = [
          { label: 'Human Resources', value: 'hr' },
          { label: 'About Us', value: 'about' },
          { label: 'Contact', value: 'contact' },
          { label: 'Careers', value: 'careers' },
        ];
        setPages(fallbackPages);
        if (!page) {
          setPage(fallbackPages[0].value);
        }
      } finally {
        setPagesLoading(false);
      }
    }
  };

  const fetchSupportedLanguages = async () => {
    if (isOpen && selectedTenant?.refNum) {
      try {
        const response = await APIService.getSupportedLangs(selectedTenant.refNum);
        console.log('getSupportedLangs API response:', response);
        console.log('selectedTenant.refNum:', selectedTenant.refNum);

        // Handle the specific API response structure
        const supportedLangs = response;

        if (supportedLangs && Array.isArray(supportedLangs)) {
          const formattedLocales = supportedLangs.map((lang: any) => {
            return {
              label: lang.description,
              value: lang.language.toLowerCase()
            };
          });
          console.log('Formatted locales:', formattedLocales);
          formattedLocales.unshift({ label: 'Select Locale', value: '' });
          setLocales(formattedLocales);
          // setLocale(formattedLocales[0].value);

        } else {
          console.log('API response data is not an array or is null:', supportedLangs);
          // Fallback to default locales if API fails
         
        }
      } catch (error) {
        console.error('Error fetching supported languages:', error);
        // Fallback to default locales if API fails
       
      } finally {
      }
    }
  };

  const fetchSiteVariants = async () => {
    if (isOpen && selectedTenant?.refNum) {
      try {
        const response = await APIService.getSiteVariants(selectedTenant.refNum);

        if (response && Array.isArray(response)) {
          const formattedPersonas = response.map((variant: string) => {
            return {
              label: mapSiteVariantToLabel(variant),
              value: variant
            };
          });
          formattedPersonas.unshift({ label: 'Select Persona', value: '' });
          setPersonas(formattedPersonas);
          // setPersona(formattedPersonas[0].value);
        } else {
          console.log('Site variants API response is not an array or is null:', response);
          // Fallback to default personas if API fails
          
        }
      } catch (error) {
        console.error('Error fetching site variants:', error);
        // Fallback to default personas if API fails
       
      } finally {
      }
    }
  };
  useEffect(() => {
    if (linkType === 'inner') {
      fetchSupportedLanguages();
      fetchSiteVariants();
    }
  }, [linkType]);

  useEffect(() => {
    if (isOpen) {
      if (editIndex !== null && editValue) {
        if (
          typeof editValue === 'object' &&
          editValue !== null &&
          'url' in editValue &&
          !('locale' in editValue) &&
          !('variantName' in editValue) &&
          !('deviceType' in editValue) &&
          !('page' in editValue)
        ) {
          setLinkType(editValue.linkType);
          setWebUrl(editValue.url);
        }
        else if (editValue && typeof editValue === 'object' && 'url' in editValue && 'locale' in editValue && 'variantName' in editValue && 'deviceType' in editValue && 'page' in editValue) {
          setLinkType(editValue.linkType);
          setWebUrl(editValue.url);
          setPersona(editValue.variantName || '');
          setLocale(editValue.locale || '');
          setPage(editValue.page || '');
        }
        else{
          setLinkType(linkType);
          setWebUrl(editValue?.url || '');
        }
      }
    }
  }, [isOpen, editIndex]);
  
  useEffect(() => {
    if (!isOpen) {
      // Reset all form state when modal closes
      setWebUrl('');
      setLinkType('web');
      setPersona('');
      setLocale('');
      setPage('');
      setPageSearchTerm('');
      setIsPageDropdownOpen(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (linkType === 'web') {
      const newLink: AddedLink = {
        url: webUrl,
        linkType: linkType
      };

      if (editIndex !== null) {
        // Edit existing link
        const updatedLinks = [...addedLink];
        updatedLinks[editIndex] = newLink;
        setAddedLink(updatedLinks);
      } else {
        // Add new link
        setAddedLink([...addedLink, newLink]);
      }
      setWebUrl('');
    } else {
      // Inner page format
      const pageUrl = typeof page?.value === 'string' ? page.value : page?.value?.url || '';
      let langRegion = locale.toLowerCase().split('_');
      const newLink: AddedLink = {
        locale: locale,
        linkType: linkType,
        variantName: persona,
        deviceType: "desktop",
        url: `https://${JSON.parse(sessionStorage.getItem("site") || "{}").domain}/${langRegion[1]}/${langRegion[0]}/${pageUrl}`,
        page: page // Store the page object for future editing
      };

      console.log('Saving inner page link:', newLink);

      if (editIndex !== null) {
        // Edit existing link
        const updatedLinks = [...addedLink];
        updatedLinks[editIndex] = newLink;
        setAddedLink(updatedLinks);
      } else {
        // Add new link
        setAddedLink([...addedLink, newLink]);
      }
    }
    onClose();
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
      <button
        onClick={onClose}
        style={{ padding: '8px 24px', background: 'transparent', color: '#2927B2', border: 'none', borderRadius: 6 }}
      >
        Close
      </button>
      <button
        onClick={handleSave}
        style={{ padding: '8px 24px', background: '#40665A', color: '#fff', border: 'none', borderRadius: 6 }}
      >
        Save
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={<span className="txe-modal-title" style={{ fontWeight: 600, fontSize: 22 }}>Add URL</span>}
      footer={footer}
      isCloseOutside={true}
      txeModalClassName="addUrlModal"
    >
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <label className="txe-modal-label">Link Type</label>
          <select
            className="txe-modal-select"
            value={linkType}
            onChange={e => setLinkType(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          >
            {LINK_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        {linkType === 'web' ? (
          <div style={{ marginBottom: 16 }}>
            <label className="txe-modal-label">Link Location</label>
            <input
              className="txe-modal-select"
              type="text"
              value={webUrl}
              onChange={e => setWebUrl(e.target.value)}
              placeholder="http://www.example.com"
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <label className="txe-modal-label">Persona</label>
              <select
                className="txe-modal-select"
                value={persona}
                onChange={e => setPersona(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              >
                {personas.length === 0 ? (
                  <option value="">No personas available</option>
                ) : (
                  personas.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))
                )}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="txe-modal-label">Locale</label>
              <select
                className="txe-modal-select"
                value={locale}
                onChange={e => setLocale(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              >
                {locales.length === 0 ? (
                  <option value="">No locales available</option>
                ) : (
                  locales.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))
                )}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="txe-modal-label">Page</label>

              <div className="custom-dropdown-wrapper" style={{ position: 'relative' }} ref={pageDropdownRef}>
                <div 
                  className={`page-select-trigger ${isPageDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
                >
                  <span className={`select-text ${!page ? 'placeholder' : ''}`}>
                    {page ? page.label || 'Select a page' : 'Select a page'}
                  </span>
                  <span className="dropdown-arrow">▼</span>
                </div>

                {isPageDropdownOpen && (
                  <div className="page-dropdown-menu">
                    <div className="page-search-container">
                      <input
                        type="text"
                        className="page-search-input"
                        placeholder="Search pages..."
                        value={pageSearchTerm}
                        onChange={(e) => setPageSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {pagesLoading ? (
                      <div className="page-dropdown-loading">
                        Loading pages...
                      </div>
                    ) : filteredPages.length === 0 ? (
                      <div className="page-dropdown-empty">
                        No pages found
                      </div>
                    ) : (
                      filteredPages.map(pg => (
                        <div
                          key={pg.value}
                          className={`page-dropdown-option ${page && page.value === pg.value ? 'selected' : ''}`}
                          onClick={() => {
                            setPage(pg);
                            setIsPageDropdownOpen(false);
                            setPageSearchTerm('');
                          }}
                        >
                          {pg.label}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </Modal>
  );
};

export default AddedLinks;
