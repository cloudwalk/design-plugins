figma.showUI(__html__, { width: 400, height: 600 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'check-first-use') {
    const hasUsedBefore = await figma.clientStorage.getAsync('feedbackFactoryFirstUse');
    figma.ui.postMessage({ 
      type: 'first-use-response', 
      value: hasUsedBefore 
    });
  }
  
  else if (msg.type === 'mark-as-used') {
    await figma.clientStorage.setAsync('feedbackFactoryFirstUse', true);
  }
  
  else if (msg.type === 'create-variants') {
    try {
      if (figma.currentPage.selection.length === 0) {
        figma.notify("❌ Select a frame or component first");
        return;
      }

      const selectedNode = figma.currentPage.selection[0];
      const variants = msg.variants;

      // Load fonts
      await figma.loadFontAsync({ family: "Cera Pro", style: "Bold" });
      await figma.loadFontAsync({ family: "Cera Pro", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });

      // For each variant, create a copy and update texts
      let lastNode = selectedNode;
      for (const variant of variants) {
        console.log('Processing variant:', variant);
        
        // Create a copy of the original frame
        const newNode = selectedNode.clone();
        
        // Position the new copy to the right of the last one
        newNode.x = lastNode.x + lastNode.width + 100;
        newNode.y = lastNode.y;

        // Update frame name with feedback type
        newNode.name = `Feedback - ${variant.type}`;

        // Find and update texts
        const titleContainer = findNodeByName(newNode, "Title");
        const descriptionContainer = findNodeByName(newNode, "Description");

        if (titleContainer && descriptionContainer) {
          const titleText = findNodeByName(titleContainer, "text");
          const descriptionText = findNodeByName(descriptionContainer, "text");

          if (titleText && titleText.type === "TEXT") {
            await figma.loadFontAsync(titleText.fontName);
            titleText.characters = variant.title;
          }

          if (descriptionText && descriptionText.type === "TEXT") {
            await figma.loadFontAsync(descriptionText.fontName);
            descriptionText.characters = variant.description;
          }
        }

        // Update buttons
        console.log('Looking for Footer...');
        const footerNode = findNodeByName(newNode, "Footer");
        if (footerNode) {
          console.log('Footer found');
          
          // Primary Button
          console.log('Looking for first button...');
          const firstButton = findNodeByName(footerNode, "first_mobile-button-pill-lg");
          if (firstButton) {
            console.log('First button found');
            const labelNode = findNodeByName(firstButton, "Label");
            if (labelNode) {
              console.log('First button label found');
              const firstButtonText = findNodeByName(labelNode, "text");
              if (firstButtonText && firstButtonText.type === "TEXT") {
                console.log('First button text found, updating to:', variant.primary_button);
                await figma.loadFontAsync(firstButtonText.fontName);
                firstButtonText.characters = variant.primary_button || firstButtonText.characters;
              } else {
                console.log('First button text not found');
              }
            } else {
              console.log('First button label not found');
            }
          } else {
            console.log('First button not found');
          }

          // Secondary Button
          console.log('Looking for second button...');
          const secondButton = findNodeByName(footerNode, "second_mobile-button-pill-lg");
          if (secondButton) {
            console.log('Second button found');
            const labelNode = findNodeByName(secondButton, "Label");
            if (labelNode) {
              console.log('Second button label found');
              const secondButtonText = findNodeByName(labelNode, "text");
              if (secondButtonText && secondButtonText.type === "TEXT") {
                console.log('Second button text found, updating to:', variant.secondary_button);
                await figma.loadFontAsync(secondButtonText.fontName);
                secondButtonText.characters = variant.secondary_button || secondButtonText.characters;
              } else {
                console.log('Second button text not found');
              }
            } else {
              console.log('Second button label not found');
            }
          } else {
            console.log('Second button not found');
          }
        } else {
          console.log('Footer not found');
        }

        // Create frame for error codes
        if (variant.codes && variant.codes.length > 0) {
          const codesFrame = figma.createFrame();
          codesFrame.name = "Error Codes";
          codesFrame.resize(newNode.width, 40);
          codesFrame.x = newNode.x;
          codesFrame.y = newNode.y + newNode.height + 20;
          codesFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
          codesFrame.cornerRadius = 8;

          const codesText = figma.createText();
          await figma.loadFontAsync({ family: "Inter", style: "Regular" });
          codesText.fontName = { family: "Inter", style: "Regular" };
          codesText.fontSize = 14;
          codesText.x = 16;
          codesText.y = 12;
          codesText.characters = `error codes: ${variant.codes.join(", ")}`;
          codesFrame.appendChild(codesText);
        }

        lastNode = newNode;
      }

      figma.notify("✅ Variants created successfully!");
      
    } catch (error) {
      figma.notify(`❌ Error: ${error.message}`);
      console.error(error);
    }
  }
};

function findNodeByName(node, name) {
  if (node.name === name) {
    return node;
  }
  
  if ("children" in node) {
    for (const child of node.children) {
      const found = findNodeByName(child, name);
      if (found) return found;
    }
  }
  
  return null;
}