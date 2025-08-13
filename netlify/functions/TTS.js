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
          <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F8F0C4" stop-opacity="0.3" />
            <stop offset="60%" stop-color="#A18CD1" stop-opacity="0.1" />
            <stop offset="100%" stop-color="#3f2b4b" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="dustLane" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.6" />
            <stop offset="80%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
      `;
      starsContent += defs;
      starsContent += `<rect width="${width}" height="${height}" fill="#020111" />`;

      // 은하수 띠와 성간 먼지 그리기
      starsContent += `<ellipse cx="${width / 2}" cy="${height / 2}" rx="${width / 1.5}" ry="${height / 8}" fill="url(#galaxyCore)" />`;
      starsContent += `<ellipse cx="${width / 2 + 50}" cy="${height / 2 - 10}" rx="${width / 3}" ry="${height / 12}" fill="url(#dustLane)" />`;

      // 별 생성
      const totalStarIterations = 800;
      const bandStartY = height * 0.35;
      const bandEndY = height * 0.65;

      for (let i = 0; i < totalStarIterations; i++) {
        const y = Math.random() * height;
        const isInBand = y > bandStartY && y < bandEndY;
        
        // 은하수 띠 안쪽에 별 생성 확률 높임
        if (isInBand && Math.random() < 0.7 || !isInBand && Math.random() < 0.1) {
          const x = Math.random() * width;
          const isBright = isInBand && Math.random() < 0.2;
          const r = isBright ? Math.random() * 1.5 + 0.8 : Math.random() * 0.7 + 0.1;
          const opacity = Math.random() * 0.8 + 0.2;
          const color = isBright ? '#ffffff' : '#e0e0ff';
          starsContent += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}" ${isBright ? 'filter="url(#starGlow)"' : ''} />`;
        }
      }
      return starsContent;

    case 'matrix':
      const matrixChars = 'qwertyuiopasdfghjklzxcvbnmABCDEFGHIJKLMNOPQRSTUVWXYZΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ=/<>+*&%$#@!';
      const binaryChars = '01';
      const matrixFontSize = 18;
      const columnWidth = matrixFontSize * 0.9;
      const columns = Math.floor(width / columnWidth);
      let matrixContent = '';

      const matrixDefs = `<defs><filter id="matrixGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" /></filter><filter id="leadingGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" /></filter></defs>`;
      matrixContent += matrixDefs;
      matrixContent += `<rect width="${width}" height="${height}" fill="#000000" />`;

      for (let i = 0; i < columns; i++) {
        if (Math.random() < 0.1) continue;
        const isBinaryStream = Math.random() < 0.15;
        const charSet = isBinaryStream ? binaryChars : matrixChars;
        const xJitter = (Math.random() - 0.5) * columnWidth;
        const x = i * columnWidth + xJitter;
        const startY = Math.random() * height * 1.5 - height * 0.5;
        const streamLength = Math.floor(Math.random() * (height / matrixFontSize * 0.8)) + 10;
        
        for (let j = 0; j < streamLength; j++) {
          const charIndex = Math.floor(Math.random() * charSet.length);
          const char = charSet[charIndex];
          const y = startY + j * matrixFontSize;
          if (y < 0 || y > height) continue;
          const isLeading = j === streamLength - 1;
          const color = isLeading ? '#ffffff' : '#00ff41';
          const opacity = isBinaryStream ? 0.3 + (j / streamLength) * 0.7 : 0.1 + (j / streamLength) * 0.9;
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
      text: '실감 나게 개선된 {은하수} 배경입니다.|성간 먼지와 별의 밀도를 조절했습니다.',
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
