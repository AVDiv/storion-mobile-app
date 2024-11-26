import React from "react";
import "./Background.css";

const ArticleBackground: React.FC<{ scrollY?: number }> = ({ scrollY = 0 }) => {
  return (
    <div className="article-background">
      <div
        className="background-grid"
        style={{
          backgroundPosition: `0 ${scrollY * -0.1}px`,
        }}
      />
    </div>
  );
};

export default ArticleBackground;
