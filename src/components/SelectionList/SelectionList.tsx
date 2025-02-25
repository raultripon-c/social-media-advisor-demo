import React, { useState } from "react";
import "./SelectionList.css";

interface SelectionListProps {
  items: string[];
  onChange: (updatedItems: string[]) => void;
  maxVisible?: number;
}

const SelectionList: React.FC<SelectionListProps> = ({
  items,
  onChange,
  maxVisible = 4
}) => {
  // Whether to show all items (expanded) or only a subset
  const [showAll, setShowAll] = useState(false);

  // If not showing all, limit the visible items to "maxVisible"
  const visibleItems = showAll ? items : items.slice(0, maxVisible);
  const hiddenCount = items.length - visibleItems.length;

  /** Remove an item from the list and inform the parent */
  const handleRemove = (item: string) => {
    const updatedItems = items.filter((i) => i !== item);
    onChange(updatedItems);
  };

  return (
    <div className="selection-list">
      {visibleItems.map((item) => (
        <div className="selection-item" key={item}>
          <span className="item-name">{item}</span>
          <button className="remove-button" onClick={() => handleRemove(item)}>
            &times;
          </button>
        </div>
      ))}

      {/* If there are hidden items and we're not showing all, display a "+N" chip */}
      {hiddenCount > 0 && !showAll && (
        <div
          className="selection-item plus-item"
          onClick={() => setShowAll(true)}
        >
          +{hiddenCount}
        </div>
      )}

      {/* Optionally show a "Show Less" or arrow if expanded */}
      {showAll && (
        <button className="toggle-button" onClick={() => setShowAll(false)}>
          Show Less
        </button>
      )}
    </div>
  );
};

export default SelectionList;
