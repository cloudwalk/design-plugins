(function(thisObj) {
    var scriptName = "CloudWalk's InfiniTools";
    
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 16;

        // Help button group
        var helpGroup = win.add("group");
        helpGroup.orientation = "row";
        helpGroup.alignment = ["right", "top"];
        var helpBtn = helpGroup.add("button", undefined, "?", {style: 'toolbutton'});
        helpBtn.size = [20, 20];
        helpBtn.helpTip = "About CloudWalk's InfiniTools";

        // Help window function
        helpBtn.onClick = function() {
            var helpWin = new Window("dialog", "About CloudWalk's InfiniTools");
            helpWin.orientation = "column";
            helpWin.alignChildren = ["fill", "top"];
            helpWin.spacing = 10;
            helpWin.margins = 16;

            var aboutText = helpWin.add("statictext", undefined, 
                "This is a opensource project from CloudWalk's DesignTeam.\n" +
                "Arthur Ruiz, Bia Smallman, Lucas Bueno and Matheus Canto created this out of passion and experimenting inside the company to bring easy solutions to everyone who is interested.\n" +
                "Claude 3.5 Sonnet was used in the making of this script.", 
                {multiline: true});
            aboutText.preferredSize.width = 400;

            helpWin.add("statictext", undefined, "Readme:", {multiline: true}).graphics.font = ScriptUI.newFont("Arial", "BOLD", 12);

            var readmeText = helpWin.add("statictext", undefined,
                "Money Maker: Creates a digital-payment app numeric keyboard. Put your desired value, adjust the time and the decimals. and click \"Print $\".\n\n" +
                "Magnemite: Creates a effector on layers to drive them procedurally. Select all the layers and the last one will be the effector. Choose between Scale, rotation and position. If you need, you can select them all and click the Trashcan Icon. This will reset all applied changes.\n\n" +
                "Guilliotin: Recreates a split pattern in one layer. Example: You have a edit inside the timeline, and want to make a layer follow every cut that the layers has. Select all the layers of the edit, and lastly the layer that you want to cut. and click \"Chop\"\n\n" +
                "Prism: Divides groups of Shape Layers into layers. Select the shape layer that contains what you want to split. and click \"Reflect\".\n\n" +
                "Abacool: Creates a fully funcional counter. Automatically. Click \"Count it up\". Animate the properties and sliders and be happy!\n\n" +
                "Cloudwalk, 2025.",
                {multiline: true});
            readmeText.preferredSize.width = 400;

            var closeBtn = helpWin.add("button", undefined, "Close");
            closeBtn.onClick = function() {
                helpWin.close();
            };

            helpWin.show();
        };
        
        // Create tab group
        var tpanel = win.add("tabbedpanel");
        tpanel.alignChildren = ["fill", "fill"];
        tpanel.preferredSize.width = 300;
        tpanel.margins = 0;
        
        // === MONEY MAKER TAB ===
        var moneyTab = tpanel.add("tab", undefined, "Money Maker");
        moneyTab.orientation = "column";
        moneyTab.alignChildren = ["fill", "top"];
        moneyTab.spacing = 10;
        
        var finalNumberGroup = moneyTab.add("group");
        finalNumberGroup.orientation = "row";
        finalNumberGroup.alignChildren = ["left", "center"];
        var finalNumberLabel = finalNumberGroup.add("statictext", undefined, "Final Number:");
        var finalNumberInput = finalNumberGroup.add("edittext", undefined, "420.00");
        finalNumberInput.characters = 10;
        
        var durationGroup = moneyTab.add("group");
        durationGroup.orientation = "row";
        durationGroup.alignChildren = ["left", "center"];
        var durationLabel = durationGroup.add("statictext", undefined, "Duration (s):");
        var durationInput = durationGroup.add("edittext", undefined, "2");
        durationInput.characters = 5;
        
        var decimalGroup = moneyTab.add("group");
        decimalGroup.orientation = "row";
        decimalGroup.alignChildren = ["left", "center"];
        var decimalLabel = decimalGroup.add("statictext", undefined, "Decimals:");
        var decimalInput = decimalGroup.add("edittext", undefined, "2");
        decimalInput.characters = 5;
        
        var createNumpadBtn = moneyTab.add("button", undefined, "Print $");
        
        // === MAGNEMITE TAB ===
        var magnemiteTab = tpanel.add("tab", undefined, "Magnemite");
        magnemiteTab.orientation = "column";
        magnemiteTab.alignChildren = ["fill", "top"];
        magnemiteTab.spacing = 6;
        
        var scaleBtn = magnemiteTab.add("button", undefined, "SCALE");
        var rotationBtn = magnemiteTab.add("button", undefined, "ROTATION");
        var posXBtn = magnemiteTab.add("button", undefined, "POSITION X");
        var posYBtn = magnemiteTab.add("button", undefined, "POSITION Y");
        magnemiteTab.add("panel", undefined, undefined, {height: 1});
        var resetBtn = magnemiteTab.add("button", undefined, "🗑️ RESET");
        
        // === GUILLIOTIN TAB ===
        var guilliotinTab = tpanel.add("tab", undefined, "Guilliotin");
        guilliotinTab.orientation = "column";
        guilliotinTab.alignChildren = ["fill", "top"];
        guilliotinTab.spacing = 10;
        
        var chopBtn = guilliotinTab.add("button", undefined, "Chop");
        
        // === PRISM TAB ===
        var prismTab = tpanel.add("tab", undefined, "Prism");
        prismTab.orientation = "column";
        prismTab.alignChildren = ["fill", "top"];
        prismTab.spacing = 10;
        
        var reflectBtn = prismTab.add("button", undefined, "Reflect");
        
        // === ABACOOL TAB ===
        var abacoolTab = tpanel.add("tab", undefined, "Abacool");
        abacoolTab.orientation = "column";
        abacoolTab.alignChildren = ["fill", "top"];
        abacoolTab.spacing = 10;

        var countBtn = abacoolTab.add("button", undefined, "Count it up");

        // === EVENT HANDLERS ===
        createNumpadBtn.onClick = function() {
            createMoneyAnimation(
                parseFloat(finalNumberInput.text),
                parseFloat(durationInput.text),
                parseInt(decimalInput.text)
            );
        };
        
        scaleBtn.onClick = function() { applyMagnemiteEffect("scale"); };
        rotationBtn.onClick = function() { applyMagnemiteEffect("rotation"); };
        posXBtn.onClick = function() { applyMagnemiteEffect("positionX"); };
        posYBtn.onClick = function() { applyMagnemiteEffect("positionY"); };
        resetBtn.onClick = resetAllEffects;
        
        chopBtn.onClick = applyGuilliotin;
        reflectBtn.onClick = applyPrism;
        countBtn.onClick = createAbacool;

        // Show the panel
        if (win instanceof Window) {
            win.center();
            win.show();
        } else {
            win.layout.layout(true);
        }
        
        return win;
    }
// === UTILITY FUNCTIONS ===
    function removeEffectIfExists(layer, effectName) {
        var effect = layer.Effects.property(effectName);
        if (effect) {
            effect.remove();
        }
    }

    function addEffectorSliders(effector, mode) {
        if (!effector.Effects.property("Influence")) {
            var influenceSlider = effector.Effects.addProperty("ADBE Slider Control");
            influenceSlider.name = "Influence";
            influenceSlider.property(1).setValue(100);
        }

        if (!effector.Effects.property("Hardness")) {
            var hardnessSlider = effector.Effects.addProperty("ADBE Slider Control");
            hardnessSlider.name = "Hardness";
            hardnessSlider.property(1).setValue(500);
        }

        if (mode === "scale" && !effector.Effects.property("ScaleAmount")) {
            var scaleSlider = effector.Effects.addProperty("ADBE Slider Control");
            scaleSlider.name = "ScaleAmount";
            scaleSlider.property(1).setValue(200);
        }

        if ((mode === "positionX" || mode === "positionY") && !effector.Effects.property("Offset")) {
            var offsetSlider = effector.Effects.addProperty("ADBE Slider Control");
            offsetSlider.name = "Offset";
            offsetSlider.property(1).setValue(100);
        }
    }

    // === MAIN FUNCTIONS ===
    function createMoneyAnimation(finalNumber, duration, decimalPlaces) {
        var activeComp = app.project.activeItem;
        if (!(activeComp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var textLayer = activeComp.layers.addText("Money Counter");
        var expression = [
            "// Money Maker Animation",
            "var finalNumber = " + finalNumber + ";",
            "var duration = " + duration + ";",
            "var decimalPlaces = " + decimalPlaces + ";",
            "var numberString = finalNumber.toFixed(decimalPlaces);",
            "var digitsOnly = numberString.replace('.', '');",
            "var totalSteps = digitsOnly.length;",
            "var currentStep = Math.floor(linear(time, 0, duration, 0, totalSteps));",
            "function formatNumber(num, decimalPlaces) {",
            "    var parts = num.toFixed(decimalPlaces).toString().split('.');",
            "    parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');",
            "    return parts.join('.');",
            "}",
            "var currentNumber = parseFloat(digitsOnly.substr(0, currentStep) / Math.pow(10, decimalPlaces));",
            "formatNumber(currentNumber, decimalPlaces);"
        ].join("\n");

        textLayer.property("Source Text").expression = expression;
        textLayer.property("Position").setValue([activeComp.width/2, activeComp.height/2]);
        textLayer.outPoint = duration;
    }

    function generateExpression(mode, effectorIndex) {
        var baseExpr = [
            "try {",
            "  var effector = thisComp.layer(" + effectorIndex + ");",
            "  var influence = clamp(effector.effect('Influence')('Slider'), -1000, 1000);",
            "  var hardness = Math.max(0.1, effector.effect('Hardness')('Slider'));",
            "  var dist = length(position - effector.transform.position);",
            "  var ratio = clamp(1 - linear(dist, 0, hardness, 1, 0), 0, 1);",
            "  var factor = ratio * (influence/100);",
            "} catch(err) { value }"
        ].join("\n");

        switch(mode) {
            case "scale":
                return baseExpr + [
                    "try {",
                    "  var scaleAmount = effector.effect('ScaleAmount')('Slider');",
                    "  var originalScale = value;",
                    "  var targetScale = originalScale * (scaleAmount/100);",
                    "  var finalScale = linear(1 - factor, 0, 1, originalScale, targetScale);",
                    "  finalScale;",
                    "} catch(err) { value }"
                ].join("\n");
            
            case "rotation":
                return baseExpr + "\ntry {\n  var originalRotation = value;\n  var targetRotation = originalRotation + 360;\n  linear(factor, 0, 1, originalRotation, targetRotation);\n} catch(err) { value }";
            
            default:
                return baseExpr + [
                    "try {",
                    "  var offset = effector.effect('Offset')('Slider');",
                    "  var original = value;",
                    "  var movement = offset * (1 - factor);",
                    "  original + movement;",
                    "} catch(err) { value }"
                ].join("\n");
        }
    }

    function applyPositionExpression(layer, expression, axis) {
        if (!layer.transform.position.dimensionsSeparated) {
            layer.transform.position.dimensionsSeparated = true;
        }
        
        if (axis === "x") {
            layer.transform.xPosition.expression = expression;
        } else {
            layer.transform.yPosition.expression = expression;
        }
    }

    function applyMagnemiteEffect(mode) {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length < 2) {
            alert("Please select at least 2 layers (affected layers and one effector).");
            return;
        }

        var effector = selectedLayers[selectedLayers.length - 1];
        addEffectorSliders(effector, mode);
        
        for (var i = 0; i < selectedLayers.length - 1; i++) {
            var layer = selectedLayers[i];
            var expression = generateExpression(mode, effector.index);
            
            switch(mode) {
                case "scale":
                    layer.transform.scale.expression = expression;
                    break;
                case "rotation":
                    layer.transform.rotation.expression = expression;
                    break;
                case "positionX":
                    applyPositionExpression(layer, expression, "x");
                    break;
                case "positionY":
                    applyPositionExpression(layer, expression, "y");
                    break;
            }
        }
    }

    function resetAllEffects() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var allLayers = comp.layers;
        for (var i = 1; i <= allLayers.length; i++) {
            var layer = allLayers[i];
            try {
                if (layer.transform.position.dimensionsSeparated) {
                    layer.transform.xPosition.expression = "";
                    layer.transform.yPosition.expression = "";
                    layer.transform.position.dimensionsSeparated = false;
                } else {
                    layer.transform.position.expression = "";
                }
                layer.transform.scale.expression = "";
                layer.transform.rotation.expression = "";
                
                removeEffectIfExists(layer, "Influence");
                removeEffectIfExists(layer, "Hardness");
                removeEffectIfExists(layer, "Offset");
                removeEffectIfExists(layer, "ScaleAmount");
            } catch (err) {
                continue;
            }
        }
    }

    function applyGuilliotin() {
        app.beginUndoGroup("Guilliotin");
        try {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }
            
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 2) {
                alert("Please select source layers and target layer.");
                return;
            }

            var targetLayer = selectedLayers[selectedLayers.length - 1];
            var referenceData = [];
            
            for (var i = 0; i < selectedLayers.length - 1; i++) {
                var layer = selectedLayers[i];
                referenceData.push({
                    start: layer.inPoint,
                    end: layer.outPoint,
                    index: layer.index
                });
            }
            
            referenceData.sort(function(a, b) {
                return a.start - b.start;
            });
            
            var originalTarget = targetLayer;
            
            for (var i = 0; i < referenceData.length; i++) {
                if (i > 0) {
                    targetLayer = originalTarget.duplicate();
                }
                targetLayer.inPoint = referenceData[i].start;
                targetLayer.outPoint = referenceData[i].end;
                targetLayer.moveAfter(comp.layer(referenceData[i].index));
            }
        } catch (err) {
            alert("An error occurred: " + err.toString());
        }
        app.endUndoGroup();
    }

    function applyPrism() {
        app.beginUndoGroup("Prism");
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select a shape layer.");
            return;
        }

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            if (layer instanceof ShapeLayer) {
                var contents = layer.property("Contents");
                for (var j = 1; j <= contents.numProperties; j++) {
                    var item = contents.property(j);
                    var newLayer = layer.duplicate();
                    newLayer.name = layer.name + " - " + item.name;
                    newLayer.moveBefore(layer);
                    
                    var newContents = newLayer.property("Contents");
                    for (var k = newContents.numProperties; k > 0; k--) {
                        if (newContents.property(k).name !== item.name) {
                            newContents.property(k).remove();
                        }
                    }
                }
            }
        }
        app.endUndoGroup();
    }

    function createAbacool() {
        app.beginUndoGroup("Create Abacool Counter");

        // Get active composition
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition first");
            return;
        }

        // Create text layer
        var textLayer = comp.layers.addText("Abacool Counter");
        textLayer.name = "Abacool Counter";
        
        // Add Effects Controls
        var effectsProperty = textLayer.property("Effects");
        
        // Add Slider Controls
        var startValue = effectsProperty.addProperty("ADBE Slider Control");
        startValue.name = "Start Number";
        startValue.property("Slider").setValue(0);

        var endValue = effectsProperty.addProperty("ADBE Slider Control");
        endValue.name = "End Number";
        endValue.property("Slider").setValue(100);

        var duration = effectsProperty.addProperty("ADBE Slider Control");
        duration.name = "Duration (seconds)";
        duration.property("Slider").setValue(2);

        var commaPosition = effectsProperty.addProperty("ADBE Slider Control");
        commaPosition.name = "Comma Position";
        commaPosition.property("Slider").setValue(3);

        // Add Checkboxes
        var useComma = effectsProperty.addProperty("ADBE Checkbox Control");
        useComma.name = "Use Comma";
        useComma.property("Checkbox").setValue(0);

        var usePercentage = effectsProperty.addProperty("ADBE Checkbox Control");
        usePercentage.name = "Add Percentage";
        usePercentage.property("Checkbox").setValue(0);

        // Center the text layer
        textLayer.property("Position").setValue([comp.width/2, comp.height/2]);

        // Add expression to Source Text
        var textProp = textLayer.property("Source Text");
        var expression = [
            "try {",
            "    // Get slider values",
            "    var start = effect('Start Number')('Slider');",
            "    var end = effect('End Number')('Slider');",
            "    var duration = effect('Duration (seconds)')('Slider');",
            "    ",
            "    // Calculate current value",
            "    var t = time - inPoint;",
            "    var value = linear(t, 0, duration, start, end);",
            "    var result = Math.round(value).toString();",
            "    ",
            "    // Handle comma",
            "    if (effect('Use Comma')('Checkbox') == 1) {",
            "        var commaPos = Math.round(effect('Comma Position')('Slider'));",
            "        if (result.length > commaPos) {",
            "            result = result.slice(0, -commaPos) + ',' + result.slice(-commaPos);",
            "        }",
            "    }",
            "    ",
            "    // Handle percentage",
            "    if (effect('Add Percentage')('Checkbox') == 1) {",
            "        result = result + '%';",
            "    }",
            "    ",
            "    result;",
            "} catch(err) {",
            "    // Error handling",
            "    'Error: ' + err.toString();",
            "}"
        ].join("\n");

        textProp.expression = expression;

        app.endUndoGroup();
    }

    // Build and show the UI
    var mainPanel = buildUI(thisObj);
    if (mainPanel != null) {
        if (mainPanel instanceof Window) {
            mainPanel.center();
            mainPanel.show();
        } else {
            mainPanel.layout.layout(true);
        }
    }
})(this);