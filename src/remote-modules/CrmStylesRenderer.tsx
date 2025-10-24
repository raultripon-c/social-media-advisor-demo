import React, { useEffect } from 'react';
import { removeElementsById } from '../utils/helper/utilizer';

const CrmStylesRenderer = () => {

  const addStyles = () => {
    const crmStyles = document.createElement('style');
    crmStyles.id = 'crm-index-styles';
    crmStyles.textContent = `
      /* Reset CSS Styles Start */
      .candidate-ask-anything-button {
        display: none !important;
      }
      .campaign-summary-page .horizontal-nav-tabs {
        left: auto !important;
        right: auto !important;
      }

      .candidate-bulk-import-page .page-footer {
        display: block !important;
        right: 0 !important;
        position: sticky !important;
        left: 0 !important;
        width: 100% !important
      }
      .candidate-bulk-import-page .page-footer .actions-container {
        justify-content: end !important;
      }
      
      

      .close-facet-serach .data-details.list-cntr .header-list-cntr {
        right: 0 !important;
        left: 0 !important;      
      }
      
      .create-evt-footer {
        right: auto !important;
        left: auto !important;
        position: sticky !important;
      }

      .main-header-bar {
        display: none !important;
      }
    `;
    document.head.appendChild(crmStyles);
  };

    // Fetch and load the CRM script and its associated CSS
    const fetchAndLoadCRMStyles = async () => {
      try {
        const response = await fetch(`${(window as any)._env_.CRM_URL}/en/assets-manifest.json`);
        if (!response.ok) throw new Error('Failed to fetch assets manifest');
  
        const data = await response.json();
        const cssUrl = `${(window as any)._env_.CRM_URL}/${data["styles.css"]}`;
  
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.id = 'crm-stylesheet';
        link.href = cssUrl;
        document.head.appendChild(link);
  
      } catch (error) {
        console.error('Error fetching data or loading script:', error);
      }
    };

  useEffect(() => {
    addStyles();
    (async () => {
      await fetchAndLoadCRMStyles();
    })();
    const disableTxeBootstrap = document.getElementById('bootstrap-styles') as HTMLLinkElement;
    if (disableTxeBootstrap) {
      disableTxeBootstrap.disabled = true;
    }

    const code = window?.orgInfo?.code;
    const type = window?.orgInfo?.type;
    localStorage.setItem("CP_USER_LOGIN_TYPE", JSON.stringify("CP_LOGIN_TYPE_KEY_CLOAK"));
    code && localStorage.setItem("CP_KEY_CLOAK_ORG_CODE", JSON.stringify(code));
    type && localStorage.setItem("CP_KEY_CLOAK_ORG_TYPE", JSON.stringify(type));
    
    
    return () => {
      removeElementsById("crm-stylesheet");
      removeElementsById("crm-index-styles");
      const disableTxeBootstrap = document.getElementById('bootstrap-styles') as HTMLLinkElement;
      if (disableTxeBootstrap) {
        disableTxeBootstrap.disabled = false;
      }
    };
  }, []);

  return null;
};

export default CrmStylesRenderer;
