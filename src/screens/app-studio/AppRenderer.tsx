import React, { useEffect, useState } from "react";

import TabNav from "./navigation/TabNav";
import LeftNav from "./navigation/LeftNav";
import PageRenderer from "./renderer/PageRenderer";

import { API } from "../../utils/api";

import "./AppRenderer.scss";

function AppRenderer() {
  const [pages, setPages] = useState([]);
  const [appId, setAppId] = useState<any>();
  const [page, loadPage] = useState<any>();
  const [currentPage, setCurrentPage] = useState({} as any);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loadRenderer, setRenderer] = useState(true);

  useEffect(() => {
    const _appId = sessionStorage.getItem("selectedProductId");
    if (_appId !== null || _appId !== undefined) {
      setAppId(_appId);
      let id = parseInt(_appId || "");
      API.get(
        `${(window as any)._env_.APP_STUDIO_API_URL}/app-configs?id=${id}`
      ).then((response) => {
        const appDataForRenderer = response.data.data[0];
        sessionStorage.setItem(
          "selectedProduct",
          JSON.stringify(appDataForRenderer)
        );
        setPages(response.data.data[0].pages);
        loadPage(response.data.data[0].pages[0]);
      });
    }
  }, []);

  useEffect(() => {
    let options: any[] = [];
    let response = [...pages];
    response = response.sort((a: any, b: any) => {
      return a.id - b.id;
    });
    response.forEach((item: any) => {
      if (!item.parentPage) {
        options.push({
          ...item,
          showDropdown: false,
          children: [],
        });
      } else if (item.parentPage) {
        mapOptionsUsingParent(item, options);
      }
    });
    setCurrentPage(options[0]);
  }, [pages]);

  const mapOptionsUsingParent = (item: any, options: any[]) => {
    const parentIndex = options.findIndex(
      (option) => option.displayName === item.parentPage
    );

    if (parentIndex !== -1) {
      options[parentIndex].children.push({
        ...item,
        children: [],
      });
    } else {
      options.forEach((option) => {
        let stringValue = JSON.stringify(option.children);
        let regexPattern = new RegExp(item.parentPage);
        if (regexPattern.test(stringValue)) {
          mapOptionsUsingParent(item, option.children);
        }
      });
    }
  };

  const handleSelectChild = (child: any) => {
    setSelectedChild(child);
  };
  useEffect(() => {
    // Set the first child as the default selected child when the component mounts
    if (currentPage?.children) {
      const firstChild: any = Object.values(currentPage.children)[0];
      setSelectedChild(firstChild);
    }
  }, [currentPage]);

  useEffect(() => {
    setRenderer(false);
    setTimeout(() => {
      setRenderer(true);
    });
  }, [page]);

  return (
    <div className={"app-layout-app-studio app-" + appId}>
      {pages.length > 1 && (
        <div className="app-sidebar">
          <LeftNav
            menus={pages}
            setPage={loadPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      )}
      <div className="app-content">
        <h1 className="title no-select">{currentPage?.displayName}</h1>
        {currentPage?.viewType === "tab" && (
          <div className="app-header">
            {currentPage?.children && (
              <TabNav
                options={Object.values(currentPage.children)}
                toggleNavTab={(tab) => {
                  loadPage(tab);
                  handleSelectChild(tab);
                }}
                selectedTab={page ? page?.displayName : ""}
                hasBorder={true}
              />
            )}
          </div>
        )}
        {loadRenderer && <PageRenderer page={page}></PageRenderer>}
      </div>
    </div>
  );
}

export default AppRenderer;
