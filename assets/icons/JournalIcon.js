import React from 'react';
import { SvgXml } from 'react-native-svg';

const JournalIcon = ({ color = "#034694", strokeWidth = 1, size = 24 }) => {
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="diary" width="${size}" height="${size}">
      <path fill="#034694" d="M17,2H5A1,1,0,0,0,4,3V19a1,1,0,0,0,1,1H6v1a1,1,0,0,0,1,1H7a1,1,0,0,0,1-1V20h9a3,3,0,0,0,3-3V5A3,3,0,0,0,17,2ZM14,18H6V4h8Zm4-1a1,1,0,0,1-1,1H16V4h1a1,1,0,0,1,1,1Z"></path>
    </svg>
  `;

  return <SvgXml xml={svgMarkup} width={size} height={size} />;
};

export default JournalIcon;
