import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Nav.scss";

interface Props {
  menus: any;
  setPage: any;
  setCurrentPage?: any;
  currentPage?: any;
}

function LeftNav({ menus, setPage, setCurrentPage, currentPage }: Props) {
  const navigate = useNavigate();

  const [sidebarOptions, setSidebarOptions] = useState({});
  const [selectedPage, setSelectedPage] = useState({});

  useEffect(() => {
    let options: any = {};
    let response = [...menus];
    response = response.sort((a, b) => {
      return a.id - b.id;
    });
    response.forEach((item) => {
      if (!item.parentPage) {
        options[item.displayName] = {
          ...item,
          showDropdown: item.viewType === "sidebar" ? true : false,
          children: {},
        };
      } else if (item.parentPage) {
        mapOptionsUsingParent(item, options);
      }
    });
    let optionValues = Object.values(options);
    if (optionValues.length > 0) {
      toggleChild({ item: optionValues[0], options });
    }
  }, []);

  const mapOptionsUsingParent = (item: any, options: any) => {
    if (Object.keys(options).includes(item.parentPage)) {
      options[item.parentPage].children[item.displayName] = {
        ...item,
        children: {},
      };
    } else {
      Object.keys(options).forEach((key) => {
        let stringValue = JSON.stringify(options[key].children);
        let regexPattern = new RegExp(item.parentPage);
        if (regexPattern.test(stringValue)) {
          mapOptionsUsingParent(item, options[key].children);
        }
      });
    }
  };

  const updateToggleStatus = (options: any, selectedOption: any) => {
    Object.keys(options).forEach((key) => {
      let item = options[key];
      if (
        JSON.stringify(item) === JSON.stringify(selectedOption) &&
        (!item.children.length || item.viewType === "tab")
      ) {
        setSelectedPage(item);
      } else if (Object.keys(item.children).length > 0) {
        updateToggleStatus(item.children, selectedOption);
      }
    });
  };

  const toggleChild = ({ item, options }: any) => {
    let _sidebarOptions = { ...options };
    let childrenArray: any = Object.values(item.children);
    if (childrenArray.length > 0) {
      navigate(`/apps/${childrenArray[0]?.routePath}`);
    }
    let routePath = !item.routePath.startsWith("/")
      ? `/${item.routePath}`
      : item.routePath;
    updateToggleStatus(_sidebarOptions, item);
    setPage(item);
    setCurrentPage(item);
    if (childrenArray.length > 0 && item.viewType === "sidebar") {
      updateToggleStatus(_sidebarOptions, childrenArray[0]);
    }
    if (childrenArray.length > 0) {
      routePath = !childrenArray[0].routePath.startsWith("/")
        ? `/${childrenArray[0].routePath}`
        : childrenArray[0].routePath;
      setPage(childrenArray[0]);
    }
    setSidebarOptions(_sidebarOptions);
    if (routePath) {
      navigate(`/apps${routePath}`);
    }
  };
  function handleRouteChange() {
    // Access the updated route here
    const currentRoute = window.location.pathname;
    const findPageByRoutePath = (pages: any, routePath: any) => {
      return pages.find((page: any) => page.routePath === routePath);
    };

    // Function to find a page by displayName
    let findPageByDisplayName = (pages: any, displayName: any) => {
      return pages.find((page: any) => page.displayName === displayName);
    };
    findPageByDisplayName = (pages: any, displayName: any) => {
      return pages[displayName];
    };
    setTimeout(() => {
      if (currentRoute) {
        const path = currentRoute?.split("/");
        const route = path.length > 0 ? path[path.length - 1] : "";
        const redirectedPageDetails = findPageByRoutePath(menus, route);
        if (redirectedPageDetails?.parentPage) {
          const parentPageDisplayName = redirectedPageDetails.parentPage;
          if (!parentPageDisplayName) {
            setCurrentPage(redirectedPageDetails);
            updateToggleStatus(sidebarOptions, redirectedPageDetails);
          } else {
            const parentPageObject = findPageByDisplayName(
              sidebarOptions,
              parentPageDisplayName
            );
            setCurrentPage(parentPageObject);
            updateToggleStatus(sidebarOptions, parentPageObject);
          }
          setPage(redirectedPageDetails);
        }
      }
    });
  }
  // Add a listener for the popstate event
  window.addEventListener("pushstate", handleRouteChange);

  const renderChildMenus = (options: any) => {
    return Object.keys(options).map((key) => {
      let item = options[key];
      return (
        <ul key={key} className="sidebar-item">
          {!item.hidden && (
            <li
              onClick={() => {
                toggleChild({ item, options: sidebarOptions });
              }}
              className={`${
                JSON.stringify(item) === JSON.stringify(selectedPage) &&
                "sidebar-active-element"
              }`}
            >
              {key}
            </li>
          )}
          <div className="options-nested-ctn">
            {item.showDropdown &&
              Object.keys(item.children).length > 0 &&
              renderChildMenus(item.children)}
          </div>
        </ul>
      );
    });
  };

  return (
    <div className="apply-sidebar-container sidebar-container">
      {renderChildMenus(sidebarOptions)}
    </div>
  );
}

export default LeftNav;
