import React, { useEffect, useState } from "react";

import "./GradientBackground.css";

const GradientBackground: React.FC<{ scrollY: number }> = ({ scrollY }) => {
  return (
    <div
      className="scrolling-background"
      style={{
        backgroundPosition: `0 ${scrollY * -0.4}px`,
      }}
    >
      <div
        className="background-pattern"
        style={{
          backgroundPosition: `0 ${scrollY * -0.9}px`,
        }}
      ></div>
    </div>
  );
};

export default GradientBackground;
