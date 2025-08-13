// --- 유틸리티 함수 ---

function escapeSVG(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
}

function parseBoldText(line) {
  const parts = line.split(/\{([^}]+)\}/g).filter(part => part);
  return parts.map((part, index) => {
    const isBold = index % 2 === 1;
    return isBold ? `<tspan font-weight="700">${part}</tspan>` : `<tspan>${part}</tspan>`;
  }).join('');
}

// --- SVG 배경 생성 함수 ---

function generateBackgroundSVG(bgType, width, height) {
  switch (bgType) {
    case 'stars':
      let starsContent = '';
      const defs = `
        <defs>
          <radialGradient id="cloud1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#D2B48C" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#D2B48C" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="cloud2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F0E68C" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#F0E68C" stop-opacity="0" />
          </radialGradient>
          <filter id="brightStarGlow">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
      `;
      starsContent += defs;
      starsContent += `<rect width="${width}" height="${height}" fill="#000000" />`;

      // [개선] 유기적인 은하수 성운 그리기
      for (let i = 0; i < 15; i++) {
        const cx = width * 0.2 + Math.random() * width * 0.6;
        const cy = height * 0.3 + Math.random() * height * 0.4;
        const rx = width * 0.1 + Math.random() * width * 0.2;
        const ry = height * 0.05 + Math.random() * height * 0.1;
        const opacity = Math.random() * 0.5 + 0.2;
        const rotation = Math.random() * 180;
        const fill = Math.random() > 0.5 ? 'url(#cloud1)' : 'url(#cloud2)';
        starsContent += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}" transform="rotate(${rotation} ${cx} ${cy})" />`;
      }
      
      // [개선] 별 다층 구조 생성
      // 1. 은하 먼지 (Galactic Dust)
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = height * 0.2 + Math.random() * height * 0.6;
        const r = Math.random() * 0.4;
        const opacity = Math.random() * 0.5 + 0.1;
        starsContent += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${opacity}" />`;
      }
      // 2. 일반 별 (Field Stars)
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 0.8 + 0.2;
        const opacity = Math.random() * 0.7 + 0.3;
        starsContent += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f0f8ff" opacity="${opacity}" />`;
      }
      // 3. 주요 별 (Prominent Stars)
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 1.5 + 0.8;
        const colorRoll = Math.random();
        let color = '#ffffff';
        if (colorRoll > 0.9) color = '#ffccaa'; // 노란색
        else if (colorRoll > 0.8) color = '#aaccff'; // 푸른색
        starsContent += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" filter="url(#brightStarGlow)" />`;
      }
      // 4. 유성 (Shooting Stars)
      for (let i = 0; i < (Math.random() > 0.5 ? 1 : 2); i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const length = Math.random() * 300 + 100;
        const angle = Math.random() * 360;
        const x2 = x1 + length * Math.cos(angle * Math.PI / 180);
        const y2 = y1 + length * Math.sin(angle * Math.PI / 180);
        starsContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="1" stroke-opacity="0.4" />`;
      }

      return starsContent;

    case 'matrix':
      const english = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const japanese = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ';
      const hangul = '가나다라마바사아자차카타파하';
      const symbols = '-=/<>+*&%$#@!';
      const matrixChars = english.repeat(5) + numbers.repeat(2) + hangul + japanese + symbols;
      const matrixFontSize = 18;
      const columnWidth = matrixFontSize * 0.9;
      const columns = Math.floor(width / columnWidth);
      let matrixContent = '';

      const matrixDefs = `<defs><filter id="matrixGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" /></filter><filter id="leadingGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" /></filter></defs>`;
      matrixContent += matrixDefs;
      matrixContent += `<rect width="${width}" height="${height}" fill="#000000" />`;

      for (let i = 0; i < columns; i++) {
        if (Math.random() < 0.1) continue;
        const xJitter = (Math.random() - 0.5) * columnWidth;
        const x = i * columnWidth + xJitter;
        const startY = Math.random() * height * 1.5 - height * 0.5;
        const streamLength = Math.floor(Math.random() * (height / matrixFontSize * 0.8)) + 10;
        for (let j = 0; j < streamLength; j++) {
          const charIndex = Math.floor(Math.random() * matrixChars.length);
          const char = matrixChars[charIndex];
          const y = startY + j * matrixFontSize;
          if (y < 0 || y > height) continue;
          const isLeading = j === streamLength - 1;
          const color = isLeading ? '#c0ffc0' : '#00e030';
          const opacity = 0.1 + (j / streamLength) * 0.9;
          const filter = isLeading ? 'url(#leadingGlow)' : 'url(#matrixGlow)';
          matrixContent += `<text x="${x}" y="${y}" font-family="monospace" font-size="${matrixFontSize}px" fill="${color}" opacity="${opacity}" filter="${filter}">${escapeSVG(char)}</text>`;
        }
      }
      return matrixContent;
      
    case 'default':
    default:
      let defaultContent = '';
      const defaultDefs = `<defs><linearGradient id="defaultSky" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#0d1b2a" /><stop offset="100%" stop-color="#1b263b" /></linearGradient></defs>`;
      defaultContent += defaultDefs;
      defaultContent += `<rect width="${width}" height="${height}" fill="url(#defaultSky)" />`;
      const defaultStarCount = 300;
      for (let i = 0; i < defaultStarCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 0.9 + 0.1;
        const opacity = Math.random() * 0.7 + 0.2;
        defaultContent += `<circle cx="${x}" cy="${y}" r="${r}" fill="#f0f8ff" opacity="${opacity}" />`;
      }
      return defaultContent;
  }
}

// --- 상수 ---
const constants = {
  width: 1200,
  paddingX: 40,
  paddingY: 60,
  lineHeight: 1.6,
};

// --- 주 함수 핸들러 ---
exports.handler = async function(event) {
  try {
    const defaultParams = {
      text: '더욱 사실적으로 개선된 {은하수} 배경입니다.|유성우가 떨어질 수도 있습니다.',
      textColor: '#ffffff',
      fontSize: 16,
      align: 'left',
      bg: 'stars',
    };
    const queryParams = event.queryStringParameters || {};
    const params = { ...defaultParams, ...queryParams };
    
    const fontSize = Math.max(10, Math.min(parseInt(params.fontSize, 10) || defaultParams.fontSize, 120));
    const textColor = escapeSVG(params.textColor);

    let textAnchor, x;
    switch (params.align) {
      case 'center': textAnchor = 'middle'; x = constants.width / 2; break;
      case 'right': textAnchor = 'end'; x = constants.width - constants.paddingX; break;
      default: textAnchor = 'start'; x = constants.paddingX; break;
    }

    const rawText = params.text;
    const lines = escapeSVG(rawText).split('|');
    const totalTextBlockHeight = (lines.length - 1) * (constants.lineHeight * fontSize) + fontSize;
    const height = Math.round(totalTextBlockHeight + (constants.paddingY * 2));
    
    const backgroundContent = generateBackgroundSVG(params.bg, constants.width, height);
    
    const startY = Math.round((height / 2) - (totalTextBlockHeight / 2) + (fontSize * 0.8));

    const textElements = lines.map((line, index) => {
      const innerContent = parseBoldText(line);
      const dy = index === 0 ? '0' : `${constants.lineHeight}em`;
      return `<tspan x="${x}" dy="${dy}">${innerContent}</tspan>`;
    }).join('');

    const mainTextStyle = `paint-order="stroke" stroke="#000000" stroke-width="2px" stroke-linejoin="round"`;

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeSVG(rawText)}">
        <style>
          text { white-space: pre; }
        </style>
        ${backgroundContent}
        <text
          y="${startY}"
          font-family="sans-serif"
          font-size="${fontSize}px"
          fill="${textColor}"
          text-anchor="${textAnchor}"
          ${mainTextStyle}
