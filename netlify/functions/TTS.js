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
    return isBold ? `<tspan font-weight="700">${escapedPart}</tspan>` : escapedPart;
  }).join('');
}

// --- SVG 배경 생성 함수 (kuro 스타일 재설계) ---

function generateBackgroundSVG(bgType, width, height) {
  const seed = Math.floor(Math.random() * 1000);
  
  switch (bgType) {
    case 'kuro':
      const kuroDefs = `
        <defs>
          <!-- 네온 글로우 효과를 위한 필터 -->
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <!-- 강한 글로우 효과 -->
          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="bigBlur"/>
            <feGaussianBlur stdDeviation="2" result="smallBlur"/>
            <feMerge> 
              <feMergeNode in="bigBlur"/>
              <feMergeNode in="smallBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      `;
      
      let kuroContent = `<rect width="${width}" height="${height}" fill="#000008" />`;
      kuroContent += kuroDefs;

      // --- 원본 스타일의 정교한 미로 패턴 ---
      const scale = Math.min(width, height) / 800;
      const unit = 25 * scale; // 기본 단위
      
      let pathData = '';
      
      // 복잡하고 연결된 미로 구조를 한 번에 그리기
      const maze = [
        // 왼쪽 세로 메인 라인
        `M${unit*2} ${unit*2} L${unit*2} ${height-unit*2}`,
        
        // 상단 복잡한 구조
        `M${unit*2} ${unit*3} L${unit*8} ${unit*3} L${unit*8} ${unit*6} L${unit*14} ${unit*6} L${unit*14} ${unit*2} L${unit*20} ${unit*2}`,
        `M${unit*20} ${unit*2} L${unit*20} ${unit*8} L${unit*26} ${unit*8} L${unit*26} ${unit*4} L${unit*30} ${unit*4}`,
        
        // 중앙 복합 구조
        `M${unit*8} ${unit*6} L${unit*8} ${unit*12} L${unit*6} ${unit*12} L${unit*6} ${unit*16} L${unit*12} ${unit*16}`,
        `M${unit*12} ${unit*16} L${unit*12} ${unit*10} L${unit*18} ${unit*10} L${unit*18} ${unit*14} L${unit*24} ${unit*14}`,
        `M${unit*14} ${unit*6} L${unit*14} ${unit*12} L${unit*20} ${unit*12}`,
        
        // 오른쪽 구조
        `M${unit*20} ${unit*8} L${unit*16} ${unit*8} L${unit*16} ${unit*18} L${unit*22} ${unit*18}`,
        `M${unit*24} ${unit*14} L${unit*24} ${unit*20} L${unit*18} ${unit*20} L${unit*18} ${unit*22} L${unit*28} ${unit*22}`,
        `M${unit*26} ${unit*8} L${unit*26} ${unit*16} L${unit*30} ${unit*16}`,
        
        // 하단 연결부
        `M${unit*2} ${unit*18} L${unit*10} ${unit*18} L${unit*10} ${unit*22}`,
        `M${unit*22} ${unit*18} L${unit*22} ${unit*12}`,
        
        // 추가 세부 구조들
        `M${unit*30} ${unit*4} L${unit*30} ${unit*10} L${unit*28} ${unit*10} L${unit*28} ${unit*12}`,
        `M${unit*28} ${unit*12} L${unit*28} ${unit*22}`,
        
        // 내부 작은 구조들
        `M${unit*4} ${unit*8} L${unit*4} ${unit*14} L${unit*2} ${unit*14}`,
        `M${unit*6} ${unit*4} L${unit*6} ${unit*8}`,
        `M${unit*10} ${unit*10} L${unit*10} ${unit*14}`,
        `M${unit*20} ${unit*16} L${unit*20} ${unit*20}`,
        
        // 연결 세그먼트들
        `M${unit*12} ${unit*10} L${unit*10} ${unit*10}`,
        `M${unit*16} ${unit*14} L${unit*16} ${unit*16}`,
        `M${unit*24} ${unit*12} L${unit*26} ${unit*12}`,
        `M${unit*22} ${unit*16} L${unit*24} ${unit*16}`,
      ];
      
      pathData = maze.join(' ');
      
      // 메인 미로 패턴 (굵은 선)
      const strokeWidth = Math.max(4, 8 * scale);
      kuroContent += `<path d="${pathData}" fill="none" stroke="#cc77ff" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#strongGlow)" />`;
      
      // 밝은 코어 라인
      const coreWidth = Math.max(1, 2 * scale);
      kuroContent += `<path d="${pathData}" fill="none" stroke="#ffffff" stroke-width="${coreWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonGlow)" opacity="0.9" />`;
      
      return kuroContent;

    case 'stars':
      const galaxyDefs = `
        <defs>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          </filter>
          <filter id="nebulaCloud" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="4" seed="${seed}" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="15" result="softTurbulence" />
            <feColorMatrix in="softTurbulence" type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 2 -0.3" result="alphaChannel" />
          </filter>
          <linearGradient id="galaxyGradient" gradientTransform="rotate(${Math.random() * 360})">
            <stop offset="20%" stop-color="#2d0e4d" />
            <stop offset="45%" stop-color="#c1a2ff" />
            <stop offset="50%" stop-color="#f0e8ff" />
            <stop offset="55%" stop-color="#c1a2ff" />
            <stop offset="80%" stop-color="#2d0e4d" />
          </linearGradient>
          <mask id="galaxyMask">
            <rect x="0" y="0" width="${width}" height="${height}" fill="white" />
            <rect x="0" y="0" width="${width}" height="${height}" fill="black" filter="url(#nebulaCloud)" />
          </mask>
          <linearGradient id="meteorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(200, 225, 255, 0)" />
            <stop offset="50%" stop-color="rgba(200, 225, 255, 0.8)" />
            <stop offset="100%" stop-color="#fff" />
          </linearGradient>
        </defs>
      `;

      let starsContent = galaxyDefs;
      starsContent += `<rect width="${width}" height="${height}" fill="#01010a" />`;
      starsContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="url(#galaxyGradient)" mask="url(#galaxyMask)" opacity="0.6" />`;
      
      const galaxyBand = {
          slope: (Math.random() - 0.5) * 0.8,
          intercept: height / 2 + (Math.random() - 0.5) * (height * 0.4),
          width: height * (Math.random() * 0.2 + 0.3)
      };

      const isInGalaxyBand = (x, y) => {
          const lineY = galaxyBand.slope * x + galaxyBand.intercept;
          return Math.abs(y - lineY) < galaxyBand.width / 2;
      };

      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        if (isInGalaxyBand(x, y)) {
           starsContent += `<circle cx="${x}" cy="${y}" r="${Math.random() * 0.5 + 0.1}" fill="#fff" opacity="${Math.random() * 0.7 + 0.2}" />`;
        }
      }

      for (let i = 0; i < 150; i++) {
        starsContent += `<circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="${Math.random() * 0.6 + 0.2}" fill="#e0e8ff" opacity="${Math.random() * 0.6 + 0.2}" />`;
      }

      for (let i = 0; i < 20; i++) {
        const r = Math.random() * 1.0 + 0.4;
        starsContent += `<circle cx="${Math.random() * width}" cy="${Math.random() * height}" r="${r}" fill="#f0f8ff" filter="url(#starGlow)" opacity="${Math.random() * 0.4 + 0.6}" />`;
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

      const matrixDefs = `<defs><filter id="matrixGlow"><feGaussianBlur in="SourceGraphic" stdDeviation="1.0" result="blur" /></filter></defs>`;
      matrixContent += matrixDefs;
      matrixContent += `<rect width="${width}" height="${height}" fill="#000000" />`;

      for (let i = 0; i < columns; i++) {
        if (Math.random() < 0.1) continue;
        const xJitter = (Math.random() - 0.5) * columnWidth;
        const x = i * columnWidth + xJitter;
        const startY = Math.random() * height * 1.5 - height * 0.5;
        const streamLength = Math.floor(Math.random() * (height / matrixFontSize * 0.8)) + 10;
        
        const streamTspans = [];

        for (let j = 0; j < streamLength; j++) {
          const charIndex = Math.floor(Math.random() * matrixChars.length);
          const char = matrixChars[charIndex];
          const y = startY + j * matrixFontSize;
          if (y < 0 || y > height) continue;
          
          const color = '#00e030'; 
          const opacity = 0.1 + (j / streamLength) * 0.9;
          const posAttr = j === 0 ? `y="${startY}"` : `dy="1.2em"`;

          const tspan = `<tspan x="${x}" ${posAttr} fill="${color}" opacity="${opacity}">${escapeSVG(char)}</tspan>`;
          
          streamTspans.push(tspan);
        }
        
        if (streamTspans.length > 0) {
          matrixContent += `<text font-family="monospace" font-size="${matrixFontSize}px" filter="url(#matrixGlow)">${streamTspans.join('')}</text>`;
        }
      }
      return matrixContent;

    case 'default':
    default:
      return `<rect width="${width}" height="${height}" fill="#000000" />`;
  }
}

// --- 상수 (기존 값 800px 유지) ---
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
      bg: 'default',
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

    // --- 수정된 부분: 각 줄을 개별 text 엘리먼트로 생성 ---
    const mainTextStyle = `paint-order="stroke" stroke="#000000" stroke-width="2px" stroke-linejoin="round"`;

    const textElements = lines.map((line, index) => {
      const innerContent = parseBoldText(line);
      const yPos = startY + (index * constants.lineHeight * fontSize);
      
      return `<text x="${x}" y="${yPos}" font-family="sans-serif" font-size="${fontSize}px" fill="${textColor}" text-anchor="${textAnchor}" ${mainTextStyle}>${innerContent}</text>`;
    }).join('');

    const svg = `
      <svg width="${constants.width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeSVG(rawText)}">
        <style>
          text { white-space: pre; }
        </style>
        ${backgroundContent}
        ${textElements}
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
