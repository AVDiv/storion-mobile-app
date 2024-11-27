import React from "react";
import "./SearchInput.css";

const SearchInput: React.FC = () => {
  return (
    <div className="search-input-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search for news..."
      />
    </div>
  );
};

export default SearchInput;
