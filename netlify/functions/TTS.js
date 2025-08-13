const sharp = require('sharp');

// --- 기존 코드 유지 (escapeSVG, parseBoldText, generateBackgroundSVG, constants) ---
// ... (기존 함수들을 그대로 유지)

exports.handler = async function(event) {
  try {
    const defaultParams = {
      text: 'Dynamic {SVG} on Netlify|Special Chars: < & >',
      textColor: '#ffffff',
      fontSize: 16,
      align: 'left',
      bg: 'default',
      format: 'webp', // 새로운 파라미터 추가
      quality: 80     // WebP 품질 설정
    };
    
    const queryParams = event.queryStringParameters || {};
    const params = { ...defaultParams, ...queryParams };
    
    const fontSize = Math.max(10, Math.min(parseInt(params.fontSize, 10) || defaultParams.fontSize, 120));
    const quality = Math.max(10, Math.min(parseInt(params.quality, 10) || 80, 100));
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
    const mainTextStyle = `paint-order="stroke" stroke="#000000" stroke-width="2px" stroke-linejoin="round"`;

    const textElements = lines.map((line, index) => {
      const innerContent = parseBoldText(line);
      const yPos = startY + (index * constants.lineHeight * fontSize);
      return `<text x="${x}" y="${yPos}" font-family="sans-serif" font-size="${fontSize}px" fill="${textColor}" text-anchor="${textAnchor}" ${mainTextStyle}>${innerContent}</text>`;
    }).join('');

    const svgContent = `
      <svg width="${constants.width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeSVG(rawText)}">
        <style>text { white-space: pre; }</style>
        ${backgroundContent}
        ${textElements}
      </svg>
    `.trim();

    // format 파라미터에 따라 출력 결정
    if (params.format === 'webp') {
      // SVG를 WebP로 변환
      const webpBuffer = await sharp(Buffer.from(svgContent))
        .webp({ quality: quality, effort: 6 })
        .toBuffer();

      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        },
        body: webpBuffer.toString('base64'),
        isBase64Encoded: true
      };
    } else if (params.format === 'png') {
      // PNG로 변환 (대안)
      const pngBuffer = await sharp(Buffer.from(svgContent))
        .png({ compressionLevel: 9 })
        .toBuffer();

      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        },
        body: pngBuffer.toString('base64'),
        isBase64Encoded: true
      };
    } else {
      // 기본 SVG 출력
      return {
        statusCode: 200,
        headers: { 
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        },
        body: svgContent
      };
    }

  } catch (err) {
    console.error("Image Generation Error:", err);
    const errorSvg = `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f8d7da" /><text x="10" y="50%" font-family="monospace" font-size="16" fill="#721c24" dominant-baseline="middle">Error: ${escapeSVG(err.message)}</text></svg>`;
    return { 
      statusCode: 500,
      headers: { 'Content-Type': 'image/svg+xml' },
      body: errorSvg
    };
  }
};
