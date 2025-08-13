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
  if (typeof line !== 'string') return '';
  const parts = line.split(/\{([^}]+)\}/g).filter(part => part);
  return parts.map((part, index) => {
    const isBold = index % 2 === 1;
    const escapedPart = escapeSVG(part);
    return isBold ? `<tspan font-weight="700">${escapedPart}</tspan>` : `<tspan>${escapedPart}</tspan>`;
  }).join('');
}

// --- SVG 배경 생성 함수 ---

function generateBackgroundSVG(bgType, width, height) {
  switch (bgType) {
    case 'stars':
      // [핵심 개선] 완전히 새로운 '성운(Nebula)' 테마 배경
      const starDefs = `
        <defs>
          <filter id="nebula">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.03" numOctaves="3" seed="${Math.floor(Math.random() * 100)}" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.7  0 0 0 0 0.85  0 0 0 0 1  0 0 0 1 0" />
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fff" stop-opacity="1" />
            <stop offset="40%" stop-color="#aabfff" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#4b0082" stop-opacity="0" />
          </radialGradient>
           <linearGradient id="meteorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(200, 225, 255, 0)" />
            <stop offset="50%" stop-color="rgba(200, 225, 255, 0.8)" />
            <stop offset="100%" stop-color="#fff" />
          </linearGradient>
        </defs>
      `;
      
      let starsContent = starDefs;
      starsContent += `<rect width="${width}" height="${height}" fill="#000004" />`;
      starsContent += `<rect width="${width}" height="${height}" fill="#4a2a6b" filter="url(#nebula)" opacity="0.4" />`;
      
      const galaxyCenterX = width / 2 + (Math.random() - 0.5) * 100;
      const galaxyCenterY = height / 2 + (Math.random() - 0.5) * 80;
      const galaxySize = Math.min(width, height) * (Math.random() * 0.4 + 0.8);
      
      starsContent += `<circle cx="${galaxyCenterX}" cy="${galaxyCenterY}" r="${galaxySize}" fill="url(#galaxyCore)" opacity="0.5" />`;

      // [개선] 더욱 다채로운 별 생성 로직
      // 1. 아주 작은 배경 별들
      for (let i = 0; i < 500; i++) {
        starsContent += `<circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="${Math.random() * 0.4 + 0.1}" fill="#fff" opacity="${Math.random() * 0.3 + 0.1}" />`;
      }
      // 2. 중간 크기의 밝은 별들
      for (let i = 0; i < 100; i++) {
        starsContent += `<circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="${Math.random() * 0.8 + 0.2}" fill="#fff" opacity="${Math.random() * 0.5 + 0.3}" />`;
      }
      // 3. 크고 빛나는 별들
      for (let i = 0; i < 15; i++) {
        starsContent += `<circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="${Math.random() * 1.2 + 0.5}" fill="#e0e8ff" filter="url(#starGlow)" opacity="${Math.random() * 0.5 + 0.5}" />`;
      }

      const meteorCount = Math.floor(Math.random() * 3) + 1;
      for(let i=0; i < meteorCount; i++) {
          const startX = Math.random() * width;
          const startY = Math.random() * height;
          const length = Math.random() * 100 + 50;
          const angle = (Math.random() - 0.5) * 80;
          const meteorTransform = `rotate(${angle} ${startX} ${startY})`;
          starsContent += `<line x1="${startX}" y1="${startY}" x2="${startX + length}" y2="${startY}" stroke="url(#meteorGradient)" stroke-width="1.2" transform="${meteorTransform}" />`
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

      const matrixDefs = `<defs><filter id="matrixGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="1.0" result="blur" /></filter><filter id="leadingGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="2.0" result="blur" /></filter></defs>`;
      matrixContent += matrixDefs;
      matrixContent += `<rect width="${width}" height="${height}" fill="#000000" />`;

      for (let i = 0; i < columns; i++) {
        if (Math.random() < 0.1) continue;
        const xJitter = (Math.random() - 0.5) * columnWidth;
        const x = i * columnWidth + xJitter;
        const startY = Math.random() * height * 1.5 - height * 0.5;
        const streamLength = Math.floor(Math.random() * (height / matrixFontSize * 0.8)) + 10;
        
        const streamTspans = [];
        let leadingCharTspan = '';

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
            streamTspans.push(tspan);
          }
        }
        
        if (streamTspans.length > 0) {
          matrixContent += `<text font-family="monospace" font-size="${matrixFontSize}px" filter="url(#matrixGlow)">${streamTspans.join('')}</text>`;
        }
        if (leadingCharTspan) {
          matrixContent += `<text font-family="monospace" font-size="${matrixFontSize}px" filter="url(#leadingGlow)">${leadingCharTspan}</text>`;
        }
      }
      return matrixContent;
      
    // --- [수정된 부분] ---
    case 'default':
    default:
      // 단순 검은색 배경으로 변경
      return `<rect width="${width}" height="${height}" fill="#000000" />`;
    // --- [수정 끝] ---
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
      text: 'Dynamic {SVG} on Netlify|Special Chars: < & >',
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
    const lines = rawText.split('|');
    
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
      headers: { 
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      },
      body: svg.trim(),
    };
  } catch (err) {
    console.error("SVG Generation Error:", err);
    const errorSvg = `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8d7da" /><text x="10" y="50%" font-family="monospace" font-size="16" fill="#721c24" dominant-baseline="middle">Error: ${escapeSVG(err.message)}</text></svg>`;
    return { 
      statusCode: 500,
      headers: { 'Content-Type': 'image/svg+xml' },
      body: errorSvg.trim()
    };
  }
};
