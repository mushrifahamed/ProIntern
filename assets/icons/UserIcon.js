// UserIcon.js
import React from 'react';
import { SvgXml } from 'react-native-svg';

const UserIcon = ({ size = 24, strokeColor = "#034694", strokeWidth = 2 }) => {  // Default values for stroke
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="user">
      <path 
        fill="#034694" 
        stroke="${strokeColor}" 
        stroke-width="${strokeWidth}" 
        d="M15.71,12.71a6,6,0,1,0-7.42,0,10,10,0,0,0-6.22,8.18,1,1,0,0,0,2,.22,8,8,0,0,1,15.9,0,1,1,0,0,0,1,.89h.11a1,1,0,0,0,.88-1.1A10,10,0,0,0,15.71,12.71ZM12,12a4,4,0,1,1,4-4A4,4,0,0,1,12,12Z">
      </path>
    </svg>
  `;

  return <SvgXml xml={svgMarkup} width={size} height={size} />;
};

export default UserIcon;
