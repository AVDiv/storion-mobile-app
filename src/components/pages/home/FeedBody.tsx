import React, { useEffect, useRef, useState } from "react";
import FeedCard from "../../cards/FeedCard";

import "./FeedBody.css";

const FeedBody: React.FC = () => {
  const [activeCardIndex, setActiveCardIndex] = useState(1);
  const feedRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (feedRef.current) {
      const scrollPos = feedRef.current.scrollTop;
      const cardHeight = 450; // Approximate height of a card including margin
      const newIndex = Math.round(scrollPos / cardHeight) + 1;
      setActiveCardIndex(newIndex);
    }
  };

  useEffect(() => {
    const feedElement = feedRef.current;
    if (feedElement) {
      feedElement.addEventListener("scroll", handleScroll);
      return () => feedElement.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="feed-body" ref={feedRef}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
        <div
          key={index}
          className={`feed-card-container ${
            index === activeCardIndex ? "active" : ""
          }`}
        >
          <FeedCard
            imageUrl="/image-placeholder.webp"
            title="Sample news title with a text, which makes no sense at all and it will be truncated anyways"
            publishedAt="4h ago"
            noOfSources={50}
            content="Content"
            topic="Topic"
            region="Region"
          />
        </div>
      ))}
    </div>
  );
};

export default FeedBody;
