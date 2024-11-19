import React from "react";

export const useDynamicMFLoader = (args: any) => {
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  // Check if a script with the specified source already exists in the document
  const isScriptAlreadyDownloaded = (scriptSrc: string) => {
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    return existingScript !== null;
  };

  React.useEffect(() => {
    if (!args.url) {
      return;
    }

    // If the script has already been loaded, no need to download it again
    if (isScriptAlreadyDownloaded(args.url)) {
      setReady(true);
      setFailed(false);
      return;
    }

    // Create and load the script dynamically
    const scriptElement = document.createElement("script");
    scriptElement.src = args.url;
    scriptElement.type = "text/javascript";
    scriptElement.async = true;

    setReady(false);
    setFailed(false);

    // Handle script load success
    scriptElement.onload = () => {
      setReady(true);
      setFailed(false);
    };

    // Handle script load error
    scriptElement.onerror = () => {
      console.error(`Dynamic Script Error: ${args.url}`);
      setReady(false);
      setFailed(true);
    };

    // Append the script to the document head
    document.head.appendChild(scriptElement);

    // Cleanup: remove the script from the document when the component is unmounted
    return () => {
      document.head.removeChild(scriptElement);
    };
  }, [args.url]);

  return {
    ready,
    failed,
  };
};
