import React from "react";
import "./Background.css";

const ArticleBackground: React.FC<{ scrollY?: number }> = ({ scrollY = 0 }) => {
  return <div className="page-background"></div>;
};

export default ArticleBackground;
