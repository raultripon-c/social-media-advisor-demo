import("./bootstrap");

declare var phenomevent: any;
(async function () {
    const scriptEle = document.getElementById('#txe_phenom_tracking_script');
    if (scriptEle) {
      return;
    }
    const e = document.createElement('script');
    e.id = 'txe_phenom_tracking_script';
    e.type = 'text/javascript';
    e.async = !0;
  
    let trackingUrl = '';
    const locParams = window.location;
    const phenomTrackingUrl = (window as any)._env_.PHENOM_TRACK_SCRIPT_URL;
    if (locParams) {
      trackingUrl = phenomTrackingUrl;
    }

    const getIPAddress = async () => {
      try {
        const response = await fetch('https://api.ipify.org/?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('Error fetching IP address:', error);
        return '';
      }
    };

    const ipAddress = await getIPAddress();
    localStorage.setItem('TXE_IP_ADR', ipAddress);
  
    e.src = trackingUrl;
    document.body.appendChild(e);
    e.onload = function () {
      try {
        phenomevent.init('TXE_UI_EVENTS');
      } catch (err) {}
    };

    const getAccessTokenForTracking = () => {
      let accessTokenJSON: any = {
        storage: window.keycloakInstance.token
      };
  
      accessTokenJSON.keycloak = window.keycloakInstance.token;
      return accessTokenJSON;
    }

    const getTrackData = () => {
      const trackData: any = {};
      const tenantData = JSON.parse(localStorage.getItem("selectedTenant") || "{}");
      const ipAddress = localStorage.getItem("TXE_IP_ADR");
      trackData.refNum = tenantData?.refNum ?? '';
      trackData.userEmail = window?.keycloakInstance?.userInfo?.userDetails?.email ?? '';
      trackData.userName = window?.keycloakInstance?.userInfo?.name ?? '';
      trackData.tenantName = tenantData?.tenantName?.replace(/ /g, '_') ?? '';
      trackData.ipAddress = ipAddress ?? '000.000.000.000';
      trackData.accessToken = getAccessTokenForTracking();
      trackData.accessTokenTimestamp = new Date(window?.keycloakInstance?.tokenParsed?.iat * 1000).toString();
      trackData.keycloakInstanceDetails = window.keycloakInstance ? JSON.stringify(window.keycloakInstance) : '';

      return trackData;
    }

    document.addEventListener('click', function(event) {
      try {
        const target = event.target as HTMLElement;
        if (target) {
          const eventData: any = {
            trait158: 'click',
            elementId: target.id || '',
            elementClass: target.className || '',
            elementType: target.tagName.toLowerCase() || '',
            elementText: target.textContent || '',
            href: (target as any).href || ''
          };
          const trackData = getTrackData();
          const screenResolution = window.screen.width + ' X ' + window.screen.height;
          eventData.trait65 = 'WEB';
          eventData.trait2 = trackData.refNum;
          eventData.trait196 = new Date();
          eventData.trait203 = (window as any)._env_.APP_ENV;
          eventData.trait204 = trackData.userName;
          eventData.trait207 = trackData.userEmail;
          eventData.trait182 = screenResolution;
          eventData.trait208 = trackData.tenantName;
          eventData.ipAddress = trackData.ipAddress;
          eventData.accessToken = trackData.accessToken;
          eventData.accessTokenTimestamp = trackData.accessTokenTimestamp;
          eventData.keycloakInstanceDetails = trackData.keycloakInstanceDetails;

          phenomevent.track('txe_click_event', eventData);
        }
      } catch (err) {
        console.error('Error tracking click event:', err);
      }
    });

  })();
