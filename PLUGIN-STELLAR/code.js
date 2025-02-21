function getStatusConfig(status) {
  const statusMap = {
    // Planning
    'Select a status': { emoji: '', color: { r: 0.6, g: 0.6, b: 0.6 } },
    'In progress': { emoji: '⚡', color: { r: 1, g: 0.8, b: 0 } },
    'Highlight': { emoji: '✨', color: { r: 1, g: 0.8, b: 0 } },

    // Design
    'Prototype': { emoji: '🎨', color: { r: 0.6, g: 0, b: 1 } },
    'Ready for development': { emoji: '🚀', color: { r: 0.6, g: 0, b: 1 } },

    // Review
    'In review': { emoji: '👀', color: { r: 0, g: 0.6, b: 1 } },
    'Test': { emoji: '🧪', color: { r: 0, g: 0.6, b: 1 } },
    'Need discussion': { emoji: '💭', color: { r: 0, g: 0.6, b: 1 } },
    'Need to understand': { emoji: '❓', color: { r: 0, g: 0.6, b: 1 } },

    // Alerts
    'On hold': { emoji: '⏸️', color: { r: 1, g: 0, b: 0 } },
    'Attention': { emoji: '⚠️', color: { r: 1, g: 0, b: 0 } },
    'Dont': { emoji: '🚫', color: { r: 1, g: 0, b: 0 } },

    // Completion
    'Completed': { emoji: '✅', color: { r: 0, g: 0.8, b: 0 } },
    'In production': { emoji: '🌟', color: { r: 0, g: 0.8, b: 0 } },
    'Archived': { emoji: '📦', color: { r: 0.6, g: 0.6, b: 0.6 } }
  };

  return statusMap[status] || statusMap['Select a status'];
}

const CONNECTOR_CONFIG = {
  default: {
    light: {
      color: {r: 0, g: 0, b: 0}, // Black for light backgrounds
      strokeWeight: 5,
      dashPattern: [],
      opacity: 1
    },
    dark: {
      color: {r: 1, g: 1, b: 1}, // White for dark backgrounds
      strokeWeight: 5,
      dashPattern: [],
      opacity: 1
    }
  },
  success: {
    light: {
      color: {r: 0.0, g: 0.5, b: 0.0}, // Dark green for light backgrounds
      strokeWeight: 5,
      dashPattern: [],
      opacity: 1
    },
    dark: {
      color: {r: 0.4, g: 0.8, b: 0.4}, // Light green for dark backgrounds
      strokeWeight: 5,
      dashPattern: [],
      opacity: 1
    }
  },
  error: {
    light: {
      color: {r: 0.7, g: 0.0, b: 0.0}, // Dark red for light backgrounds
      strokeWeight: 5,
      dashPattern: [],
      opacity: 1
    },
    dark: {
      color: {r: 1, g: 0.4, b: 0.4}, // Light red for dark backgrounds
      strokeWeight: 5,
      dashPattern: [],
      opacity: 1
    }
  },
  dashed: {
    light: {
      color: {r: 0, g: 0, b: 0}, // Black for light backgrounds
      strokeWeight: 5,
      dashPattern: [4, 4],
      opacity: 1
    },
    dark: {
      color: {r: 1, g: 1, b: 1}, // White for dark backgrounds
      strokeWeight: 5,
      dashPattern: [4, 4],
      opacity: 1
    }
  }
};

figma.showUI(__html__, { width: 500, height: 600, themeColors: true });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'show-error') {
    figma.notify(msg.message);
    return;
  }
  
  if (msg.type === 'create-frame-identifier') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.notify('Please select an element first');
        return;
      }

      // Calculate dimensions based on all selected frames
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      selection.forEach(node => {
        // Use relative coordinates to parent
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      });

      const totalWidth = maxX - minX;

      // Load Poppins fonts
      await figma.loadFontAsync({ family: "Poppins", style: "Regular" });
      await figma.loadFontAsync({ family: "Poppins", style: "SemiBold" });

      // Create the main frame
      const frame = figma.createFrame();
      frame.name = 'Frame Identifier';
      frame.resize(totalWidth, 120);

      // Position the frame 40px above the selected element
      frame.x = minX;
      frame.y = minY - (120 + 40);

      // Add the frame to the same parent as the selected element
      const parent = selection[0].parent;
      if (parent) {
        parent.appendChild(frame);
      }

      frame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      frame.strokeWeight = 1;
      frame.strokes = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
      frame.cornerRadius = 16;
      frame.layoutMode = 'VERTICAL';
      frame.primaryAxisAlignItems = 'CENTER';
      frame.counterAxisAlignItems = 'CENTER';
      frame.itemSpacing = 8;
      frame.paddingLeft = 32;
      frame.paddingRight = 32;
      frame.paddingTop = 16;
      frame.paddingBottom = 16;

      // Create the container for title and subtitle
      const textContainer = figma.createFrame();
      textContainer.name = 'Text Container';
      textContainer.layoutMode = 'VERTICAL';
      textContainer.primaryAxisAlignItems = 'CENTER';
      textContainer.counterAxisAlignItems = 'CENTER';
      textContainer.itemSpacing = 4;
      textContainer.fills = [];
      textContainer.layoutAlign = 'STRETCH';

      // Create the title
      const title = figma.createText();
      title.name = 'Title';
      title.fontName = { family: "Poppins", style: "SemiBold" };
      title.characters = msg.title || 'Title';
      title.fontSize = 24;
      title.textAlignHorizontal = 'CENTER';
      title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      title.layoutAlign = 'STRETCH';

      // Create the subtitle
      const subtitle = figma.createText();
      subtitle.name = 'Subtitle';
      subtitle.fontName = { family: "Poppins", style: "Regular" };
      subtitle.characters = msg.subtitle || 'Subtitle';
      subtitle.fontSize = 14;
      subtitle.textAlignHorizontal = 'CENTER';
      subtitle.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
      subtitle.layoutAlign = 'STRETCH';

      // Add title and subtitle to the container
      textContainer.appendChild(title);
      textContainer.appendChild(subtitle);

      // Add the container to the frame
      frame.appendChild(textContainer);

      // Select the created frame
      figma.currentPage.selection = [frame];
      figma.viewport.scrollAndZoomIntoView([frame]);

      figma.notify('Frame Identifier created! 🎉');
    } catch (error) {
      console.error('Error:', error);
      figma.notify('Error creating Frame Identifier');
    }
  } else if (msg.type === 'create-section-identifier') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.notify('Please select at least one frame');
        return;
      }

      // Load Poppins fonts
      await figma.loadFontAsync({ family: "Poppins", style: "Regular" });
      await figma.loadFontAsync({ family: "Poppins", style: "SemiBold" });

      // Calculate dimensions based on selected frames
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      selection.forEach(node => {
        // Use relative coordinates to parent
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      });

      // Create the header frame
      const headerFrame = figma.createFrame();
      headerFrame.name = 'Section Header';
      headerFrame.resize(maxX - minX, 200);

      // Position the header 40px above the selected element
      headerFrame.x = minX;
      headerFrame.y = minY - (200 + 40);

      // Add the header to the same parent as the selected element
      const parent = selection[0].parent;
      if (parent) {
        parent.appendChild(headerFrame);
      }

      headerFrame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      headerFrame.strokeWeight = 1;
      headerFrame.strokes = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
      headerFrame.cornerRadius = 24;
      headerFrame.layoutMode = 'VERTICAL';
      headerFrame.itemSpacing = 16;
      headerFrame.paddingLeft = 40;
      headerFrame.paddingRight = 40;
      headerFrame.paddingTop = 40;
      headerFrame.paddingBottom = 40;

      // Create status tag only if status is not None
      if (msg.status && msg.status !== 'None') {
        // Get status configuration
        const statusConfig = getStatusConfig(msg.status);

        // Create the status tag frame
        const tagFrame = figma.createFrame();
        tagFrame.name = 'Status Tag';
        tagFrame.resize(200, 32);
        tagFrame.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
        tagFrame.strokeWeight = 1;
        tagFrame.strokes = [{ type: 'SOLID', color: statusConfig.color }];
        tagFrame.cornerRadius = 16;
        tagFrame.layoutMode = 'HORIZONTAL';
        tagFrame.primaryAxisAlignItems = 'CENTER';
        tagFrame.counterAxisAlignItems = 'CENTER';
        tagFrame.itemSpacing = 8;
        tagFrame.paddingLeft = 12;
        tagFrame.paddingRight = 16;
        tagFrame.paddingTop = 6;
        tagFrame.paddingBottom = 6;

        // Create the status circle
        const statusCircle = figma.createEllipse();
        statusCircle.name = 'Status Circle';
        statusCircle.resize(8, 8);
        statusCircle.fills = [{ type: 'SOLID', color: statusConfig.color }];

        // Create the status text
        const statusText = figma.createText();
        statusText.fontName = { family: "Poppins", style: "Regular" };
        statusText.characters = msg.status;
        statusText.fontSize = 13;
        statusText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

        // Create the status emoji
        const statusEmoji = figma.createText();
        statusEmoji.fontName = { family: "Poppins", style: "Regular" };
        statusEmoji.characters = statusConfig.emoji;
        statusEmoji.fontSize = 13;

        // Add elements to the tag
        tagFrame.appendChild(statusCircle);
        tagFrame.appendChild(statusText);
        tagFrame.appendChild(statusEmoji);

        // Add tag to header frame
        headerFrame.appendChild(tagFrame);
      }

      // Create the container for title and subtitle
      const textContainer = figma.createFrame();
      textContainer.name = 'Text Container';
      textContainer.layoutMode = 'VERTICAL';
      textContainer.itemSpacing = 0;
      textContainer.fills = [];
      textContainer.layoutAlign = 'STRETCH';

      // Create the title
      const title = figma.createText();
      title.name = 'Title';
      title.fontName = { family: "Poppins", style: "SemiBold" };
      title.characters = msg.title || 'Section Title';
      title.fontSize = 48;
      title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      title.layoutAlign = 'STRETCH';

      // Create the subtitle
      const subtitle = figma.createText();
      subtitle.name = 'Subtitle';
      subtitle.fontName = { family: "Poppins", style: "Regular" };
      subtitle.characters = msg.subtitle || 'Section Subtitle';
      subtitle.fontSize = 24;
      subtitle.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
      subtitle.layoutAlign = 'STRETCH';

      // Add title and subtitle to the container
      textContainer.appendChild(title);
      textContainer.appendChild(subtitle);

      // Add elements to the header frame
      headerFrame.appendChild(textContainer);

      // Select the created header
      figma.currentPage.selection = [headerFrame];
      figma.viewport.scrollAndZoomIntoView([headerFrame]);

      figma.notify('Section Header created! 🎉');
    } catch (error) {
      console.error('Error:', error);
      figma.notify('Error creating Section Header');
    }
  } else if (msg.type === 'create-flow-identifier') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.notify('Please select at least one frame');
        return;
      }

      // Load Poppins fonts
      await figma.loadFontAsync({ family: "Poppins", style: "Regular" });
      await figma.loadFontAsync({ family: "Poppins", style: "SemiBold" });

      // Calculate dimensions based on selected frames
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      selection.forEach(node => {
        // Use relative coordinates to parent
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      });

      // Create the native section and position it
      const section = figma.createSection();
      section.name = 'Flow Identifier';

      // Position the section 40px above the selected element
      section.x = minX;
      section.y = minY - 200 - 40;

      // Add the section to the same parent as the selected element
      const parent = selection[0].parent;
      if (parent) {
        parent.appendChild(section);
      }

      // Create the header frame
      const headerFrame = figma.createFrame();
      headerFrame.name = 'Flow Header';
      headerFrame.resize(maxX - minX + 160, 200);
      headerFrame.x = 0;
      headerFrame.y = 0;
      headerFrame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
      headerFrame.strokeWeight = 0;
      headerFrame.cornerRadius = 0;
      headerFrame.layoutMode = 'VERTICAL';
      headerFrame.itemSpacing = 16;
      headerFrame.paddingLeft = 80;
      headerFrame.paddingRight = 80;
      headerFrame.paddingTop = 40;
      headerFrame.paddingBottom = 40;

      // Get status configuration
      const statusConfig = getStatusConfig(msg.status || 'Select a status');

      // Create the status tag frame
      const tagFrame = figma.createFrame();
      tagFrame.name = 'Status Tag';
      tagFrame.resize(200, 32);
      tagFrame.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
      tagFrame.strokeWeight = 1;
      tagFrame.strokes = [{ type: 'SOLID', color: statusConfig.color }];
      tagFrame.cornerRadius = 16;
      tagFrame.layoutMode = 'HORIZONTAL';
      tagFrame.primaryAxisAlignItems = 'CENTER';
      tagFrame.counterAxisAlignItems = 'CENTER';
      tagFrame.itemSpacing = 8;
      tagFrame.paddingLeft = 12;
      tagFrame.paddingRight = 16;
      tagFrame.paddingTop = 6;
      tagFrame.paddingBottom = 6;

      // Create the status circle
      const statusCircle = figma.createEllipse();
      statusCircle.name = 'Status Circle';
      statusCircle.resize(8, 8);
      statusCircle.fills = [{ type: 'SOLID', color: statusConfig.color }];

      // Create the status text
      const statusText = figma.createText();
      statusText.fontName = { family: "Poppins", style: "Regular" };
      statusText.characters = msg.status || 'Select a status';
      statusText.fontSize = 13;
      statusText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

      // Create the status emoji
      const statusEmoji = figma.createText();
      statusEmoji.fontName = { family: "Poppins", style: "Regular" };
      statusEmoji.characters = statusConfig.emoji;
      statusEmoji.fontSize = 13;

      // Add elements to the tag
      tagFrame.appendChild(statusCircle);
      tagFrame.appendChild(statusText);
      tagFrame.appendChild(statusEmoji);

      // Create the container for title and subtitle
      const textContainer = figma.createFrame();
      textContainer.name = 'Text Container';
      textContainer.layoutMode = 'VERTICAL';
      textContainer.itemSpacing = 0;
      textContainer.fills = [];
      textContainer.layoutAlign = 'STRETCH';

      // Create the title
      const title = figma.createText();
      title.name = 'Title';
      title.fontName = { family: "Poppins", style: "SemiBold" };
      title.characters = msg.title || 'Flow Title';
      title.fontSize = 64;
      title.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      title.layoutAlign = 'STRETCH';

      // Create the subtitle
      const subtitle = figma.createText();
      subtitle.name = 'Subtitle';
      subtitle.fontName = { family: "Poppins", style: "Regular" };
      subtitle.characters = msg.subtitle || 'Flow Subtitle';
      subtitle.fontSize = 24;
      subtitle.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
      subtitle.layoutAlign = 'STRETCH';

      // Add title and subtitle to the container
      textContainer.appendChild(title);
      textContainer.appendChild(subtitle);

      // Add elements to the header frame
      headerFrame.appendChild(tagFrame);
      headerFrame.appendChild(textContainer);

      // Add header frame to the section
      section.appendChild(headerFrame);

      // Add selected frames to the section and adjust their positions
      selection.forEach(node => {
        section.appendChild(node);
        node.x = node.x - minX + 80;
        node.y = node.y - minY + 200 + 140;
      });

      // Adjust the final size of the section with padding
      section.resizeWithoutConstraints(
        maxX - minX + 160,
        maxY - minY + 200 + 240
      );

      // Select the created section
      figma.currentPage.selection = [section];
      figma.viewport.scrollAndZoomIntoView([section]);

      figma.notify('Flow Identifier created! 🎉');
    } catch (error) {
      console.error('Error:', error);
      figma.notify('Error creating Flow Identifier');
    }
  } else if (msg.type === 'create-connector') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length !== 2) {
        figma.notify('Please select exactly two frames to connect');
        return;
      }

      const startNode = selection[0];
      const endNode = selection[1];

      // Function to calculate the closest point between two frames
      function findClosestPoints(frame1, frame2) {
        // Get relative coordinates for both frames
        const frame1Bounds = {
          x: frame1.x,
          y: frame1.y,
          width: frame1.width,
          height: frame1.height
        };

        const frame2Bounds = {
          x: frame2.x,
          y: frame2.y,
          width: frame2.width,
          height: frame2.height
        };

        // Centroids of the frames using relative positions
        const center1 = {
          x: frame1Bounds.x + frame1Bounds.width / 2,
          y: frame1Bounds.y + frame1Bounds.height / 2
        };
        const center2 = {
          x: frame2Bounds.x + frame2Bounds.width / 2,
          y: frame2Bounds.y + frame2Bounds.height / 2
        };

        // Determine which frame is on the left and right
        const isFrame1Left = center1.x < center2.x;
        const leftFrame = isFrame1Left ? frame1Bounds : frame2Bounds;
        const rightFrame = isFrame1Left ? frame2Bounds : frame1Bounds;
        
        // Determine which frame is above and below
        const isFrame1Above = center1.y < center2.y;
        const topFrame = isFrame1Above ? frame1Bounds : frame2Bounds;
        const bottomFrame = isFrame1Above ? frame2Bounds : frame1Bounds;

        // Calculate connection points
        let startPoint, endPoint, controlPoints = [];
        
        // If the frames are more distant horizontally
        if (Math.abs(center2.x - center1.x) > Math.abs(center2.y - center1.y)) {
          // Frame 1 to the left of Frame 2
          if (isFrame1Left) {
            startPoint = {
              x: frame1Bounds.x + frame1Bounds.width,
              y: center1.y
            };
            endPoint = {
              x: frame2Bounds.x,
              y: center2.y
            };
          } else {
            // Frame 1 to the right of Frame 2
            startPoint = {
              x: frame1Bounds.x,
              y: center1.y
            };
            endPoint = {
              x: frame2Bounds.x + frame2Bounds.width,
              y: center2.y
            };
          }
          
          // Control points for orthogonal curve
          const midX = (startPoint.x + endPoint.x) / 2;
          controlPoints = [
            { x: midX, y: startPoint.y },
            { x: midX, y: endPoint.y }
          ];
        } else {
          // Frame 1 above Frame 2
          if (isFrame1Above) {
            startPoint = {
              x: center1.x,
              y: frame1Bounds.y + frame1Bounds.height
            };
            endPoint = {
              x: center2.x,
              y: frame2Bounds.y
            };
          } else {
            // Frame 1 below Frame 2
            startPoint = {
              x: center1.x,
              y: frame1Bounds.y
            };
            endPoint = {
              x: center2.x,
              y: frame2Bounds.y + frame2Bounds.height
            };
          }
          
          // Control points for orthogonal curve
          const midY = (startPoint.y + endPoint.y) / 2;
          controlPoints = [
            { x: startPoint.x, y: midY },
            { x: endPoint.x, y: midY }
          ];
        }

        return { startPoint, endPoint, controlPoints };
      }

      // Find the closest points between the frames
      const { startPoint, endPoint, controlPoints } = findClosestPoints(startNode, endNode);

      // Check if the background is dark
      function isDarkBackground(node) {
        if (!node || !node.fills || node.fills.length === 0) return false;
        const fill = node.fills.find(f => f.type === 'SOLID');
        if (!fill) return false;
        const color = fill.color;
        return (color.r + color.g + color.b) / 3 < 0.5;
      }

      // Determine if we are in dark mode
      const isDarkMode = msg.forceDarkMode !== undefined ? 
        msg.forceDarkMode : 
        isDarkBackground(figma.currentPage);

      // Get connector configuration
      const config = CONNECTOR_CONFIG[msg.connectorType] || CONNECTOR_CONFIG.default;
      const style = config.light && config.dark ? 
        (isDarkMode ? config.dark : config.light) : 
        config;

      // Create a connector as a vector
      const connector = figma.createVector();
      connector.name = 'Frame Connector';

      // Apply connector style
      connector.strokeWeight = style.strokeWeight;
      connector.strokeAlign = 'CENTER';
      connector.dashPattern = style.dashPattern;
      connector.strokes = [{
        type: 'SOLID',
        color: style.color,
        opacity: style.opacity
      }];

      // Configure the connector path with orthogonal curves
      connector.vectorPaths = [{
        windingRule: 'NONE',
        data: `M ${startPoint.x} ${startPoint.y} L ${controlPoints[0].x} ${controlPoints[0].y} L ${controlPoints[1].x} ${controlPoints[1].y} L ${endPoint.x} ${endPoint.y}`
      }];

      // Add arrows
      connector.strokeCap = "ARROW_EQUILATERAL";

      // Add the connector to the same parent as the selected elements
      const parent = selection[0].parent;
      if (parent) {
        parent.appendChild(connector);
      }

      // Criar texto no meio do conector se a opção estiver ativada
      if (msg.withTextNode) {
        // Load Poppins Medium font
        await figma.loadFontAsync({ family: "Poppins", style: "Medium" });

        // Determine the text based on the connector type
        let defaultText = 'Text';
        switch (msg.connectorType) {
          case 'error':
            defaultText = 'Error';
            break;
          case 'success':
            defaultText = 'Success';
            break;
          case 'dashed':
          case 'default':
          default:
            defaultText = 'Text';
            break;
        }

        // Create frame for the text
        const textFrame = figma.createFrame();
        textFrame.name = 'Connector Text';
        textFrame.fills = [{ type: 'SOLID', color: style.color }];
        textFrame.strokeWeight = 1;
        textFrame.strokes = [{ type: 'SOLID', color: style.color }];
        textFrame.cornerRadius = 4;
        textFrame.layoutMode = 'HORIZONTAL';
        textFrame.primaryAxisAlignItems = 'CENTER';
        textFrame.counterAxisAlignItems = 'CENTER';
        textFrame.layoutSizingHorizontal = 'HUG';
        textFrame.layoutSizingVertical = 'HUG';
        textFrame.paddingLeft = 16;
        textFrame.paddingRight = 16;
        textFrame.paddingTop = 8;
        textFrame.paddingBottom = 8;

        // Create the text
        const text = figma.createText();
        text.fontName = { family: "Poppins", style: "Medium" };
        text.characters = defaultText;
        text.fontSize = 16;
        text.fills = [{ type: 'SOLID', color: isDarkMode ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 } }];

        // Add text to the frame
        textFrame.appendChild(text);

        // Posicionar o texto no meio do conector
        const connectorCenter = {
          x: (startPoint.x + endPoint.x) / 2,
          y: (startPoint.y + endPoint.y) / 2
        };
        textFrame.x = connectorCenter.x - textFrame.width / 2;
        textFrame.y = connectorCenter.y - textFrame.height / 2;

        // Add the text frame to the same parent
        if (parent) {
          parent.appendChild(textFrame);
        }

        // Criar um grupo com o conector e o texto
        const connectorGroup = figma.group([connector, textFrame], parent);
        connectorGroup.name = 'Connector with Text';

        // Selecionar o grupo criado
        figma.currentPage.selection = [connectorGroup];
        figma.viewport.scrollAndZoomIntoView([connectorGroup]);
      } else {
        // Selecionar o conector criado
        figma.currentPage.selection = [connector];
        figma.viewport.scrollAndZoomIntoView([connector]);
      }

      figma.notify('Connector created! 🎉');
    } catch (error) {
      console.error('Error:', error);
      figma.notify('Error creating connector');
    }
  }
};

// Function to clone arrays
function clone(val) {
  return JSON.parse(JSON.stringify(val));
} 