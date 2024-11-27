export interface AppSelectionOptions {
  selectedApp: any;
  navigate: (path: string) => void; // Define the navigate function type
  customerCode: string;
  refNum: string;
  siteMetaData: any;
  dispatch: (action: any) => void; // Define the dispatch function type
  openInNewTab: boolean;
  setSiteMetaData: (data: any) => void; // Define the setSiteMetaData function type
  selectedTenant: any;
  customeRoute?: any;
}
