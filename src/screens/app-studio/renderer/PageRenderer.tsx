import React, { useEffect, useState } from "react";

interface Props {
  page: any;
}

function PageRenderer({ page }: Props) {
  const [currentPage, setCurrentPage] = useState({} as any);
  useEffect(() => {
    const _app = sessionStorage.getItem("selectedProduct");
    let app: any = {};
    if (page) {
      if (_app) {
        app = JSON.parse(_app);
      }
      setCurrentPage(page);
      injectCssLink(
        `https://cdn-qa-static.phenompeople.com/CareerConnectResources/${
          app.experience
        }/${app.module}/${app.name}/pages/${
          page?.displayName
        }/PAGE_SCHEMA.css?date=${new Date().getTime()}`
      );
      injectCssLink(
        ` https://cdn-prod-static.phenompeople.com/CareerConnectResources/COMMON/css/apply/react-datepicker.min.css`
      );

      (window as any).phApp = {
        ddo: {
          applySchema: {
            data: {
              env: "QA",
              schemaPath: `CareerConnectResources/${app.experience}/${
                app.module
              }/${app.name}/pages/${
                page?.displayName
              }/PAGE_SCHEMA.json?date=${new Date().getTime()}`,
              // schemaPath: "",
            },
          },
        },
      };
      //CareerConnectResources/GRSLGB/js/apply/APPLY_form_renderer.js
      (window as any).phApp.refNum = "IX";
      const previousElement: any = document.querySelector(
        "[render='form-renderer']"
      );
      if (previousElement?.length) {
        previousElement[0].remove();
      }
      var imported = document.createElement("script");
      imported.setAttribute("render", "form-renderer");

      // imported.src =
      //   "https://cdn-stg-static.phenompeople.com/CareerConnectResources/COMMON/js/applyStudioBundles/apply/studio/qa/APPLY_form_renderer.js";
      //https://cdn-stg-static.phenompeople.com/CareerConnectResources/COMMON/js/appstudio/form-renderer/APPLY.v1.js
      imported.src =
        "https://cdn-qa-static.phenompeople.com/CareerConnectResources/COMMON/js/appstudio/form-renderer/APPLY.v11.js";
      document.head.appendChild(imported);
      // }
    }
  }, [page]);
  const injectCssLink = (url: any) => {
    const link = document.createElement("link");
    link.href = url;
    link.rel = "stylesheet";
    document.head.append(link);
  };
  return (
    <div>
      <div
        className={`ph-apply-box page-${currentPage?.id} form-${currentPage?.formId}`}
      ></div>
    </div>
  );
}
export default PageRenderer;
