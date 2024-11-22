import React from "react";

import "./Tag.css";

interface TagProps {
  className?: string;
  isNew?: boolean;
  content?: string;
}

const Tag: React.FC<TagProps> = ({ className, isNew, content }) => {
  return (
    <div className={`tag ${className && className}`}>
      {isNew && (
        <span className="tag-indicator">
          <svg width="12" height="12">
            <ellipse cx="6" cy="6" rx="6" ry="6" />
          </svg>
        </span>
      )}
      <span className="tag-content">{content}</span>
    </div>
  );
};

export default Tag;
