figma.showUI(__html__, { width: 400, height: 900 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'update-preview') {
    const points = generateBlobPoints(msg.complexity, msg.uniqueness, msg.blobStyle);
    const svgPath = pointsToSVGPath(points);
    
    figma.ui.postMessage({
      type: 'preview-update',
      path: svgPath
    });
  }
  else if (msg.type === 'create-blob') {
    const points = generateBlobPoints(msg.complexity, msg.uniqueness, msg.blobStyle);
    const svgPath = pointsToSVGPath(points);
    
    // Creates the SVG as a string with the selected color or gradient
    let fillAttribute = '';
    if (msg.fillType === 'solid') {
      fillAttribute = `fill="${msg.colorPrimary}"`;
    } else {
      fillAttribute = `fill="url(#blobGradient)"`;
    }

    const svgString = `
      <svg width="160" height="160" viewBox="-80 -80 160 160" xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${msg.fillType === 'gradient' ? `
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${msg.colorPrimary}"/>
            <stop offset="100%" style="stop-color:${msg.colorSecondary}"/>
          </linearGradient>` : ''}
        </defs>
        <path d="${svgPath}" ${fillAttribute}/>
      </svg>
    `.trim();

    // Cria o nó SVG diretamente na página atual
    const node = figma.createNodeFromSvg(svgString);
    
    // Posiciona no centro da viewport
    node.x = figma.viewport.center.x - node.width / 2;
    node.y = figma.viewport.center.y - node.height / 2;
    
    // Seleciona e mostra o blob criado
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);
  }
};

function generateBlobPoints(complexity, uniqueness, style = 'organic') {
  switch (style) {
    case 'smooth':
      return generateSmoothBlobPoints(complexity, uniqueness);
    case 'spiky':
      return generateSpikyBlobPoints(complexity, uniqueness);
    case 'bubbly':
      return generateBubblyBlobPoints(complexity, uniqueness);
    case 'geometric':
      return generateGeometricBlobPoints(complexity, uniqueness);
    case 'cloud':
      return generateCloudBlobPoints(complexity, uniqueness);
    case 'splash':
      return generateSplashBlobPoints(complexity, uniqueness);
    case 'noise':
      return generateNoiseBlobPoints(complexity, uniqueness);
    case 'crystal':
      return generateCrystalBlobPoints(complexity, uniqueness);
    case 'liquid':
      return generateLiquidBlobPoints(complexity, uniqueness);
    default:
      return generateOrganicBlobPoints(complexity, uniqueness);
  }
}

function generateSmoothBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 8 + Math.floor(complexity * 192);
  const baseRadius = 80;
  
  // Generates a smoother shape with less variation
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    
    // Uses fewer waves and smoother variation
    let variation = 0;
    const numWaves = 2 + Math.floor(Math.random() * 2); // 2-3 ondas apenas
    
    for (let wave = 1; wave <= numWaves; wave++) {
      const freq = wave * 0.5;
      const phase = Math.random() * Math.PI * 2;
      const amp = (0.2 / wave) * uniqueness; // Amplitude menor e mais suave
      
      variation += Math.sin(angle * freq + phase) * amp;
    }
    
    // Adds a very smooth radial variation
    const radialVariation = Math.sin(angle * 2) * 0.05 * uniqueness;
    
    // Calculates the radius with less variation
    const radius = baseRadius * (1 + variation + radialVariation);
    
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.4 // Tensão mais alta para curvas mais suaves
    });
  }
  
  // Applies more smoothing
  let smoothedPoints = points;
  const smoothingPasses = 6; // Mais passadas de suavização
  
  for (let pass = 0; pass < smoothingPasses; pass++) {
    smoothedPoints = smoothedPoints.map((point, i) => {
      const prev = smoothedPoints[(i - 1 + smoothedPoints.length) % smoothedPoints.length];
      const next = smoothedPoints[(i + 1) % smoothedPoints.length];
      
      return {
        x: point.x * 0.5 + (prev.x + next.x) * 0.25,
        y: point.y * 0.5 + (prev.y + next.y) * 0.25,
        tension: point.tension
      };
    });
  }
  
  return smoothedPoints;
}

function generateOrganicBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 12 + Math.floor(complexity * 188);
  const baseRadius = 80;
  
  // Generates random seeds for each type of variation
  const seeds = {
    phase: Math.random() * Math.PI * 2,
    amplitude: Math.random() * 0.4 + 0.8,
    frequency: Math.random() * 0.5 + 0.7,
    distortion: Math.random() * 0.5 + 0.7
  };
  
  // Generates points with smoother distribution
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    
    // More intense noise system
    const noiseScale = (0.6 + uniqueness * 0.8) * seeds.amplitude;
    
    // Creates a series of waves with more frequencies
    let variation = 0;
    const numWaves = 8 + Math.floor(Math.random() * 8);
    
    for (let wave = 1; wave <= numWaves; wave++) {
      const freq = wave * seeds.frequency * 0.7;
      const phase = seeds.phase * wave;
      const amp = (0.6 / Math.sqrt(wave)) * (1 + Math.random() * 0.5);
      
      variation += Math.sin(angle * freq + phase) * amp;
      // Adds harmonics for more detail
      if (wave < numWaves / 2) {
        variation += Math.sin(angle * freq * 2 + phase * 1.5) * (amp * 0.4);
        variation += Math.sin(angle * freq * 0.5 + phase * 0.5) * (amp * 0.6);
      }
    }
    
    // Adds more complex distortion
    variation *= noiseScale * (1 + Math.sin(angle * 2) * 0.15 * seeds.distortion);
    variation *= (1 + Math.sin(angle * 3.5) * 0.1 * seeds.distortion);
    
    // Adds more complex radial variation
    const radialVariation = (
      Math.sin(angle * 1.5 + seeds.phase) * 0.1 +
      Math.sin(angle * 2.5 + seeds.phase * 1.5) * 0.08 +
      Math.sin(angle * 3.5 + seeds.phase * 0.5) * 0.06
    ) * uniqueness;
    
    // Calculates the final radius with all variations
    const radius = baseRadius * (1 + variation + radialVariation);
    
    // Adds a small smooth random variation
    const jitter = (Math.random() - 0.5) * 0.05 * uniqueness;
    
    points.push({
      x: Math.cos(angle) * radius * (1 + jitter),
      y: Math.sin(angle) * radius * (1 + jitter),
      tension: 0.35 + Math.random() * 0.1 // Tensão variável mais suave
    });
  }
  
  // More intense adaptive smoothing system
  let smoothedPoints = points;
  const smoothingPasses = 4 + Math.floor(uniqueness * 2); // 4-6 passadas baseado na unicidade
  
  for (let pass = 0; pass < smoothingPasses; pass++) {
    const smoothStrength = 0.35 + Math.random() * 0.2;
    
    smoothedPoints = smoothedPoints.map((point, i) => {
      const prev = smoothedPoints[(i - 1 + smoothedPoints.length) % smoothedPoints.length];
      const next = smoothedPoints[(i + 1) % smoothedPoints.length];
      const prev2 = smoothedPoints[(i - 2 + smoothedPoints.length) % smoothedPoints.length];
      const next2 = smoothedPoints[(i + 2) % smoothedPoints.length];
      
      // Adaptive weight with more emphasis on smoothing
      const weight = smoothStrength + Math.random() * 0.1;
      
      return {
        x: point.x * (1 - weight) + 
           (prev.x + next.x) * weight * 0.45 +
           (prev2.x + next2.x) * weight * 0.05,
        y: point.y * (1 - weight) + 
           (prev.y + next.y) * weight * 0.45 +
           (prev2.y + next2.y) * weight * 0.05,
        tension: point.tension
      };
    });
  }
  
  return smoothedPoints;
}

function generateSpikyBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 12 + Math.floor(complexity * 188);
  const baseRadius = 80;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    
    // Creates alternating more pronounced spikes
    const spikeVariation = Math.sin(angle * (8 + complexity * 12)) * 0.6 * uniqueness;
    const radiusVariation = (Math.random() - 0.5) * 0.5 * uniqueness;
    
    const radius = baseRadius * (1 + spikeVariation + radiusVariation);
    
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.15
    });
  }
  
  return points;
}

function generateBubblyBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 16 + Math.floor(complexity * 184);
  const baseRadius = 80;
  
  // Generates smaller bubbles around
  const numBubbles = 3 + Math.floor(complexity * 5);
  const bubbles = [];
  
  for (let i = 0; i < numBubbles; i++) {
    const angle = (i / numBubbles) * Math.PI * 2;
    const distance = baseRadius * 0.5;
    bubbles.push({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      radius: baseRadius * (0.2 + Math.random() * 0.3 * uniqueness)
    });
  }
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    let radius = baseRadius;
    
    // Bubble influence
    for (const bubble of bubbles) {
      const dx = Math.cos(angle) * radius - bubble.x;
      const dy = Math.sin(angle) * radius - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const influence = Math.max(0, 1 - distance / (bubble.radius * 2));
      radius += bubble.radius * influence * uniqueness;
    }
    
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.4
    });
  }
  
  return points;
}

function generateGeometricBlobPoints(complexity, uniqueness) {
  const points = [];
  const numSides = 5 + Math.floor(complexity * 4); // 5-8 lados
  const baseRadius = 80;
  
  for (let i = 0; i < numSides; i++) {
    const angle = (i / numSides) * Math.PI * 2;
    const nextAngle = ((i + 1) / numSides) * Math.PI * 2;
    
    // Main vertex
    const radius = baseRadius * (1 + (Math.random() - 0.5) * 0.2 * uniqueness);
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.1 // Baixa tensão para cantos mais definidos
    });
    
    // Control points between vertices
    if (uniqueness > 0.3) {
      const midAngle = (angle + nextAngle) / 2;
      const midRadius = baseRadius * (0.9 + Math.random() * 0.2 * uniqueness);
      points.push({
        x: Math.cos(midAngle) * midRadius,
        y: Math.sin(midAngle) * midRadius,
        tension: 0.3
      });
    }
  }
  
  return points;
}

function generateCloudBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 16 + Math.floor(complexity * 32);
  const baseRadius = 80;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    let radius = baseRadius;
    
    // Creates more pronounced ripples like clouds
    for (let wave = 1; wave <= 4; wave++) {
      const freq = wave * 2.5;
      const amp = (0.3 / wave) * uniqueness;
      radius += Math.sin(angle * freq) * baseRadius * amp;
      radius += Math.cos(angle * freq * 1.8) * baseRadius * amp * 0.7;
    }
    
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.5
    });
  }
  
  return points;
}

function generateSplashBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 12 + Math.floor(complexity * 24);
  const baseRadius = 80;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    let radius = baseRadius;
    
    // Creates random splashes
    if (Math.random() < uniqueness * 0.7) {
      radius *= 1 + Math.random() * uniqueness * 0.8;
    }
    
    // Adds splash details
    const splashDetail = Math.sin(angle * 8) * uniqueness * 20;
    radius += splashDetail;
    
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.2 // Baixa tensão para cantos mais afiados
    });
  }
  
  return points;
}

function generateNoiseBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 24 + Math.floor(complexity * 176);
  const baseRadius = 80;
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    let radius = baseRadius;
    
    // Adds Perlin-like noise
    for (let oct = 1; oct <= 4; oct++) {
      const freq = oct * 4;
      const amp = (1 / oct) * uniqueness * 30;
      radius += Math.sin(angle * freq + Math.cos(angle * freq * 0.5)) * amp;
    }
    
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.3
    });
  }
  
  return points;
}

function generateCrystalBlobPoints(complexity, uniqueness) {
  const points = [];
  const numFaces = 6 + Math.floor(complexity * 6); // 6-12 faces
  const baseRadius = 80;
  
  for (let i = 0; i < numFaces; i++) {
    const angle = (i / numFaces) * Math.PI * 2;
    const nextAngle = ((i + 1) / numFaces) * Math.PI * 2;
    
    // Main vertex
    const radius = baseRadius * (1 + (Math.random() - 0.5) * uniqueness * 0.3);
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.1 // Baixa tensão para faces mais retas
    });
    
    // Adds points intermediários para facetas
    if (uniqueness > 0.5) {
      const midAngle = (angle + nextAngle) / 2;
      const midRadius = baseRadius * (0.9 + Math.random() * uniqueness * 0.2);
      points.push({
        x: Math.cos(midAngle) * midRadius,
        y: Math.sin(midAngle) * midRadius,
        tension: 0.1
      });
    }
  }
  
  return points;
}

function generateLiquidBlobPoints(complexity, uniqueness) {
  const points = [];
  const numPoints = 20 + Math.floor(complexity * 180);
  const baseRadius = 80;
  
  // Creates waves of different frequencies to simulate liquid movement
  const waves = [];
  const numWaves = 3 + Math.floor(complexity * 4); // Reduzido para mais suavidade
  
  for (let i = 0; i < numWaves; i++) {
    waves.push({
      frequency: (1 + i) * 1.5 + Math.random() * 2, // Frequência reduzida
      amplitude: (0.3 - i * 0.05) * uniqueness, // Amplitude mais suave
      phase: Math.random() * Math.PI * 2
    });
  }
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    let radius = baseRadius;
    
    // Applies the waves to create a smoother liquid effect
    waves.forEach(wave => {
      radius += Math.sin(angle * wave.frequency + wave.phase) * baseRadius * wave.amplitude;
      radius += Math.cos(angle * wave.frequency * 0.5 + wave.phase) * baseRadius * wave.amplitude * 0.7;
    });
    
    // Adds extra smooth variations
    const flowVariation = Math.sin(angle * 4 + Math.cos(angle * 2)) * uniqueness * 8;
    radius += flowVariation;
    
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      tension: 0.7 // Aumentada para curvas mais suaves
    });
  }
  
  // Applies multiple smoothing passes
  let smoothedPoints = points;
  const smoothingPasses = 4;
  const smoothingFactor = 0.4;
  
  for (let pass = 0; pass < smoothingPasses; pass++) {
    smoothedPoints = smoothedPoints.map((point, i) => {
      const prev = smoothedPoints[(i - 1 + points.length) % points.length];
      const next = smoothedPoints[(i + 1) % points.length];
      const prev2 = smoothedPoints[(i - 2 + points.length) % points.length];
      const next2 = smoothedPoints[(i + 2) % points.length];
      
      return {
        x: point.x * (1 - smoothingFactor) + 
           (prev.x + next.x) * smoothingFactor * 0.4 +
           (prev2.x + next2.x) * smoothingFactor * 0.1,
        y: point.y * (1 - smoothingFactor) + 
           (prev.y + next.y) * smoothingFactor * 0.4 +
           (prev2.y + next2.y) * smoothingFactor * 0.1,
        tension: point.tension
      };
    });
  }
  
  return smoothedPoints;
}

function pointsToSVGPath(points) {
  if (points.length < 3) return '';
  
  const start = points[0];
  let path = `M ${start.x} ${start.y}`;
  
  function getControlPoints(p0, p1, p2) {
    const d01 = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
    const d12 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    
    const fa = (p1.tension) * d01 / (d01 + d12);
    const fb = (p1.tension) * d12 / (d01 + d12);
    
    // Pontos de controle mais próximos para curvas mais suaves
    const cp1x = p1.x - fa * (p2.x - p0.x) * 0.35;
    const cp1y = p1.y - fa * (p2.y - p0.y) * 0.35;
    const cp2x = p1.x + fb * (p2.x - p0.x) * 0.35;
    const cp2y = p1.y + fb * (p2.y - p0.y) * 0.35;
    
    return {
      cp1: { x: cp1x, y: cp1y },
      cp2: { x: cp2x, y: cp2y }
    };
  }
  
  // Fecha o loop com mais pontos para suavizar a junção
  const loopPoints = [
    points[points.length - 3],
    points[points.length - 2],
    points[points.length - 1],
    ...points,
    points[0],
    points[1],
    points[2],
    points[3]
  ];
  
  // Gera a curva suave
  for (let i = 3; i < loopPoints.length - 4; i++) {
    const p0 = loopPoints[i - 1];
    const p1 = loopPoints[i];
    const p2 = loopPoints[i + 1];
    
    const { cp1, cp2 } = getControlPoints(p0, p1, p2);
    path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p1.x} ${p1.y}`;
  }
  
  path += ' Z';
  return path;
}
