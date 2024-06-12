import React from 'react';

interface ToggleTabsProps {
  options: Array<{ displayName: string; /* other properties */ }>;
  toggleNavTab: (tab: any) => void; // Update the type of toggleNavTab
  selectedTab: string;
  hasBorder?: boolean;
}

const TabNav: React.FC<ToggleTabsProps> = ({
  options,
  toggleNavTab,
  selectedTab,
  hasBorder = true,
}) => {
  return (
    <div
      className={`${hasBorder && "tls-border-bottom"} tls-nav-tabs no-select`}
    >
      {options.map((item, key) => (
        <div
          key={key}
          onClick={() => {toggleNavTab(item)}} // Pass the entire page object
          className={`tab-item ${selectedTab === item.displayName && "selected-tab"}`}
        >
          {item.displayName}
        </div>
      ))}
    </div>
  );
};

export default TabNav;

