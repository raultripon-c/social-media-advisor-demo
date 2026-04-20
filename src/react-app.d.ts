declare module "phenom-auth-react-adapter";
declare module "@phenom/react-ui-components";
declare module "react-router-dom";

interface Window {
  _env_: Record<string, string>;
  pholly?: {
    isInitialized?: boolean;
    setGlobalAttributes?: (attributes: Record<string, unknown>) => void;
    clearBaggage?: () => void;
    setBaggage?: (baggage: Record<string, string>) => void;
    enableAutoNavigation?: (cb?: (data: unknown) => void) => void;
    destroy?: () => void;
  };
}
