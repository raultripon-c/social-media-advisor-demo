// import React, { useEffect, useState } from "react";
// import { CardWidget } from "../../components/CardWidget/CardWidget";
// import "./DashBoard.scss";

// import calender from "../../assets/images/dashboardCalender.svg";
// import actions from "../../assets/images/actionsCardImage.svg";
// import starSvg from "../../assets/images/dashboard/star.svg";
// import defaultTenantIcon from "../../assets/images/dashboard/blur_circular.svg";
// import redirect from "../../assets/images/redirect_image.svg";
// import listRedirect from "../../assets/images/dashboard/list_redirect.svg";
// import videoIcon from "../../assets/images/dashboard/video.svg";
// import clockIcon from "../../assets/images/dashboard/clock.svg";
// import bigBook from "../../assets/images/dashboard/big_book.svg";
// import bigVideo from "../../assets/images/dashboard/big_video.svg";
// import dashBoardIcon from "../../assets/images/dashboard/dashboard_left_menu_item.svg";
// import PhenomPlatformStatus from "./custom-components/PhenomPlatformStatus";
// import _ from "lodash";
// import {
//   ALERT_TYPE_CODES,
//   API_METHOD,
//   apmFormattedDate,
//   extractNameFromEmail,
//   formatDate,
//   getAccessApiUrl,
//   getAlertMessage,
//   getChildObject,
//   getDateDifference,
//   getFormattedActivityLogDate,
//   getGreetingByTime,
//   getIconBgColor,
// } from "./utils";
// import { useDispatch, useSelector } from "react-redux";
// import { AppStore } from "store";
// import { API } from "../../utils/api";
// import { CUSTOMER_LEVEL, TENANT, apiUrl } from "../../utils/constants";
// import {
//   setSelectedTenant,
//   setUserDetails,
// } from "../../store/customer/actions";
// import { Avatar } from "../../components-ui/avatar/Avatar";
// import { Loader } from "@phenom/react-ui-components";
// import { useNavigate } from "react-router-dom";
// import { getAppByName } from "../../utils/appUtils";
// import { setAppDetails } from "../../store/apps/actions";
// import { RemoteAppRenderer } from "../../remote-modules/RemoteAppRenderer";

// interface DashboardProps {
//   toggleSidebarMenu: any;
//   showSidebarMenu: any;
//   showAppsMenu: any;
//   customerDetails?:any
// }

// const DashBoard: React.FC<DashboardProps> = ({
//   toggleSidebarMenu,
//   showSidebarMenu,
//   showAppsMenu,
//   customerDetails
// }) => {
//   const dispatch = useDispatch();

//   const [actionLoader, setActionLoader] = useState(true);

//   // let userDetails = useSelector(
//   //   (state: AppStore) => state.customer.userDetails
//   // );
//   const [userDetails, setUserDetails] = useState(
//     (state: AppStore) => state?.customer?.userDetails
//   );

//   let selectedTenant = useSelector(
//     (state: AppStore) => state.customer.selectedTenant
//   );

//   let customerTenantsList: any = [];
//   customerTenantsList = useSelector(
//     (state: AppStore) => state.customer.customerTenants
//   );

//   // let customerDetails: any = [];
//   // customerDetails = useSelector((state: AppStore) => state.customer);

//   const { allApps } = useSelector((state: any) => state.app);
//   const handleBackClick = () => {
//     toggleSidebarMenu(!showSidebarMenu);
//   };
//   useEffect(() => {
//     if (!userDetails) {
//       let userDetails = getLoggedInUserInfo();
//       setUserDetails(userDetails);
//     }
//   }, []);
//   useEffect(() => {
//     if (
//       customerTenantsList.length > 0 &&
//       Object.keys(customerDetails.data).length > 0
//     ) {
//       // setActionsWidgetData(actionsData);
//       // setTicketsWidgetData(ticketsData);
//       // setAlertsWidgetData(alertsData);
//       setActionLoader(false);
//     }
//   }, [customerTenantsList]);

//   let ListWidgetDetails = [
//     {
//       heading: "Latest Activity",
//       icon: listRedirect,
//       cardType: "list",
//       link: null,
//       showmoreLimit: null,
//       onclick: () => {
//         sessionStorage.setItem("currentContext", CUSTOMER_LEVEL);
//         const activitylogApp = getAppByName(allApps, "Activity Log");
//         activitylogApp &&
//           sessionStorage.setItem("selectedApp", JSON.stringify(activitylogApp));
//         dispatch(setAppDetails(activitylogApp));
//         navigate(`/${customerDetails.data.customerCode}/activitylog`);
//       },
//       apiconfig: customerDetails?.data?.customerCode && {
//         url:
//           getAccessApiUrl(
//             customerDetails?.data.dcCode,
//             (window as any)._env_.ALL_DC_CODES,
//             (window as any)._env_.APP_REGION_WISE_ACCESS_API,
//             customerDetails?.data.dcRegion
//           ) +
//           "/users/audit/" +
//           customerDetails.data.customerCode,
//         method: API_METHOD.POST,
//         payload: {
//           org_code: customerDetails.data.customerCode,
//           dcRegion: (window as any)._env_.APP_DC,
//           userType: "CUSTOMER",
//           from: 0,
//           size: 5,
//           searchUsername: "",
//           searchAction: "",
//           fromDate: formatDate(new Date().getDate() - 24 * 60 * 60 * 1000),
//           toDate: formatDate(new Date()),
//           timeZone: "EST",
//         },
//         responseFormatter: (response: any) => {
//           return getChildObject(response, "data");
//         },
//         response: null,
//       },
//       card: {
//         tiles: [
//           {
//             titles: [
//               {
//                 text: "$action",
//                 formatter: (data: any) => {
//                   return (
//                     <span className="activity-type">
//                       {getChildObject(data, "action")}{" "}
//                       <span className="email">
//                         {getChildObject(data, "actionOn")}
//                       </span>
//                     </span>
//                   );
//                 },
//               },
//             ],
//             subtitles: [
//               {
//                 text: "$actionBy",
//                 formatter: (data: any) => {
//                   let actionBy = getChildObject(data, "actionBy");
//                   return (
//                     <span>
//                       by{" "}
//                       {actionBy.toLowerCase() ===
//                       extractNameFromEmail(
//                         window.keycloakInstance?.tokenParsed?.userDetails
//                           ?.userName
//                       ).toLowerCase()
//                         ? "you"
//                         : actionBy}{" "}
//                       on{" "}
//                       <span className="text-underline">
//                         {getFormattedActivityLogDate(
//                           getChildObject(data, "changeTs")
//                         )}
//                       </span>
//                     </span>
//                   );
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     },
//     {
//       heading: "Get Instant Help",
//       cardType: "list",
//       link: null,
//       showmoreLimit: 5,
//       extraInfo: {
//         text: "See more on Community",
//         onclick: () => {
//           window.open("https://community.phenom.com/", "_blank");
//         },
//       },
//       apiconfig: {
//         response: null,
//         unformattedResponse: [
//           {
//             title: "HRIT Hub",
//             subTitle: "10 min read",
//             resourceType: "read",
//             resourceImage: null,
//             clientId: "onephenom-api",
//             link: "https://community.phenom.com/kb/articles/11663-hrit-hub",
//           },
//           {
//             title: "Multiple SSO config",
//             subTitle: "12 min read",
//             resourceType: "read",
//             resourceImage: null,
//             clientId: "onephenom-api",
//             link: "https://community.phenom.com/kb/articles/11301-single-sign-on-sso-set-up-for-saml-based[%E2%80%A6]ity-search&utm_medium=organic-search&utm_term=Multiple+SSO",
//           },
//           {
//             title: "Know how to Renew your SSL Certificate",
//             subTitle: "6 min read",
//             resourceType: "read",
//             resourceImage: null,
//             clientId: "tls-automation-api",
//             link: "https://community.phenom.com/kb/articles/11370-certificate-manager-ssl-certificate",
//           },
//         ],
//         responseFormatter: (response: any) => {
//           let resourceAccess =
//             window.keycloakInstance.tokenParsed.resource_access;

//           return response
//             .filter((item: any) => {
//               let clientId =
//                 window?.orgInfo?.type.toLowerCase() !== "partner"
//                   ? window?.orgInfo?.code?.toLowerCase() + "-" + item?.clientId
//                   : item?.clientId;
//               return Object.keys(resourceAccess).includes(clientId);
//             })
//             .map((data: any, index: number) => {
//               return {
//                 ...data,
//                 resourceImage:
//                   data.resourceType === "read" ? clockIcon : videoIcon,
//                 icon: data.resourceType === "read" ? bigBook : bigVideo,
//                 backgroundStyles: {
//                   backgroundColor: getIconBgColor(index),
//                   borderRadius: "50px",
//                 },
//               };
//             });
//         },
//       },
//       card: {
//         icon: "$icon",
//         onclick: (link: any) => {
//           window.open(link, "_blank");
//         },
//         link: "$link",
//         backgroundStyles: "$backgroundStyles",
//         tiles: [
//           {
//             titles: [{ text: "$title" }],
//             subtitles: [
//               {
//                 text: "$subTitle",
//                 image: "$resourceImage",
//               },
//             ],
//           },
//         ],
//       },
//     },
//   ];

//   let actionsData = {
//     heading: "Actions for you",
//     tooltip: "Tasks assigned to you for your prompt attention",
//     count: null,
//     cardType: "detailed",
//     showmoreLimit: 3,
//     // link: {
//     //   text: "Go to APM",
//     //   url: null,
//     //   image: redirect,
//     //   onclick: () => {
//     //     if (
//     //       (!selectedTenant || Object.entries(selectedTenant)?.length === 0) &&
//     //       customerTenantsList
//     //     ) {
//     //       selectedTenant = customerTenantsList.find(
//     //         (item: any) => item.isParent
//     //       );
//     //       if (!selectedTenant) {
//     //         selectedTenant = customerTenantsList[0];
//     //       }
//     //       dispatch(setSelectedTenant(selectedTenant));
//     //     }
//     //     sessionStorage.setItem("currentContext", TENANT);
//     //     const apmApp = getAppByName(allApps, "Apm");
//     //     apmApp && sessionStorage.setItem("selectedApp", JSON.stringify(apmApp));
//     //     dispatch(setAppDetails(apmApp));
//     //     navigate(
//     //       `/${customerDetails?.data?.customerCode}/${selectedTenant.refNum}/apm`
//     //     );
//     //   },
//     // },
//     apiconfig: {
//       // url: "https://apm-dev.phenom.com/api/alert/products/service_hub_api?isMonitoringEnabled=true",
//       url: `${(window as any)._env_.APM_ALERTS_ENDPOINT}${
//         window?.orgInfo?.type.toLowerCase() === "partner"
//           ? "/alert/products/service_hub_api?isMonitoringEnabled=true"
//           : "/customers/alerts/details"
//       }`,
//       method: API_METHOD.POST,
//       response: null,
//       payload:
//         window?.orgInfo?.type.toLowerCase() === "partner"
//           ? {
//               product: "service_hub_api",
//               status: "new",
//               to: apmFormattedDate(new Date()),
//               from: apmFormattedDate(
//                 new Date(
//                   new Date().getFullYear(),
//                   new Date().getMonth() - 2,
//                   new Date().getDate()
//                 )
//               ),
//               page: 0,
//               size: 100,
//               searchTerm: "",
//               sortBy: "",
//               sortDirection: "",
//               columnFilters: {
//                 refNum: customerTenantsList.map((data: any) => {
//                   return data.refNum;
//                 }),
//               },
//             }
//           : {
//               sortBy: "",
//               sortDirection: "",
//               columnFilters: {
//                 sourceOfAlert: ["ATS"],
//                 status: ["open"],
//               },
//             },
//       responseFormatter: (response: any) => {
//         let json = OverViewWidgetData;

//         let responseData = response.filter((event: any) => {
//           return ALERT_TYPE_CODES.includes(event.alertTypeCode);
//         });

//         responseData = responseData.map((res: any) => {
//           if (
//             res.alertTypeCode === "certificate_manager" ||
//             res.alertTypeCode === "certificate_expiry" ||
//             res.alertTypeCode === "idp_certificate_expiry_alert"
//           ) {
//             return { ...res, btnText: "Renew Certificate" };
//           } else if (res.alertTypeCode === "credential_expiry_alert") {
//             return { ...res, btnText: "Renew Credential" };
//           } else {
//             return { ...res, btnText: "Take Action" };
//           }
//         });

//         json.card[2].data = responseData.length;

//         setOverViewWidgetData(json);
//         setActionsCountCount(responseData.length);

//         let res = responseData.map((data: any, index: number) => {
//           return {
//             ...data,
//             backgroundStyles: {
//               backgroundColor: "#FCD9DD",
//               borderRadius: "50px",
//             },
//             // expiryDate: "2024-03-22",
//           };
//         });

//         return res;
//       },
//       apiFailure: () => {
//         let json = OverViewWidgetData;
//         json.card[2].data = "_";
//         setActiveAlertsCount("_");
//         setOverViewWidgetData(json);
//       },
//     },
//     card: {
//       icon: actions,
//       backgroundStyles: "$backgroundStyles",
//       tiles: [
//         {
//           titles: [
//             {
//               text: "$expiryDate",
//               formatter: (data: any) => {
//                 const expiryDateString = getChildObject(data, "expiryDate");

//                 const differenceInDays = expiryDateString
//                   ? getDateDifference(expiryDateString)
//                   : "";

//                 let alertTypeCode = getChildObject(data, "alertTypeCode");

//                 return getAlertMessage(alertTypeCode, differenceInDays);
//               },
//             },
//           ],
//           subtitles: [
//             {
//               text: "$refNum",
//               formatter: (data: any) => {
//                 let refNum = getChildObject(data, "refNum");
//                 let tenantName = customerTenantsList.map((element: any) => {
//                   if (element.refNum === refNum) {
//                     return element.tenantName;
//                   }
//                 });
//                 return tenantName;
//               },
//             },
//             {
//               image: calender, // Replace with image URL
//               text: "$createdAt",
//               formatter: (data: any) => {
//                 return (
//                   <span>
//                     Open since{" "}
//                     <span className="text-underline">
//                       {getFormattedActivityLogDate(
//                         getChildObject(data, "createdAt")
//                       )}
//                     </span>
//                   </span>
//                 );
//               },
//             },
//           ],
//         },
//         {
//           titles: [
//             {
//               text: "$teamName",
//               formatter: (data: any) => {
//                 let alertTypeCode = getChildObject(data, "alertTypeCode");
//                 if (
//                   alertTypeCode === "certificate_manager" ||
//                   alertTypeCode === "certificate_expiry"
//                 ) {
//                   return "Career Site";
//                 } else if (alertTypeCode === "idp_certificate_expiry_alert") {
//                   return "Login";
//                 } else if (alertTypeCode === "credential_expiry_alert") {
//                   return "Integrations";
//                 }
//                 return getChildObject(data, "teamName");
//               },
//             },
//           ],
//           subtitles: [
//             {
//               text: "Services Impacted",
//             },
//           ],
//         },
//         {
//           type: "button",
//           btnText: "$btnText",
//           redirectUrlInfo: null,
//           redirectUrl: null,
//           redirectResolver: (response: any) => {
//             if (
//               response.alertTypeCode === "certificate_manager" ||
//               response.alertTypeCode === "certificate_expiry"
//             ) {
//               if (response.certificateId) {
//                 return `${response.refNum}/certificateManager/${response.certificateId}/re-create-certificate`;
//               }
//               return `${response.refNum}/certificateManager`;
//             } else if (response.alertTypeCode === "credential_expiry_alert") {
//               return response.alertTypeCode + "," + response.refNum;
//             }
//             return response.alertTypeCode;
//           },
//           onclick: (redirectUrlInfo: string) => {
//             if (redirectUrlInfo === "idp_certificate_expiry_alert") {
//               sessionStorage.setItem("currentContext", CUSTOMER_LEVEL);
//               const ssoConfigApp = getAppByName(allApps, "SSO Configuration");
//               ssoConfigApp &&
//                 sessionStorage.setItem(
//                   "selectedApp",
//                   JSON.stringify(ssoConfigApp)
//                 );
//               dispatch(setAppDetails(ssoConfigApp));
//               navigate(`/${customerDetails?.data?.customerCode}/sso-config`);
//             } else if (redirectUrlInfo.includes("credential_expiry_alert")) {
//               let parts = redirectUrlInfo.split(",");
//               let refNum = parts[1];
//               selectedTenant = customerTenantsList.find(
//                 (item: any) => item.refNum === refNum
//               );
//               if (!selectedTenant) {
//                 selectedTenant = customerTenantsList[0];
//               }
//               dispatch(setSelectedTenant(selectedTenant));

//               sessionStorage.setItem("currentContext", TENANT);
//               const credManagerApp = getAppByName(
//                 allApps,
//                 "Credential Manager"
//               );
//               credManagerApp &&
//                 sessionStorage.setItem(
//                   "selectedApp",
//                   JSON.stringify(credManagerApp)
//                 );
//               dispatch(setAppDetails(credManagerApp));
//               navigate(
//                 `/${customerDetails?.data?.customerCode}/${refNum}/credentials`
//               );
//             } else if (redirectUrlInfo.includes("certificateManager")) {
//               let indexOfCertManager =
//                 redirectUrlInfo.indexOf("certificateManager");

//               // Extract the substring before "certificateManager"
//               let refNum = redirectUrlInfo.substring(0, indexOfCertManager - 1);
//               selectedTenant = customerTenantsList.find(
//                 (item: any) => item.refNum === refNum
//               );
//               if (!selectedTenant) {
//                 selectedTenant = customerTenantsList[0];
//               }
//               console.log("selectedTenant ", { selectedTenant }, " refNum ", {
//                 refNum,
//               });
//               dispatch(setSelectedTenant(selectedTenant));
//               sessionStorage.setItem("currentContext", TENANT);
//               const sslManagerApp = getAppByName(allApps, "SSL Certificates");
//               sslManagerApp &&
//                 sessionStorage.setItem(
//                   "selectedApp",
//                   JSON.stringify(sslManagerApp)
//                 );
//               dispatch(setAppDetails(sslManagerApp));
//               navigate(
//                 `/${customerDetails?.data?.customerCode}/${redirectUrlInfo}`
//               );
//             }
//           },
//         },
//       ],
//     },
//   };

//   let ticketsData = {
//     heading: "Open Support Tickets",
//     tooltip: "Total number of open support tickets assigned to this customer",
//     count: null,
//     showmoreLimit: 3,
//     cardType: "detailed",
//     // link: {
//     //   text: "View more Tickets",
//     //   // url: "https://phenomdev.service-now.com",
//     //   url: `${(window as any)._env_.SERVICENOW_TICKETS}`,
//     //   image: redirect, // Replace with your image URL
//     // },
//     apiconfig: {
//       url: `
//       ${
//         (window as any)._env_.TOOLS_API_URL
//       }api/servicenow?refNums=${customerTenantsList
//         ?.map((tenant: any) => {
//           return tenant?.refNum;
//         })
//         ?.join(",")}`,
//       // url: `
//       // http://localhost:8089/servicenow?refNums=${customerDetails.data?.tenantRefnums?.join(
//       //   ","
//       // )}`,
//       method: API_METHOD.GET,
//       response: "",
//       onResponse: (response: any) => {
//         let json = OverViewWidgetData;
//         json.card[1].data = response.length;
//         setOverViewWidgetData(json);
//         setSupportTicketCount(response.length);
//       },
//       apiFailure: () => {
//         let json = OverViewWidgetData;
//         json.card[1].data = "_";
//         setSupportTicketCount("_");
//         setOverViewWidgetData(json);
//       },
//     },
//     card: {
//       icon: null,
//       tiles: [
//         {
//           titles: [
//             {
//               text: "$ticketId",
//               formatter: (data: any) => {
//                 // return `Last updated on ${getFormattedActivityLogDate(
//                 //   getChildObject(data, "lastUpdatedOn")
//                 // )}`;
//                 let dateDiff = getDateDifference(
//                   getFormattedActivityLogDate(
//                     getChildObject(data, "openSince")
//                   ),
//                   true
//                 );
//                 return (
//                   <span>
//                     {getChildObject(data, "ticketId")}
//                     <span className="hover-field">
//                       <span className="hover-text">
//                         Created on Oct{" "}
//                         {getFormattedActivityLogDate(
//                           getChildObject(data, "openSince")
//                         )}
//                       </span>
//                       <span className="openfrom">
//                         Open since {dateDiff} {dateDiff > 1 ? " days" : " day"}
//                       </span>
//                     </span>
//                   </span>
//                 );
//               },
//             },
//           ],
//           subtitles: [
//             {
//               text: "$refNum",
//               formatter: (data: any) => {
//                 let refNum = getChildObject(data, "refNum");
//                 let tenantName = customerTenantsList.map((element: any) => {
//                   if (element.refNum === refNum) {
//                     return element.tenantName;
//                   }
//                 });
//                 return tenantName;
//               },
//             },
//             {
//               image: calender,
//               text: "$lastUpdatedOn",
//               formatter: (data: any) => {
//                 // return `Last updated on ${getFormattedActivityLogDate(
//                 //   getChildObject(data, "lastUpdatedOn")
//                 // )}`;

//                 return (
//                   <span>
//                     Last updated on{" "}
//                     <span className="text-underline">
//                       {getFormattedActivityLogDate(
//                         getChildObject(data, "lastUpdatedOn")
//                       )}
//                     </span>
//                     {/* <span className="hover-text">
//                       Created on Oct{" "}
//                       {getFormattedActivityLogDate(
//                         getChildObject(data, "openSince")
//                       )}
//                     </span> */}
//                   </span>
//                 );
//               },
//             },
//           ],
//         },
//         {
//           titles: [
//             {
//               text: "$createdBy",
//             },
//           ],
//           subtitles: [
//             {
//               text: "Assigned to",
//             },
//           ],
//         },
//         {
//           type: "button",
//           btnText: "View",
//           redirectUrlInfo: null,
//           redirectResolver: (response: any) => {
//             // return `https://phenomdev.service-now.com/sn_customerservice_case.do?sys_id=${response.ticketSysId}&sysparm_stack=&sysparm_view=`;
//             return `${
//               (window as any)._env_.SERVICENOW_TICKETS
//             }/sn_customerservice_case.do?sys_id=${
//               response.ticketSysId
//             }&sysparm_stack=&sysparm_view=`;
//           },
//           onclick: (redirectUrlInfo: any) => {
//             window.open(redirectUrlInfo, "_blank");
//           },
//         },
//       ],
//     },
//   };

//   let alertsData = {
//     heading: "Active Alerts",
//     tooltip: "Real-time notifications needing immediate attention",
//     count: null,
//     cardType: "detailed",
//     // link: {
//     //   text: "Go to APM",
//     //   url: null,
//     //   image: redirect,
//     //   onclick: () => {
//     //     if (
//     //       (!selectedTenant || Object.entries(selectedTenant)?.length === 0) &&
//     //       customerTenantsList
//     //     ) {
//     //       selectedTenant = customerTenantsList.find(
//     //         (item: any) => item.isParent
//     //       );
//     //       if (!selectedTenant) {
//     //         selectedTenant = customerTenantsList[0];
//     //       }
//     //       dispatch(setSelectedTenant(selectedTenant));
//     //     }
//     //     sessionStorage.setItem("currentContext", TENANT);
//     //     const apmApp = getAppByName(allApps, "Apm");
//     //     apmApp && sessionStorage.setItem("selectedApp", JSON.stringify(apmApp));
//     //     dispatch(setAppDetails(apmApp));
//     //     navigate(
//     //       `/${customerDetails?.data?.customerCode}/${selectedTenant.refNum}/apm`
//     //     );
//     //   },
//     // },
//     apiconfig: {
//       // url: "https://apm-dev.phenom.com/api/alert/products/service_hub_api?isMonitoringEnabled=true",
//       url: `${(window as any)._env_.APM_ALERTS_ENDPOINT}${
//         window?.orgInfo?.type.toLowerCase() === "partner"
//           ? "/alert/products/service_hub_api?isMonitoringEnabled=true"
//           : "/customers/alerts/details"
//       }`,
//       method: API_METHOD.POST,
//       response: null,
//       payload:
//         window?.orgInfo?.type.toLowerCase() === "partner"
//           ? {
//               product: "service_hub_api",
//               status: "new",
//               to: apmFormattedDate(new Date()),
//               from: apmFormattedDate(
//                 new Date(
//                   new Date().getFullYear(),
//                   new Date().getMonth() - 2,
//                   new Date().getDate()
//                 )
//               ),
//               page: 0,
//               size: 100,
//               searchTerm: "",
//               sortBy: "",
//               sortDirection: "",
//               columnFilters: {
//                 refNum: customerTenantsList.map((data: any) => {
//                   return data.refNum;
//                 }),
//               },
//             }
//           : {
//               sortBy: "",
//               sortDirection: "",
//               columnFilters: {
//                 sourceOfAlert: ["ATS"],
//                 status: ["open"],
//               },
//             },
//       responseFormatter: (response: any) => {
//         let json = OverViewWidgetData;

//         let responseData = response.filter((event: any) => {
//           return !ALERT_TYPE_CODES.includes(event.alertTypeCode);
//         });

//         json.card[1].data = responseData.length;

//         setOverViewWidgetData(json);
//         setActiveAlertsCount(responseData.length);

//         return responseData;
//       },
//       apiFailure: () => {
//         let json = OverViewWidgetData;
//         json.card[1].data = "_";
//         setActiveAlertsCount("_");
//         setOverViewWidgetData(json);
//       },
//     },
//     showmoreLimit: 3,
//     card: {
//       tiles: [
//         {
//           titles: [{ text: "$summary" }],
//           subtitles: [
//             {
//               text: "$refNum",
//               formatter: (data: any) => {
//                 let refNum = getChildObject(data, "refNum");
//                 let tenantName = customerTenantsList.map((element: any) => {
//                   if (element.refNum === refNum) {
//                     return element.tenantName;
//                   }
//                 });
//                 return tenantName;
//               },
//             },
//             {
//               image: calender,
//               text: "$alertStartedAt",
//               formatter: (data: any) => {
//                 return (
//                   <span>
//                     Alerted on{" "}
//                     <span className="text-underline">
//                       {getFormattedActivityLogDate(
//                         getChildObject(data, "alertStartedAt")
//                       )}
//                     </span>
//                   </span>
//                 );
//               },
//             },
//           ],
//         },
//         {
//           titles: [
//             {
//               text: "$teamName",
//             },
//           ],
//           subtitles: [
//             {
//               text: "Services Impacted",
//             },
//           ],
//         },
//         {
//           type: "button",
//           btnText: "View Alert Details",
//           redirectUrlInfo: null,
//           redirectUrl: null,
//           redirectResolver: (response: any) => {
//             // return `https://apm-dev.phenom.com/alert/${response.product}/US/${response.alertId}/details`;
//             return ` ${(window as any)._env_.APM_ALERTS_ENDPOINT}/${
//               response.product
//             }/US/${response.alertId}/details`;
//           },
//           onclick: () => {
//             if (
//               (!selectedTenant ||
//                 Object.entries(selectedTenant)?.length === 0) &&
//               customerTenantsList
//             ) {
//               selectedTenant = customerTenantsList.find(
//                 (item: any) => item.isParent
//               );
//               if (!selectedTenant) {
//                 selectedTenant = customerTenantsList[0];
//               }
//               dispatch(setSelectedTenant(selectedTenant));
//             }
//             sessionStorage.setItem("currentContext", TENANT);
//             const apmApp = getAppByName(allApps, "Apm");
//             apmApp &&
//               sessionStorage.setItem("selectedApp", JSON.stringify(apmApp));
//             dispatch(setAppDetails(apmApp));
//             navigate(
//               `/${customerDetails?.data?.customerCode}/${selectedTenant.refNum}/apm`
//             );
//           },
//         },
//       ],
//     },
//   };

//   let tenantsData = {
//     heading: "Your Tenants",
//     tooltip: "Quick access to tenant details",
//     count: null,
//     link: null,
//     cardType: "detailed",
//     showmoreLimit: 3,
//     apiconfig: {
//       // url: `http://localhost:8089/customerinfo/${customerDetails.data.id}`,
//       url: `${(window as any)._env_.TOOLS_API_URL}api/customerinfo/${
//         customerDetails.data.id
//       }`,
//       method: API_METHOD.GET,
//       response: "",
//       onResponse: (response: any) => {
//         let json = OverViewWidgetData;
//         json.card[0].data = response.length;
//         setOverViewWidgetData(json);
//         setTenantsCount(response.length);
//       },
//       apiFailure: () => {
//         let json = OverViewWidgetData;
//         json.card[0].data = "_";
//         setTenantsCount("_");
//         setOverViewWidgetData(json);
//       },
//       responseFormatter: (response: any) => {
//         return response.map((data: any, index: number) => {
//           return {
//             ...data,
//             backgroundStyles: {
//               backgroundColor: "#F4F6FA",
//               borderRadius: "10px",
//             },
//           };
//         });
//       },
//     },
//     card: {
//       icon: defaultTenantIcon,
//       backgroundStyles: "$backgroundStyles",
//       onclick: (data: any) => {
//         let refNum = data.tiles[0]?.subtitles[0]?.text;
//         const currentTenant = customerTenantsList.find(
//           (tenant: any) => tenant.refNum === refNum
//         );
//         dispatch(setSelectedTenant(currentTenant));

//         sessionStorage.setItem("currentContext", TENANT);
//         const tenantSettings = getAppByName(allApps, "Tenant Information");
//         tenantSettings &&
//           sessionStorage.setItem("selectedApp", JSON.stringify(tenantSettings));
//         dispatch(setAppDetails(tenantSettings));

//         // navigate(
//         //   `/${customerDetails?.data?.customerCode}/${refNum}/tenant-settings`
//         // );
        
//         const moduleProps ={
//           logedUserRoles : customerDetails?.user,
//           selectedCustomerDetails: customerDetails?.data,
//           selectedTenants: customerDetails?.selectedTenant ,
//           totalTenants: customerDetails?.allTenants,
//           totalCustomerTenants:customerDetails?.customerTenants,
//         }

//         return(
//           <RemoteAppRenderer
//             module={tenantSettings?.appConfig.module}
//             component={tenantSettings?.appConfig.component}
//             url={tenantSettings?.appConfig?.url}
//             scope={tenantSettings?.appConfig?.scope}
//             props={moduleProps}
//             loading={tenantSettings?.appConfig?.loadingMessage}
//             envconfig={ tenantSettings?.appConfig?.envconfig}
//         />
//         )

//       },
//       tiles: [
//         {
//           titles: [
//             {
//               text: "$tenantName",
//               formatter: (data: any) => {
//                 return (
//                   <span className="tenant-field">
//                     {getChildObject(data, "tenantName")}
//                     {data.isParentTenant && (
//                       <span className="primary-tenant">
//                         <img src={starSvg} className="star-icon" />
//                         Primary Tenant
//                       </span>
//                     )}
//                   </span>
//                 );
//               },
//             },
//           ],
//           subtitles: [
//             {
//               text: "$refNum",
//             },
//             {
//               text: "$customerName",
//             },
//           ],
//         },
//         {
//           titles: [
//             {
//               text: "$usersCount",
//             },
//           ],
//           subtitles: [
//             {
//               text: "Total Users",
//             },
//           ],
//         },
//         {
//           titles: [
//             {
//               text: "$provisionedProductsCount",
//             },
//           ],
//           subtitles: [
//             {
//               text: "Provisioned Products",
//             },
//           ],
//         },
//       ],
//     },
//   };

//   const [OverViewWidgetData, setOverViewWidgetData] = useState({
//     heading: "Overview",
//     tooltip: "Essential HRIT metrics at a glance",
//     link: null,
//     cardType: "summary",
//     card: [
//       {
//         heading: "Your Tenants",
//         tooltip: "Number of tenants you have access to",
//         data: null,
//       },
//       // {
//       //   heading: "Open Support Tickets",
//       //   tooltip: "Number of open support tickets",
//       //   data: null,
//       // },
//       {
//         heading: "Active Alerts",
//         tooltip: "Number of active alerts needing your attention",
//         data: null,
//       },
//       {
//         heading: "Actions for you",
//         tooltip: "Number of tasks that need your action",
//         data: null,
//       },
//     ],
//   });

//   const [ListWidgetData, setListWidgetData] = useState(ListWidgetDetails);

//   const getLoggedInUserInfo = () => {
//     const loggedInUserEmail =
//       window.keycloakInstance?.userInfo?.userDetails.email;

//     const endPoint = apiUrl.getUserBySearch.replace(
//       "{username}",
//       loggedInUserEmail
//     );

//     API.get(`${(window as any)._env_.APP_API_URL}/${endPoint}`)
//       .then((res) => {
//         let response = res?.data?.data;
//         dispatch(setUserDetails(response));
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const [tenantsCount, setTenantsCount] = useState("0");
//   const [activeAlertsCount, setActiveAlertsCount] = useState();
//   const [actionsCount, setActionsCountCount] = useState();
//   const [supportTicketCount, setSupportTicketCount] = useState("0");

//   const navigate = useNavigate();

//   return customerDetails && customerDetails.data ? (
//     <div className="dashboard-container">
//       <div className="flex-container">
//         {/* <div className="left-sidebar">
//           <img className="dashboard-logo" src={dashBoardIcon} />
//           {showAppsMenu && <img
//             className="apps-logo"
//             src="https://servicehub-qa.phenompro.com/public/logos/app-switcher/appswitcher_new.svg"
//             onClick={handleBackClick}
//           />}
//         </div> */}
//         <div className="main-container">
//           <div className="user-container">
//             {userDetails?.profileImage ? (
//               <img className="user-img" src={userDetails.profileImage} />
//             ) : (
//               <Avatar
//                 userEmail={
//                   window.keycloakInstance?.tokenParsed?.userDetails?.userName
//                 }
//                 size="68"
//                 fontSize="20"
//               ></Avatar>
//             )}
//             <div className="user-details">
//               <div className="user-name">
//                 {getGreetingByTime()},{" "}
//                 {window?.keycloakInstance?.idTokenParsed?.name}!
//               </div>
//               <div className="user-subtitle">
//                 Welcome to your personalized HRIT summary
//               </div>
//             </div>
//           </div>
//           {OverViewWidgetData && <CardWidget widgetData={OverViewWidgetData} />}
//           {!actionLoader && (
//             <CardWidget
//               widgetData={actionsData}
//               isLoading={customerTenantsList.length === 0}
//             />
//           )}
//           {!actionLoader && (
//             <CardWidget
//               widgetData={alertsData}
//               isLoading={customerTenantsList.length === 0}
//             />
//           )}
//           {!actionLoader && (
//             <CardWidget
//               widgetData={tenantsData}
//               isLoading={customerTenantsList.length === 0}
//             />
//           )}
//           {/* {!actionLoader && (
//             <CardWidget
//               widgetData={ticketsData}
//               isLoading={customerTenantsList.length === 0}
//             />
//           )} */}
//         </div>

//         <div className="right-sidebar">
//           <PhenomPlatformStatus />
//           {ListWidgetData &&
//             ListWidgetData.map((object) => {
//               return <CardWidget widgetData={object} />;
//             })}
//         </div>
//       </div>
//     </div>
//   ) : (
//     <Loader />
//   );
// };

// export default DashBoard;
import React from 'react'

const DashBoard = () => {
  return (
    <div>
      DashBoard
    </div>
  )
}

export default DashBoard
