import React from "react";
import FeedCard from "../../cards/FeedCard";

import "./FeedBody.css";

const FeedBody: React.FC = () => {
  return (
    <div className="feed-body">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((index) => (
        <FeedCard
          key={index}
          imageUrl="/image-placeholder.webp"
          title="Sample news title with a text, which makes no sense at all and it will be truncated anyways"
          publishedAt="4h ago"
          noOfSources={50}
          content="Content"
          topic="Topic"
          region="Region"
        />
      ))}
    </div>
  );
};

export default FeedBody;
