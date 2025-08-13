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
  const seed = Math.floor(Math.random() * 1000);
  
  switch (bgType) {
    // --- [신규 추가] '글리치' 테마. 오직 두 번째 레퍼런스 이미지만을 기반으로 제작 ---
    case 'glitch':
      const glitchDefs = `
        <defs>
            <filter id="glitchFrame" x="0" y="0" width="100%" height="100%">
                <feTurbulence baseFrequency="0.01 0.4" numOctaves="1" seed="${seed}" type="fractalNoise" result="noise" />
                <feColorMatrix in="noise" type="matrix" result="monoNoise"
                    values="0 0 0 0 0.29
                            0 0 0 0 0
                            0 0 0 0 0.51
                            0 0 0 50 -1" />
                <feComponentTransfer in="monoNoise" result="transfer">
                  <feFuncA type="gamma" amplitude="2" exponent="2" />
                </feComponentTransfer>
                <feMerge>
                    <feMergeNode in="transfer" />
                </feMerge>
            </filter>
        </defs>
      `;
      let glitchContent = glitchDefs;
      // 1. 연한 라벤더 배경
      glitchContent += `<rect width="${width}" height="${height}" fill="#dcd0e8" />`;
      // 2. 글리치 프레임 효과
      glitchContent += `<rect width="${width}" height="${height}" fill="#4b0082" filter="url(#glitchFrame)" />`;
      
      return glitchContent;
      
    case 'kuro':
      const kuroDefs = `
        <defs>
          <filter id="kuroDistort">
            <feTurbulence baseFrequency="0.05 0.5" numOctaves="4" type="fractalNoise" seed="${seed}" result="T" />
            <feDisplacementMap in="SourceGraphic" in2="T" scale="2.5" />
          </filter>
           <filter id="kuroGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          </filter>
        </defs>
      `;
      
      let kuroContent = kuroDefs;
      kuroContent += `<rect width="${width}" height="${height}" fill="#000000" />`;

      const paths = [];
      const branchProb = 0.8;
      const maxDepth = 15;

      function createBranch(x, y, dir, depth) {
          if (depth > maxDepth || Math.random() > branchProb) return;

          const length = (Math.random() * 0.4 + 0.6) * 60;
          let nx = x;
          let ny = y;

          if (dir === 0) ny -= length;
          else if (dir === 1) nx += length;
          else if (dir === 2) ny += length;
          else if (dir === 3) nx -= length;

          if (nx < 0 || nx > width || ny < 0 || ny > height) return;
          
          paths.push(`M${x} ${y} L${nx} ${ny}`);

          createBranch(nx, ny, (dir + 1) % 4, depth + 1);
          createBranch(nx, ny, (dir + 3) % 4, depth + 1);
      }
      
      const numStarters = 25;
      for (let i = 0; i < numStarters; i++) {
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const startDir = Math.floor(Math.random() * 4);
        createBranch(startX, startY, startDir, 0);
      }
      
      const pathData = paths.join(' ');
      
      kuroContent += `<g opacity="0.8">`;
      kuroContent += `<path d="${pathData}" stroke="#7029cb" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#kuroGlow)" />`;
      kuroContent += `<path d="${pathData}" stroke="#a460f9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />`;
      kuroContent += `<path d="${pathData}" stroke="#f0e6ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#kuroDistort)" />`;
      kuroContent += `</g>`;

      return kuroContent;

    case 'stars':
      // ... (이전과 동일)
      return '';

    case 'matrix':
      // ... (이전과 동일)
      return '';
      
    case 'default':
    default:
      return `<rect width="${width}" height="${height}" fill="#000000" />`;
  }
}

// --- 상수 ---
const constants = { width: 800, paddingX: 40, paddingY: 60, lineHeight: 1.6 };

// --- 주 함수 핸들러 ---
exports.handler = async function(event) {
  try {
    const defaultParams = { text: 'Dynamic {SVG} on Netlify|Special Chars: < & >', textColor: '#ffffff', fontSize: 16, align: 'left', bg: 'default' };
    const queryParams = event.queryStringParameters || {};
    const params = { ...defaultParams, ...queryParams };
    
    // 글리치 테마를 위한 텍스트 색상 변경
    if(params.bg === 'glitch') {
        defaultParams.textColor = '#000000'; // 기본 텍스트 색상을 검은색으로
        params.textColor = queryParams.textColor || defaultParams.textColor;
    }
    
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
    
    // 글자 스타일: 글리치 테마는 흰색 채움+검은 테두리, 나머지는 검은 테두리만
    const mainTextStyle = params.bg === 'glitch' 
      ? `fill="${textColor}" paint-order="stroke" stroke="#000000" stroke-width="2px" stroke-linejoin="round"`
      : `fill="${textColor}" paint-order="stroke" stroke="#000000" stroke-width="2px" stroke-linejoin="round"`;


    const textElements = lines.map((line, index) => {
      const innerContent = parseBoldText(line);
      const dy = index > 0 ? `dy="${constants.lineHeight}em"` : '';
      return `<tspan x="${x}" ${dy}>${innerContent}</tspan>`;
    }).join('');

    const svg = `
      <svg width="${constants.width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeSVG(rawText)}">
        <style>
          text { font-family: sans-serif; }
        </style>
        ${backgroundContent}
        <text
          y="${startY}"
          font-size="${fontSize}px"
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
        // 캐시를 사용하지 않도록 헤더 변경
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
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
