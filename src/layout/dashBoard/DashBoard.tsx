import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EmptyState, Loader } from "@phenom/react-ui-components";
import { AppStore } from "store";
import { Search } from "../../components/TenantSearch/TenantsSearch";
import { setAppDetails, setAppsFromAPI } from "../../store/apps/actions";
import { APIService } from "../../utils/api.service";
import { appSelectionHandler } from "../../utils/appUtils";

const DashBoard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTenant = useSelector(
    (state: AppStore) => state.customer.selectedTenant
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKey, setSearchKey] = useState<string>("");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [totalAppsData, setTotalAppsData] = useState<any[]>([]);

  const getAllApps = async () => {
    try {
      const response = await APIService.getAllApps();
      if (response) {
        const sortedData = response.data.data.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
        sessionStorage.setItem("allapps", JSON.stringify(sortedData));
        setTotalAppsData(sortedData);
        setFilteredData(sortedData);
        dispatch(setAppsFromAPI(sortedData));
      }
    } catch (error) {
      setTotalAppsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    sessionStorage.removeItem("currentContext");
    dispatch(setAppDetails({}));
    sessionStorage.removeItem("selectedApp");

    const apps = JSON.parse(sessionStorage.getItem("allapps") || "[]");

    if (apps.length === 0) {
      getAllApps();
    } else {
      setTotalAppsData(apps);
      setFilteredData(apps);
      dispatch(setAppsFromAPI(apps));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const data = totalAppsData.filter((eachCustomer: any) =>
      eachCustomer.name.toLowerCase().includes(searchKey.toLowerCase())
    );
    setFilteredData(data);
  }, [searchKey, totalAppsData]);

  const navigateToApp = (selectedApp: any) => {
    sessionStorage.setItem("selectedApp", JSON.stringify(selectedApp));
    dispatch(setAppDetails(selectedApp));
    appSelectionHandler(
      selectedApp,
      navigate,
      selectedTenant?.customerCode,
      selectedTenant?.refNum
    );
  };

  if (isLoading) {
    return (
      <div className="tenants-loader">
        <Loader title="Please Wait, Loading Customers" />
      </div>
    );
  }

  return (
    <div className="tenants-container">
      <div className="tenants-header">
        <div className="search-container">
          <Search
            placeholder="Search Customer"
            onValueChange={(e: any) => setSearchKey(e.target.value)}
            size="medium"
            at_id="tenant-search"
          />
        </div>
      </div>
      {totalAppsData.length !== 0 ? (
        <div className="tenant-list">
          {filteredData
            .filter((app: any) => !app.isParent)
            .map((eachApp: any) => (
              <div
                className="tenant-card"
                key={eachApp.name}
                onClick={() => navigateToApp(eachApp)}
              >
                <span>{eachApp.name}</span>
              </div>
            ))}
          {filteredData.length === 0 && (
            <div className="no-customer-found">No Apps found</div>
          )}
        </div>
      ) : (
        <EmptyState displayText="No Apps found" />
      )}
    </div>
  );
};

export default DashBoard;
