import React, { useState } from "react";
import "./FilterBody.css";
import FilterButton from "../../buttons/FilterButton";

const filters = [
  { id: 1, content: "For You" },
  { id: 2, content: "Business" },
  { id: 3, content: "Technology" },
  { id: 4, content: "Entertainment" },
  { id: 5, content: "Health" },
  { id: 6, content: "Sports" },
  { id: 7, content: "Science" },
  { id: 8, content: "World" },
  { id: 9, content: "Local" },
  { id: 10, content: "Politics" },
];

const FilterBody: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(
    "For You"
  );

  const handleToggle = (content: string) => {
    setSelectedFilter(selectedFilter === content ? null : content);
  };

  return (
    <div className="filter-body">
      {filters.map((filter) => (
        <FilterButton
          key={filter.id}
          content={filter.content}
          active={selectedFilter === filter.content}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};

export default FilterBody;
