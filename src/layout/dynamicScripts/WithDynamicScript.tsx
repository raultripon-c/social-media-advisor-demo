import React from "react";
import DynamicScriptLoader from "./DynamicScriptLoader";

export function withDynamicScript(scriptName: string) {
  return function (props: any) {
    return (
      <>
        <DynamicScriptLoader scriptName={scriptName} />
      </>
    );
  };
}
