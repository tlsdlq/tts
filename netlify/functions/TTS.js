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
  // [개선] 입력값이 문자열이 아닐 경우를 대비한 방어 코드 추가
  if (typeof line !== 'string') return '';
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
      // [개선] 가독성 및 유지보수성 향상을 위해 매직 넘버를 상수로 정의
      const GALAXY_ROTATION = -35;
      const GALAXY_BASE_RX_SCALE = 0.8;
      const GALAXY_BASE_RY_SCALE = 0.4;
      const GALAXY_CORE_RX_SCALE = 0.6;
      const GALAXY_CORE_RY_SCALE = 0.15;
      const STARDUST_BAND_SCALE = 0.3;
      const STARDUST_COUNT = 1500;
      const SMALL_STAR_COUNT = 150;
      const GLOWING_STAR_COUNT = 15;
      const MIN_METEOR_COUNT = 2;
      const MAX_METEOR_COUNT = 4;

      let starsContent = '';
      const defs = `
        <defs>
          <radialGradient id="deepSpace" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#2a0d45" />
            <stop offset="100%" stop-color="#000" />
          </radialGradient>
          <radialGradient id="galaxyBaseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4b0082" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#4b0082" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="galaxyCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#8ec5ff" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#8ec5ff" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="meteorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(200, 225, 255, 0)" />
            <stop offset="50%" stop-color="rgba(200, 225, 255, 0.8)" />
            <stop offset="100%" stop-color="#fff" />
          </linearGradient>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>
      `;
      starsContent += defs;
      starsContent += `<rect width="${width}" height="${height}" fill="url(#deepSpace)" />`;
      
      const rotationStr = `rotate(${GALAXY_ROTATION} ${width / 2} ${height / 2})`;
      
      starsContent += `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * GALAXY_BASE_RX_SCALE}" ry="${height * GALAXY_BASE_RY_SCALE}" fill="url(#galaxyBaseGlow)" transform="${rotationStr}" />`;
      starsContent += `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * GALAXY_CORE_RX_SCALE}" ry="${height * GALAXY_CORE_RY_SCALE}" fill="url(#galaxyCoreGlow)" transform="${rotationStr}" />`;
      
      let stardustPathData = '';
      const bandWidth = height * STARDUST_BAND_SCALE;
      for (let i = 0; i < STARDUST_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * width * 0.5;
        const y_dist = (Math.random() - 0.5) * bandWidth;
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius + y_dist;
        
        const rotatedX = width / 2 + Math.cos(GALAXY_ROTATION * Math.PI/180) * (x - width/2) - Math.sin(GALAXY_ROTATION * Math.PI/180) * (y - height/2);
        const rotatedY = height / 2 + Math.sin(GALAXY_ROTATION * Math.PI/180) * (x - width/2) + Math.cos(GALAXY_ROTATION * Math.PI/180) * (y - height/2);

        stardustPathData += `M${rotatedX.toFixed(2)},${rotatedY.toFixed(2)}h0`;
      }
      starsContent += `<path d="${stardustPathData}" stroke="#fff" stroke-width="0.6" opacity="0.6" fill="none" />`;
      
      for (let i = 0; i < SMALL_STAR_COUNT; i++) {
        starsContent += `<circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="${Math.random() * 0.8 + 0.1}" fill="#fff" opacity="${Math.random() * 0.5 + 0.2}" />`;
      }
      for (let i = 0; i < GLOWING_STAR_COUNT; i++) {
        const r = Math.random() * 1.2 + 0.8;
        starsContent += `<circle cx="${Math.random() * width}" cy="${height / 2 + (Math.random() - 0.5) * height * 0.8}" r="${r}" fill="#fff" filter="url(#starGlow)" opacity="${Math.random() * 0.5 + 0.5}" />`;
      }
      
      const meteorCount = Math.floor(Math.random() * (MAX_METEOR_COUNT - MIN_METEOR_COUNT + 1)) + MIN_METEOR_COUNT;
      for(let i=0; i < meteorCount; i++) {
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          const length = Math.random() * 120 + 40;
          const angle = (Math.random() - 0.5) * 60 + GALAXY_ROTATION;
          const meteorTransform = `rotate(${angle} ${startX} ${startY})`;
          starsContent += `<line x1="${startX}" y1="${startY}" x2="${startX + length}" y2="${startY}" stroke="url(#meteorGradient)" stroke-width="1.5" transform="${meteorTransform}" />`
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

      // [개선] 선두 문자를 위한 leadingGlow 필터 추가
      const matrixDefs = `<defs><filter id="matrixGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="1.0" result="blur" /></filter><filter id="leadingGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="2.0" result="blur" /></filter></defs>`;
      matrixContent += matrixDefs;
      matrixContent += `<rect width="${width}" height="${height}" fill="#000000" />`;

      for (let i = 0; i < columns; i++) {
        if (Math.random() < 0.1) continue;
        const xJitter = (Math.random() - 0.5) * columnWidth;
        const x = i * columnWidth + xJitter;
        const startY = Math.random() * height * 1.5 - height * 0.5;
        const streamLength = Math.floor(Math.random() * (height / matrixFontSize * 0.8)) + 10;
        
        let streamTspans = '';
        let leadingCharTspan = ''; // [개선] 선두 문자를 별도로 관리

        for (let j = 0; j < streamLength; j++) {
          const charIndex = Math.floor(Math.random() * matrixChars.length);
          const char = matrixChars[charIndex];
          const y = startY + j * matrixFontSize;
          if (y < 0 || y > height) continue;
          
          const isLeading = j === streamLength - 1;
          const color = isLeading ? '#c0ffc0' : '#00e030';
          const opacity = 0.1 + (j / streamLength) * 0.9;
          const posAttr = j === 0 ? `y="${startY}"` : `dy="1.2em"`;

          const tspan = `<tspan x="${x}" ${posAttr} fill="${color}" opacity="${opacity}">${escapeSVG(char)}</tspan>`;
          
          if (isLeading) {
            leadingCharTspan = tspan;
          } else {
            streamTspans += tspan;
          }
        }
        
        // [개선] 일반 문자와 선두 문자를 분리하여 렌더링하고, 선두 문자에 다른 필터 적용
        if (streamTspans) {
          matrixContent += `<text font-family="monospace" font-size="${matrixFontSize}px" filter="url(#matrixGlow)">${streamTspans}</text>`;
        }
        if (leadingCharTspan) {
          matrixContent += `<text font-family="monospace" font-size="${matrixFontSize}px" filter="url(#leadingGlow)">${leadingCharTspan}</text>`;
        }
      }
      return matrixContent;
      
    case 'default':
    default:
      let defaultContent = '';
      const defaultDefs = `<defs><linearGradient id="defaultSky" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#0d1b2a" /><stop offset="100%" stop-color="#1b263b" /></linearGradient></defs>`;
      defaultContent += defaultDefs;
      defaultContent += `<rect width="${width}" height="${height}" fill="url(#defaultSky)" />`;
      const defaultStarCount = 200;
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
  width: 800,
  paddingX: 40,
  paddingY: 60,
  lineHeight: 1.6,
};

// --- 주 함수 핸들러 ---
exports.handler = async function(event) {
  try {
    const defaultParams = {
      text: '대역폭이 최적화된 {은하수} 배경입니다.',
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
      <svg width="${constants.width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeSVG(rawText)}">
        <style>
          text { white-space: pre; }
        </style>
        ${backgroundContent}
        <text
          x="${x}"
          y="${startY}"
          font-family="sans-serif"
          font-size="${fontSize}px"
          fill="${textColor}"
          text-anchor="${textAnchor}"
          ${mainTextStyle}
        >
          ${textElements}
        </text>
      </svg>
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
      body: svg.trim(),
    };
  } catch (err) {
    console.error("SVG Generation Error:", err);
    const errorSvg = `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8d7da" /><text x="10" y="50%" font-family="monospace" font-size="16" fill="#721c24" dominant-baseline="middle">Error: ${escapeSVG(err.message)}</text></svg>`;
    return { statusCode: 500, headers: { 'Content-Type': 'image/svg+xml' }, body: errorSvg.trim() };
  }
};
