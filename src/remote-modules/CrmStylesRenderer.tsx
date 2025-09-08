import React, { useEffect } from 'react';

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


  const removeStyles = () => {
    const styles = document.getElementById('crm-index-styles');
    if (styles) document.head.removeChild(styles);
  };


  useEffect(() => {
    addStyles();
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
      removeStyles();
      const disableTxeBootstrap = document.getElementById('bootstrap-styles') as HTMLLinkElement;
      if (disableTxeBootstrap) {
        disableTxeBootstrap.disabled = false;
      }
    };
  }, []);

  return null;
};

export default CrmStylesRenderer;
