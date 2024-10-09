import React from 'react';
import { SvgXml } from 'react-native-svg';

const ApplicationsIcon = ({ color = "#034694", strokeWidth = 1, size = 24 }) => {
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" id="folder-open" width="${size}" height="${size}">
      <path fill="#034694" d="M22.78 10.37A1 1 0 0 0 22 10h-2V9a3 3 0 0 0-3-3h-6.28l-.32-1a3 3 0 0 0-2.84-2H4a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14.4a3 3 0 0 0 2.92-2.35L23 11.22a1 1 0 0 0-.22-.85ZM5.37 18.22a1 1 0 0 1-1 .78H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3.56a1 1 0 0 1 1 .68l.54 1.64A1 1 0 0 0 10 8h7a1 1 0 0 1 1 1v1H8a1 1 0 0 0-1 .78Zm14 0a1 1 0 0 1-1 .78H7.21a1.42 1.42 0 0 0 .11-.35L8.8 12h12Z"></path>
    </svg>
  `;

  return <SvgXml xml={svgMarkup} width={size} height={size} />;
};

export default ApplicationsIcon;
