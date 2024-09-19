import React from "react";
export const useDynamicMFLoader = (args: any) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const isScriptAlreadyDownloaded = (scriptSrc: string) => {
    // Check if a script with the specified source already exists
    var existingScript = document.querySelector(
      'script[src="' + scriptSrc + '"]'
    );
    // If the script exists, return true
    if (existingScript) {
      return true;
    }
    // If the script doesn't exist, return false
    return false;
  };
  React.useEffect(() => {
    if (!args.url) {
      return;
    }
    if (!isScriptAlreadyDownloaded(args.url)) {
      const element = document.createElement("script");
      element.src = args.url;
      element.type = "text/javascript";
      element.async = true;
      setReady(false);
      setFailed(false);
      element.onload = () => {
        setReady(true);
      };
      element.onerror = () => {
        console.error(`Dynamic Script Error: ${args.url}`);
        setReady(false);
        setFailed(true);
      };
      document.head.appendChild(element);
    } else {
      setReady(true);
      setFailed(false);
    }
  }, [args.url]);


  return {
    ready,
    failed,
  };
};
