import React, { useEffect } from 'react';

const CrmStylesRenderer = () => {

  const addStyles = () => {
    // Create the first <style> element
    const crmStyles = document.createElement('style');
    crmStyles.id = 'crm-index-styles';
    crmStyles.textContent = `
      /* Reset CSS Styles Start */
      * {
        padding: 0;
        margin: 0;
        text-decoration: none;
        list-style: none;
        outline: none;
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
      }
      ::before, ::after {
        box-sizing: inherit;
        text-decoration: inherit;
        vertical-align: inherit;
      }
      hr { overflow: visible; }
      article, aside, details, figcaption, figure, footer, header, main, menu, nav, section, summary {
        display: block;
      }
      summary { display: list-item; }
      button, input, select, textarea, fieldset {
        color: inherit;
        background-color: transparent;
        border-style: none;
      }
      progress { vertical-align: baseline; }
      audio, canvas, progress, video {
        display: inline-block;
      }
      audio:not([controls]) { display: none; height: 0; }
      [hidden] { display: none !important; }

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
      }
      .promotion-content .internal-link {
        color: var(--B100);
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

  const crmExternalStyles = [
    { id: 'codemirror-css', src: 'codemirror.css' },
    { id: 'font-awesome-css', src: 'font-awesome.css' },
    { id: 'jquery-timepicker-css', src: 'jquery.timepicker.css' },
    { id: 'daterangepicker-css', src: 'daterangepicker.css' }
  ];

  const removeStyles = () => {
    const styles = document.getElementById('crm-index-styles');
    if (styles) document.head.removeChild(styles);
    crmExternalStyles.forEach(style => {
      const link = document.getElementById(style.id);
      if (link) document.head.removeChild(link);
    });
  };

  useEffect(() => {
    addStyles();
    const code = window?.orgInfo?.code;
    const type = window?.orgInfo?.type;
    localStorage.setItem("CP_USER_LOGIN_TYPE", JSON.stringify("CP_LOGIN_TYPE_KEY_CLOAK"));
    code && localStorage.setItem("CP_KEY_CLOAK_ORG_CODE", JSON.stringify(code));
    type && localStorage.setItem("CP_KEY_CLOAK_ORG_TYPE", JSON.stringify(type));
    
    
    const loadStyles = () => {
      const crmHost = (window as any)._env_?.CRM_URL;
      if (crmHost) {
        crmExternalStyles.forEach(style => {
          if (!document.getElementById(style.id)) {
            const link = document.createElement('link');
            link.id = style.id;
            link.rel = 'stylesheet';
            link.href = `${crmHost}/${style.src}`;
            document.head.appendChild(link);
          }
        });
      } else {
        console.warn('CRM_URL is not defined in window._env_');
      }
    };
    
    loadStyles();
    

    return () => {
      removeStyles();
    };
  }, []);

  return null;
};

export default CrmStylesRenderer;
