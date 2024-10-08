// HomeIcon.js
import React from 'react';
import { SvgXml } from 'react-native-svg';

const HomeIcon = ({ size = 24, strokeColor = "#034694", strokeWidth = 2 }) => {  // Default values for stroke
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="estate">
      <path 
        fill="#034694" 
        stroke="${strokeColor}" 
        stroke-width="${strokeWidth}" 
        d="M20,8h0L14,2.74a3,3,0,0,0-4,0L4,8a3,3,0,0,0-1,2.26V19a3,3,0,0,0,3,3H18a3,3,0,0,0,3-3V10.25A3,3,0,0,0,20,8ZM14,20H10V15a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1Zm5-1a1,1,0,0,1-1,1H16V15a3,3,0,0,0-3-3H11a3,3,0,0,0-3,3v5H6a1,1,0,0,1-1-1V10.25a1,1,0,0,1,.34-.75l6-5.25a1,1,0,0,1,1.32,0l6,5.25a1,1,0,0,1,.34.75Z">
      </path>
    </svg>
  `;

  return <SvgXml xml={svgMarkup} width={size} height={size} />;
};

export default HomeIcon;
