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

      html,
      body {
        padding: 0;
        margin: 0;
        text-decoration: none;
        list-style: none;
        outline: none;
        box-sizing: border-box;

        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
      }
      ul,
      li {
        padding: 0;
        margin: 0;
        list-style: none;
      }
      button {
        color: inherit;
        background-color: transparent;
        border-style: none;
      }
      [hidden] {
        display: none !important;
      }
      /* Reset css styles end */
    </style>
    <style>
      .main-loader {
        width: 100%;
        height: 100%;
        text-align: center;
      }

      .main-loader img {
        height: 80px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate3d(-50%, -50%, 0);
      }

      .small-screen-error {
        display: none;
        width: 100%;
        height: 100%;
        text-align: center;
      }

      .small-screen-details {
        color: var(--N400);
        font-size: 20px;
        width: 100%;
      }

      .error-image {
        margin: 50px 0px;
        height: 300px;
        background: url(assets/images/small-screen-mobile-error.jpg) no-repeat center center;
        background-size: contain;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .promotion-content {
        padding: 0 30px;
        text-align: left;
        justify-content: left;
        display: flex;
        flex-direction: column;
        font-family: 'PoppinsRegular', Arial, Helvetica, sans-serif;
        font-weight: 200;
        color: var(--N400);
        gap: 10px;
        margin-top: 30px;
        .internal-link {
          color: var(--B100);
        }
      }

      .loading-screen-error-text {
        color: var(--N400);
        padding: 0 30px;
        font-family: 'PoppinsRegular', Arial, Helvetica, sans-serif;
      }
      .ie-screen-error-text {
        font-family: 'PoppinsRegular', Arial, Helvetica, sans-serif;
      }
      @media not print {
        @media only all and (max-width: 1023px) {
          .main-loader {
            display: none;
          }
          .small-screen-error {
            display: block;
            position: fixed;
            z-index: 999999;
            width: 100%;
            height: 100%;
            top: 0;
            background: var(--PDS_white);
            left: 0;
          }
          .small-screen-error .ie-screen-error-text {
            display: none;
          }
        }
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
