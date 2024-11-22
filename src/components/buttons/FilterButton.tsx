import React from "react";

import "./FilterButton.css";

interface FilterButtonProps {
  className?: string;
  content?: string;
  active?: boolean;
  onToggle?: (content: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  className,
  content,
  active,
  onToggle,
}) => {
  const handleClick = () => {
    if (onToggle && content) {
      onToggle(content);
    }
  };

  return (
    <button
      className={`filter-button ${active ? "active" : ""} ${className || ""}`}
      onClick={handleClick}
    >
      {content}
    </button>
  );
};

export default FilterButton;
