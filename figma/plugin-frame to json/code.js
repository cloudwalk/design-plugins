// Mostra a interface do plugin
figma.showUI(__html__);

figma.ui.resize(400, 500);

// Definição das paletas do design system
const PALETTES = {
  neutral: {
    transparent: '0x00FFFFFF',
    tone0: '0xFFFFFFFF',
    tone50: '0xFFF9F9F9',
    tone100: '0xFFF5F5F5',
    tone200: '0xFFEEEEEE',
    tone300: '0xFFE0E0E0',
    tone400: '0xFFC7C7C7',
    tone500: '0xFF9E9E9E',
    tone600: '0xFF7A7A7A',
    tone700: '0xFF616161',
    tone800: '0xFF323232',
    tone900: '0xFF121212',
    tone1000: '0xFF000000'
  },
  green: {
    tone0: '0xFFEBFCEE',
    tone100: '0xFFC5F7CE',
    tone200: '0xFF8EEE9F',
    tone300: '0xFF5DE672',
    tone400: '0xFF41E157',
    tone500: '0xFF28B438',
    tone600: '0xFF229731',
    tone700: '0xFF1B7326',
    tone800: '0xFF154F1D',
    tone900: '0xFF113F18',
    tone1000: '0xFF0E2F13'
  },
  greenLime: {
    tone0: '0xFFFAFFF0',
    tone500: '0xFFBAFF1A',
    tone600: '0xFF8FCC00',
    tone700: '0xFF6B9900',
    tone800: '0xFF598000',
    tone900: '0xFF476600',
    tone1000: '0xFF243300'
  },
  red: {
    tone300: '0xFFFF6678',
    tone500: '0xFFFF001E',
    tone600: '0xFFDF001A',
    tone700: '0xFFCC0018',
    tone800: '0xFF990012'
  },
  yellow: {
    tone500: '0xFFFF9D00',
    tone600: '0xFFF09400',
    tone700: '0xFFCC7E00',
    tone800: '0xFF995E00'
  },
  purple: {
    tone500: '0xFF7C3EFF',
    tone600: '0xFF6E08F2',
    tone700: '0xFF4F06AD'
  }
};

// Função para encontrar a cor mais próxima e retornar a referência do DS
function findClosestColor(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = Math.round(color.a * 255);

  let closestColor = {
    palette: 'neutral',
    tone: 'transparent',
    value: PALETTES.neutral.transparent
  };
  let minDifference = Number.MAX_VALUE;

  // Função para calcular a diferença entre duas cores
  function colorDifference(r1, g1, b1, r2, g2, b2) {
    return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
  }

  // Percorre todas as paletas e tons
  Object.entries(PALETTES).forEach(([paletteName, palette]) => {
    Object.entries(palette).forEach(([toneName, hexColor]) => {
      const hex = parseInt(hexColor.substring(2), 16);
      const paletteR = (hex >> 16) & 0xFF;
      const paletteG = (hex >> 8) & 0xFF;
      const paletteB = hex & 0xFF;

      const difference = colorDifference(r, g, b, paletteR, paletteG, paletteB);
      
      if (difference < minDifference) {
        minDifference = difference;
        closestColor = {
          palette: paletteName,
          tone: toneName,
          value: hexColor
        };
      }
    });
  });

  return closestColor;
}

// Substitui a função colorToHex original
function colorToHex(color) {
  return findClosestColor(color);
}

function getNodeProperties(node) {
  // Only filter out status bar and Home Indicator if they're not the main frame
  if (node.type !== "FRAME" && (
      node.name.toLowerCase().includes('status-bar') || 
      node.name.toLowerCase().includes('home indicator'))) {
    return null;
  }

  const baseProperties = {
    name: node.name,
    width: Math.round(node.width),
    height: Math.round(node.height),
    type: node.type
  };

  // Adicionar propriedades de estilo
  if (node.type === "TEXT") {
    return Object.assign({}, baseProperties, {
      fontSize: node.fontSize,
      fontName: node.fontName,
      characters: node.characters,
      textAlignHorizontal: node.textAlignHorizontal,
      textAlignVertical: node.textAlignVertical,
      fills: node.fills,
      fontWeight: node.fontWeight,
      lineHeight: node.lineHeight
    });
  }

  // Para componentes e instâncias
  if (node.type === "INSTANCE" || node.type === "COMPONENT") {
    const children = node.children ? node.children
      .map(child => getNodeProperties(child))
      .filter(child => child !== null) : [];

    return Object.assign({}, baseProperties, {
      fills: node.fills,
      strokes: node.strokes,
      strokeWeight: node.strokeWeight,
      cornerRadius: node.cornerRadius,
      effects: node.effects,
      styles: node.styles,
      componentProperties: node.componentProperties,
      children: children
    });
  }

  // Add a base case for rectangles
  if (node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "STAR" || node.type === "VECTOR" || node.type === "LINE") {
    const shapeFills = node.fills && node.fills.length > 0 ? node.fills : [];
    return Object.assign({}, baseProperties, {
      fills: shapeFills,
      cornerRadius: node.cornerRadius,
      effects: node.effects
    });
  }

  // Para frames e grupos
  if (node.type === "FRAME" || node.type === "GROUP") {
    const children = node.children ? node.children
      .map(child => getNodeProperties(child))
      .filter(child => child !== null) : [];

    return Object.assign({}, baseProperties, {
      fills: node.backgrounds || node.fills,
      layoutMode: node.layoutMode,
      primaryAxisSizingMode: node.primaryAxisSizingMode,
      counterAxisSizingMode: node.counterAxisSizingMode,
      paddingLeft: node.paddingLeft,
      paddingRight: node.paddingRight,
      paddingTop: node.paddingTop,
      paddingBottom: node.paddingBottom,
      itemSpacing: node.itemSpacing,
      cornerRadius: node.cornerRadius,
      effects: node.effects,
      children: children
    });
  }

  return baseProperties;
}

// Função para verificar se um hex corresponde a alguma cor da paleta
function findExactPaletteMatch(hexColor) {
  // Converter para o formato da paleta (0xFF...)
  const paletteFormat = `0x${hexColor.replace('#', 'FF')}`.toUpperCase();
  
  for (const [paletteName, palette] of Object.entries(PALETTES)) {
    for (const [toneName, paletteColor] of Object.entries(palette)) {
      if (paletteColor.toUpperCase() === paletteFormat) {
        return {
          palette: paletteName,
          tone: toneName
        };
      }
    }
  }
  return null;
}

function frameToFlutterJson(frame) {
  const frameProps = getNodeProperties(frame);
  
  if (!frameProps) {
    return null;
  }

  const getDecorationColor = (props) => {
    if (!props.fills || !props.fills.length) return null;
    
    // Handle solid fills
    const solidFill = props.fills.find(fill => fill.type === 'SOLID');
    if (solidFill && solidFill.color) {
      const r = Math.round(solidFill.color.r * 255);
      const g = Math.round(solidFill.color.g * 255);
      const b = Math.round(solidFill.color.b * 255);
      const a = Math.round(solidFill.color.a * 255);
      
      // Convert to hex format
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      // Check if color exists in palette
      const paletteMatch = findExactPaletteMatch(hex);
      if (paletteMatch) {
        return {
          dsColor: paletteMatch
        };
      }
      
      return {
        hex: hex
      };
    }
    return null;
  };

  const flutterWidget = {
    name: frameProps.name,
    widgetType: 'Container',
    properties: {
      width: frameProps.width,
      height: frameProps.height,
      padding: {
        left: frameProps.paddingLeft || 0,
        right: frameProps.paddingRight || 0,
        top: frameProps.paddingTop || 0,
        bottom: frameProps.paddingBottom || 0
      },
      decoration: {
        color: getDecorationColor(frameProps),
        borderRadius: frameProps.cornerRadius || 0,
        boxShadow: frameProps.effects ? frameProps.effects.map(effect => ({
          color: effect.color ? (() => {
            const r = Math.round(effect.color.r * 255);
            const g = Math.round(effect.color.g * 255);
            const b = Math.round(effect.color.b * 255);
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
            
            const paletteMatch = findExactPaletteMatch(hex);
            if (paletteMatch) {
              return {
                dsColor: paletteMatch
              };
            }
            
            return {
              hex: hex
            };
          })() : null,
          blurRadius: effect.radius || 0,
          offset: {
            x: effect.offset ? effect.offset.x : 0,
            y: effect.offset ? effect.offset.y : 0
          }
        })) : []
      },
      children: frameProps.children ? frameProps.children
        .map(child => {
          const baseProps = {
            name: child.name,
            widgetType: child.type === 'TEXT' ? 'Text' : 'Container',
            properties: {
              width: child.width,
              height: child.height
            }
          };

          if (child.type === 'TEXT') {
            baseProps.properties.text = {
              content: child.characters,
              style: {
                fontSize: child.fontSize,
                fontWeight: child.fontWeight,
                fontFamily: child.fontName ? child.fontName.family : null,
                color: child.fills && child.fills.length > 0 && child.fills[0].color ? (() => {
                  const color = child.fills[0].color;
                  const r = Math.round(color.r * 255);
                  const g = Math.round(color.g * 255);
                  const b = Math.round(color.b * 255);
                  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                  
                  const paletteMatch = findExactPaletteMatch(hex);
                  if (paletteMatch) {
                    return {
                      dsColor: paletteMatch
                    };
                  }
                  
                  return {
                    hex: hex
                  };
                })() : null
              }
            };
          } else {
            baseProps.properties.decoration = {
              color: getDecorationColor(child),
              borderRadius: child.cornerRadius || 0,
              boxShadow: child.effects ? child.effects.map(effect => ({
                color: effect.color ? (() => {
                  const r = Math.round(effect.color.r * 255);
                  const g = Math.round(effect.color.g * 255);
                  const b = Math.round(effect.color.b * 255);
                  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                  
                  const paletteMatch = findExactPaletteMatch(hex);
                  if (paletteMatch) {
                    return {
                      dsColor: paletteMatch
                    };
                  }
                  
                  return {
                    hex: hex
                  };
                })() : null,
                blurRadius: effect.radius || 0,
                offset: {
                  x: effect.offset ? effect.offset.x : 0,
                  y: effect.offset ? effect.offset.y : 0
                }
              })) : []
            };

            if (child.children) {
              const childWidgets = child.children
                .map(grandChild => frameToFlutterJson(grandChild))
                .filter(widget => widget !== null)
                .map(widget => widget.widget);
              
              if (childWidgets.length > 0) {
                baseProps.properties.children = childWidgets;
              }
            }
          }

          return baseProps;
        })
        .filter(child => child !== null) : []
    }
  };

  return { widget: flutterWidget };
}

// Escuta mensagens da interface do usuário
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-json') {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify('Por favor, selecione um frame');
      return;
    }

    const selectedFrame = selection[0];
    if (selectedFrame.type !== "FRAME") {
      figma.notify('Por favor, selecione um frame');
      return;
    }

    const flutterData = frameToFlutterJson(selectedFrame);
    const jsonString = JSON.stringify(flutterData, null, 2);
    figma.ui.postMessage({ type: 'json-data', data: jsonString });
  }

  if (msg.type === "close-plugin") {
    figma.close();
  }
};