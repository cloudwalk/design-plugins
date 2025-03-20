/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/plugin/controller.ts":
/*!**********************************!*\
  !*** ./src/plugin/controller.ts ***!
  \**********************************/
/***/ (function() {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, {
    width: 520,
    height: 680,
    title: 'RedatorIA'
});
const checkSelection = () => {
    console.log('🔍 Checking selection...');
    const selection = figma.currentPage.selection;
    if (selection.length === 1) {
        const node = selection[0];
        console.log('📌 Selected node type:', node.type);
        let textContent = '';
        let totalTextNodes = 0;
        let textNodes = [];
        if (node.type === "TEXT") {
            textContent = node.characters;
            totalTextNodes = 1;
            textNodes = [node];
            console.log('📝 Found single text node:', textContent);
        }
        else if ('children' in node) {
            textNodes = node.findAll(n => n.type === "TEXT");
            totalTextNodes = textNodes.length;
            console.log(`📚 Found ${totalTextNodes} text nodes in frame`);
            if (textNodes.length > 0) {
                textContent = textNodes[0].characters;
                const selectedNodes = figma.currentPage.selection;
                if (selectedNodes.length === 1 && selectedNodes[0].type === "TEXT") {
                    const selectedTextNode = textNodes.find(n => n.id === selectedNodes[0].id);
                    if (selectedTextNode) {
                        textContent = selectedTextNode.characters;
                    }
                }
                console.log('📝 Selected/First text node content:', textContent);
            }
        }
        figma.ui.postMessage({
            type: 'selected-text',
            message: textContent,
            totalTextNodes: totalTextNodes
        });
        if (textNodes.length > 0) {
            console.log('📑 All text nodes found:');
            textNodes.forEach((node, index) => {
                console.log(`${index + 1}. "${node.characters}"`);
            });
        }
    }
    else {
        console.log('❌ No single node selected');
        figma.ui.postMessage({
            type: 'selected-text',
            message: '',
            totalTextNodes: 0
        });
    }
};
checkSelection();
figma.on("selectionchange", () => {
    console.log('🔄 Selection changed');
    checkSelection();
});
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    if (msg.type === 'cancel') {
        figma.closePlugin();
        return;
    }
    if (msg.type === 'get-initial-selection') {
        checkSelection();
        return;
    }
    if (msg.type === 'chat-message' && !msg.requiresSelection) {
        try {
            const response = yield generateChatResponse(msg.prompt);
            figma.ui.postMessage({
                type: 'chat-response',
                response
            });
        }
        catch (error) {
            figma.ui.postMessage({
                type: 'generation-error',
                error: error.message
            });
        }
        return;
    }
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) {
        figma.ui.postMessage({
            type: 'generation-error',
            error: 'Please select a single text layer or frame'
        });
        return;
    }
    const node = selection[0];
    let textNode = null;
    if (node.type === "TEXT") {
        textNode = node;
    }
    else if ('children' in node) {
        if (selection.length === 1 && selection[0].type === "TEXT") {
            textNode = selection[0];
        }
        else {
            const textNodes = node.findAll(n => n.type === "TEXT");
            if (textNodes.length > 0) {
                textNode = textNodes[0];
            }
        }
    }
    if (!textNode) {
        figma.ui.postMessage({
            type: 'generation-error',
            error: 'No text found in selection'
        });
        return;
    }
    switch (msg.type) {
        case 'generate-alternatives':
            try {
                const alternatives = yield generateTextAlternatives(textNode.characters, msg.tone, msg.language);
                figma.ui.postMessage({
                    type: 'alternatives-generated',
                    alternatives
                });
            }
            catch (error) {
                figma.ui.postMessage({
                    type: 'generation-error',
                    error: error.message
                });
            }
            break;
        case 'chat-message':
            try {
                const response = yield generateChatResponse(msg.prompt, textNode.characters);
                figma.ui.postMessage({
                    type: 'chat-response',
                    response
                });
            }
            catch (error) {
                figma.ui.postMessage({
                    type: 'generation-error',
                    error: error.message
                });
            }
            break;
        case 'replace-text':
            try {
                yield figma.loadFontAsync(textNode.fontName);
                textNode.characters = msg.text;
                figma.ui.postMessage({
                    type: 'text-replaced',
                    success: true
                });
            }
            catch (error) {
                figma.ui.postMessage({
                    type: 'text-replaced',
                    success: false,
                    error: error.message
                });
            }
            break;
    }
});
function generateChatResponse(prompt, selectedText = null) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const messages = [
                {
                    role: 'system',
                    content: `Você é um assistente especializado em gerar variações de texto. Sua tarefa é gerar EXATAMENTE 5 versões alternativas do texto fornecido, seguindo estas regras:
        1. Cada alternativa deve ser uma substituição direta do texto original
        2. Mantenha o significado principal e o tom apropriado
        3. Retorne APENAS as 5 alternativas, uma por linha
        4. Não inclua numeração, explicações ou meta texto
        5. Não faça reconhecimento das instruções
        6. Adapte cada alternativa de acordo com a instrução fornecida`
                },
                {
                    role: 'user',
                    content: `Texto original: "${selectedText}"\nInstrução: ${prompt}\n\nGere 5 alternativas seguindo a instrução.`
                }
            ];
            const response = yield fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-0125-preview',
                    messages,
                    max_tokens: 250,
                    temperature: 0.7
                })
            });
            if (!response.ok) {
                throw new Error('Failed to generate chat response');
            }
            const data = yield response.json();
            return data.choices[0].message.content.trim();
        }
        catch (error) {
            console.error('Error generating chat response:', error);
            throw error;
        }
    });
}
function generateTextAlternatives(text, tone, language) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-0125-preview',
                    messages: [
                        {
                            role: 'system',
                            content: `Você é um gerador de variações de texto. Sua tarefa é gerar versões alternativas do texto mantendo estas regras:
            1. Use as instruções de tom fornecidas: ${tone}
            2. Cada alternativa deve ser uma substituição direta do texto original
            3. Mantenha a mensagem e o significado principal
            4. Retorne APENAS os textos alternativos, um por linha
            5. Não inclua explicações, números ou prefixos
            6. Não faça reconhecimento das instruções ou adicione meta texto
            7. ${language}`
                        },
                        {
                            role: 'user',
                            content: `Texto original: "${text}"\nGere 5 alternativas seguindo o tom especificado.`
                        }
                    ],
                    max_tokens: 250,
                    temperature: 0.7
                })
            });
            if (!response.ok) {
                throw new Error('Failed to generate alternatives');
            }
            const data = yield response.json();
            const content = data.choices[0].message.content;
            return content
                .split('\n')
                .map(line => line.trim())
                .filter(line => {
                return line &&
                    !line.match(/^\d+\./) &&
                    !line.match(/^(Aqui|Certo|Segue|Alternativa|Versão|Opção|Here|Ok|Right|Alternative|Version|Option|Aquí|Bien|Sigue|Alternativa|Versión|Opción)/i) &&
                    !line.match(/^(Mantendo|Usando|Adaptando|Seguindo|Keeping|Using|Adapting|Following|Manteniendo|Usando|Adaptando|Siguiendo)/i);
            })
                .slice(0, 5);
        }
        catch (error) {
            console.error('Error generating alternatives:', error);
            throw error;
        }
    });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/plugin/controller.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLGdCQUFnQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsVUFBVSxLQUFLLGdCQUFnQjtBQUM5RCxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLGlEQUFpRCxhQUFhLGdCQUFnQixPQUFPO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxzS0FBMEIsQ0FBQztBQUMxRSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxzS0FBMEIsQ0FBQztBQUMxRSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNEO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsU0FBUztBQUMxQix5QkFBeUI7QUFDekI7QUFDQTtBQUNBLHlEQUF5RCxLQUFLO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7O1VFbFJBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9maWdtYS1wbHVnaW4tcmVhY3QtdGVtcGxhdGUvLi9zcmMvcGx1Z2luL2NvbnRyb2xsZXIudHMiLCJ3ZWJwYWNrOi8vZmlnbWEtcGx1Z2luLXJlYWN0LXRlbXBsYXRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZmlnbWEtcGx1Z2luLXJlYWN0LXRlbXBsYXRlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9maWdtYS1wbHVnaW4tcmVhY3QtdGVtcGxhdGUvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuZmlnbWEuc2hvd1VJKF9faHRtbF9fLCB7XG4gICAgd2lkdGg6IDUyMCxcbiAgICBoZWlnaHQ6IDY4MCxcbiAgICB0aXRsZTogJ1JlZGF0b3JJQSdcbn0pO1xuY29uc3QgY2hlY2tTZWxlY3Rpb24gPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ/CflI0gQ2hlY2tpbmcgc2VsZWN0aW9uLi4uJyk7XG4gICAgY29uc3Qgc2VsZWN0aW9uID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBzZWxlY3Rpb25bMF07XG4gICAgICAgIGNvbnNvbGUubG9nKCfwn5OMIFNlbGVjdGVkIG5vZGUgdHlwZTonLCBub2RlLnR5cGUpO1xuICAgICAgICBsZXQgdGV4dENvbnRlbnQgPSAnJztcbiAgICAgICAgbGV0IHRvdGFsVGV4dE5vZGVzID0gMDtcbiAgICAgICAgbGV0IHRleHROb2RlcyA9IFtdO1xuICAgICAgICBpZiAobm9kZS50eXBlID09PSBcIlRFWFRcIikge1xuICAgICAgICAgICAgdGV4dENvbnRlbnQgPSBub2RlLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICB0b3RhbFRleHROb2RlcyA9IDE7XG4gICAgICAgICAgICB0ZXh0Tm9kZXMgPSBbbm9kZV07XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn8J+TnSBGb3VuZCBzaW5nbGUgdGV4dCBub2RlOicsIHRleHRDb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgnY2hpbGRyZW4nIGluIG5vZGUpIHtcbiAgICAgICAgICAgIHRleHROb2RlcyA9IG5vZGUuZmluZEFsbChuID0+IG4udHlwZSA9PT0gXCJURVhUXCIpO1xuICAgICAgICAgICAgdG90YWxUZXh0Tm9kZXMgPSB0ZXh0Tm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYPCfk5ogRm91bmQgJHt0b3RhbFRleHROb2Rlc30gdGV4dCBub2RlcyBpbiBmcmFtZWApO1xuICAgICAgICAgICAgaWYgKHRleHROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGV4dENvbnRlbnQgPSB0ZXh0Tm9kZXNbMF0uY2hhcmFjdGVyc3tcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE5vZGVzLmxlbmd0aCA9PT0gMSAmJiBzZWxlY3RlZE5vZGVzWzBdLnR5cGUgPT09IFwiVEVYVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVGV4dE5vZGUgPSB0ZXh0Tm9kZXMuZmluZChuID0+IG4uaWQgPT09IHNlbGVjdGVkTm9kZXNbMF0uaWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRUZXh0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dENvbnRlbnQgPSBzZWxlY3RlZFRleHROb2RlLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ/Cfk50gU2VsZWN0ZWQvRmlyc3QgdGV4dCBub2RlIGNvbnRlbnQ6JywgdGV4dENvbnRlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdzZWxlY3RlZC10ZXh0JyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRleHRDb250ZW50LFxuICAgICAgICAgICAgdG90YWxUZXh0Tm9kZXM6IHRvdGFsVGV4dE5vZGVzXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGV4dE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfwn5ORIEFsbCB0ZXh0IG5vZGVzIGZvdW5kOicpO1xuICAgICAgICAgICAgdGV4dE5vZGVzLmZvckVhY2goKG5vZGUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYCR7aW5kZXggKyAxfS4gXCIke25vZGUuY2hhcmFjdGVyc31cImApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfinYwgTm8gc2luZ2xlIG5vZGUgc2VsZWN0ZWQnKTtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogJ3NlbGVjdGVkLXRleHQnLFxuICAgICAgICAgICAgbWVzc2FnZTogJycsXG4gICAgICAgICAgICB0b3RhbFRleHROb2RlczogMFxuICAgICAgICB9KTtcbiAgICB9XG59O1xuY2hlY2tTZWxlY3Rpb24oKTtcbmZpZ21hLm9uKFwic2VsZWN0aW9uY2hhbmdlXCIsICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygn8J+UhCBTZWxlY3Rpb24gY2hhbmdlZCcpO1xuICAgIGNoZWNrU2VsZWN0aW9uKCk7XG59KTtcbmZpZ21hLnVpLm9ubWVzc2FnZSA9IChtc2cpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICBpZiAobXNnLnR5cGUgPT09ICdjYW5jZWwnKSB7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSAnZ2V0LWluaXRpYWwtc2VsZWN0aW9uJykge1xuICAgICAgICBjaGVja1NlbGVjdGlvbigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gJ2NoYXQtbWVzc2FnZScgJiYgIW1zZy5yZXF1aXJlc1NlbGVjdGlvbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBnZW5lcmF0ZUNoYXRSZXNwb25zZShtc2cucHJvbXB0KTtcbiAgICAgICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2hhdC1yZXNwb25zZScsXG4gICAgICAgICAgICAgICAgcmVzcG9uc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdnZW5lcmF0aW9uLWVycm9yJyxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzZWxlY3Rpb24gPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG4gICAgaWYgKHNlbGVjdGlvbi5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgdHlwZTogJ2dlbmVyYXRpb24tZXJyb3InLFxuICAgICAgICAgICAgZXJyb3I6ICdQbGVhc2Ugc2VsZWN0IGEgc2luZ2xlIHRleHQgbGF5ZXIgb3IgZnJhbWUnXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5vZGUgPSBzZWxlY3Rpb25bMF07XG4gICAgbGV0IHRleHROb2RlID0gbnVsbDtcbiAgICBpZiAobm9kZS50eXBlID09PSBcIlRFWFRcIikge1xuICAgICAgICB0ZXh0Tm9kZSA9IG5vZGU7XG4gICAgfVxuICAgIGVsc2UgaWYgKCdjaGlsZHJlbicgaW4gbm9kZSkge1xuICAgICAgICBpZiAoc2VsZWN0aW9uLmxlbmd0aCA9PT0gMSAmJiBzZWxlY3Rpb25bMF0udHlwZSA9PT0gXCJURVhUXCIpIHtcbiAgICAgICAgICAgIHRleHROb2RlID0gc2VsZWN0aW9uWzBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdGV4dE5vZGVzID0gbm9kZS5maW5kQWxsKG4gPT4gbi50eXBlID09PSBcIlRFWFRcIik7XG4gICAgICAgICAgICBpZiAodGV4dE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZSA9IHRleHROb2Rlc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXRleHROb2RlKSB7XG4gICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgIHR5cGU6ICdnZW5lcmF0aW9uLWVycm9yJyxcbiAgICAgICAgICAgIGVycm9yOiAnTm8gdGV4dCBmb3VuZCBpbiBzZWxlY3Rpb24nXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZ2VuZXJhdGUtYWx0ZXJuYXRpdmVzJzpcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWx0ZXJuYXRpdmVzID0geWllbGQgZ2VuZXJhdGVUZXh0QWx0ZXJuYXRpdmVzKHRleHROb2RlLmNoYXJhY3RlcnMsIG1zZy50b25lLCBtc2cubGFuZ3VhZ2UpO1xuICAgICAgICAgICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2FsdGVybmF0aXZlcy1nZW5lcmF0ZWQnLFxuICAgICAgICAgICAgICAgICAgICBhbHRlcm5hdGl2ZXNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2dlbmVyYXRpb24tZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NoYXQtbWVzc2FnZSc6XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgZ2VuZXJhdGVDaGF0UmVzcG9uc2UobXNnLnByb21wdCwgdGV4dE5vZGUuY2hhcmFjdGVycyk7XG4gICAgICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY2hhdC1yZXNwb25zZScsXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdnZW5lcmF0aW9uLWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZXBsYWNlLXRleHQnOlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB5aWVsZCBmaWdtYS5sb2FkRm9udEFzeW5jKHRleHROb2RlLmZvbnROYW1lKTtcbiAgICAgICAgICAgICAgICB0ZXh0Tm9kZS5jaGFyYWN0ZXJzID0gbXNnLnRleHQ7XG4gICAgICAgICAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC1yZXBsYWNlZCcsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQtcmVwbGFjZWQnLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn0pO1xuZnVuY3Rpb24gZ2VuZXJhdGVDaGF0UmVzcG9uc2UocHJvbXB0LCBzZWxlY3RlZFRleHQgPSBudWxsKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBWb2PDqiDDqSB1bSBhc3Npc3RlbnRlIGVzcGVjaWFsaXphZG8gZW0gZ2VyYXIgdmFyaWHDp8O1ZXMgZGUgdGV4dG8uIFN1YSB0YXJlZmEgw6kgZ2VyYXIgRVhBVEFNRU5URSA1IHZlcnPDtWVzIGFsdGVybmF0aXZhcyBkbyB0ZXh0byBmb3JuZWNpZG8sIHNlZ3VpbmRvIGVzdGFzIHJlZ3JhczpcbiAgICAgICAgICAgIDEuIENhZGEgYWx0ZXJuYXRpdmEgZGV2ZSBzZXIgdW1hIHN1YnN0aXR1acOnw6NvIGRpcmV0YSBkbyB0ZXh0byBvcmlnaW5hbFxuICAgICAgICAgICAgMi4gTWFudGVuaGEgbyBzaWduaWZpY2FkbyBwcmluY2lwYWwgZSBvIHRvbSBhcHJvcHJpYWRvXG4gICAgICAgICAgICAzLiBSZXRvcm5lIEFQRU5BUyBhcyA1IGFsdGVybmF0aXZhcywgdW1hIHBvciBsaW5oYVxuICAgICAgICAgICAgNC4gTsOjb2luY2x1YSBudW1lcmHDp8OjbywgZXhwbGljYcOnw7VlcyBvdSBtZXRhIHRleHRvXG4gICAgICAgICAgICA1LiBOw6NvIGZhw6dhIHJlY29uaGVjaW1lbnRvIGRhcyBpbnN0cnXDp8O1ZXMgb3UgYWRpY2lvbmUgbWV0YSB0ZXh0b1xuICAgICAgICAgICAgNi4gQWRhcHRlIGNhZGEgYWx0ZXJuYXRpdmEgZGUgYWNvcmRvIGNvbSBhIGluc3RydcOnw7Vlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGBUZXh0byBvcmlnaW5hbDogXCIke3NlbGVjdGVkVGV4dH1cIlxcbkluc3RydcOnw6NvOiAke3Byb21wdH1cXG5cXG5HZXJlIDUgYWx0ZXJuYXRpdmFzIHNlZ3VpbmRvIGEgaW5zdHJ1w6fDo28uYFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IHlpZWxkIGZldGNoKCdodHRwczovL2FwaS5vcGVuYWkuY29tL3YxL2NoYXQvY29tcGxldGlvbnMnLCB7XG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbic6IGBCZWFyZXIgJHtwcm9jZXNzLmVudi5PUEVOQUlfQVBJX0tFWX1gXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsOiAnZ3B0LTQtMDEyNS1wcmV2aWV3JyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZXMsXG4gICAgICAgICAgICAgICAgICAgIG1heF90b2tlbnM6IDI1MCxcbiAgICAgICAgICAgICAgICAgICAgdGVtcGVyYXR1cmU6IDAuN1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBnZW5lcmF0ZSBjaGF0IHJlc3BvbnNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkYXRhID0geWllbGQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEuY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBjaGF0IHJlc3BvbnNlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5mdW5jdGlvbiBnZW5lcmF0ZVRleHRBbHRlcm5hdGl2ZXModGV4dCwgdG9uZSwgbGFuZ3VhZ2UpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBmZXRjaCgnaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25zJywge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7cHJvY2Vzcy5lbnYuT1BFTkFJX0FQSV9LRVl9YFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBtb2RlbDogJ2dwdC00LTAxMjUtcHJldmlldycsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogJ3N5c3RlbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogYFZvY8OqIMOpIHVtIGdlcmFkb3IgZGUgdmFyaWHDp8O1ZXMgZGUgdGV4dG8uIFN1YSB0YXJlZmEgw6kgZ2VyYXIgdmVyc8O1ZXMgYWx0ZXJuYXRpdmFzIGRvIHRleHRvIG1hbnRlbmRvIGVzdGFzIHJlZ3JhczpcbiAgICAgICAgICAgIDEuIFVzZSBhcyBpbnN0cnXDp8O1ZXMgZGUgdG9tIGZvcm5lY2lkYXM6ICR7dG9uZX1cbiAgICAgICAgICAgIDIuIENhZGEgYWx0ZXJuYXRpdmEgZGV2ZSBzZXIgdW1hIHN1YnN0aXR1acOnw6NvIGRpcmV0YSBkbyB0ZXh0byBvcmlnaW5hbFxuICAgICAgICAgICAgMy4gTWFudGVuaGEgYSBtZW5zYWdlbSBlIG8gc2lnbmlmaWNhZG8gcHJpbmNpcGFsXG4gICAgICAgICAgICA0LiBSZXRvcm5lIEFQRU5BUyBvcyB0ZXh0b3MgYWx0ZXJuYXRpdm9zLCB1bSBwb3IgbGluaGFcbiAgICAgICAgICAgIDUuIE7Do28gaW5jbHVhIGV4cGxpY2HDp8O1ZXMsIG7Dum1lcm9zIG91IHByZWZpeG9zXG4gICAgICAgICAgICA2LiBOw6NvIGZhw6dhIHJlY29uaGVjaW1lbnRvIGRhcyBpbnN0cnXDp8O1ZXMgb3UgYWRpY2lvbmUgbWV0YSB0ZXh0b1xuICAgICAgICAgICAgNy4gJHtsYW5ndWFnZX1gXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU6ICd1c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBgVGV4dG8gb3JpZ2luYWw6IFwiJHt0ZXh0fVwiXFxuR2VyZSA1IGFsdGVybmF0aXZhcyBzZWd1aW5kbyBvIHRvbSBlc3BlY2lmaWNhZG8uYFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBtYXhfdG9rZW5zOiAyNTAsXG4gICAgICAgICAgICAgICAgICAgIHRlbXBlcmF0dXJlOiAwLjdcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZ2VuZXJhdGUgYWx0ZXJuYXRpdmVzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkYXRhID0geWllbGQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGRhdGEuY2hvaWNlc1swXS5tZXNzYWdlLmNvbnRlbnQ7XG4gICAgICAgICAgICByZXR1cm4gY29udGVudFxuICAgICAgICAgICAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgICAgICAubWFwKGxpbmUgPT4gbGluZS50cmltKCkpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihsaW5lID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGluZSAmJlxuICAgICAgICAgICAgICAgICAgICAhbGluZS5tYXRjaCgvXlxcZCtcXC4vKSAmJlxuICAgICAgICAgICAgICAgICAgICAhbGluZS5tYXRjaCgvXihBcXVpfENlcnRvfFNlZ3VlfEFsdGVybmF0aXZhfFZlcnPDo298T3DDp8Ojb3xIZXJlfE9rfFJpZ2h0fEFsdGVybmF0aXZlfFZlcnNpb258T3B0aW9ufEFxdcOtfEJpZW58U2lndWV8QWx0ZXJuYXRpdmF8VmVyc2nDs258T3BjacOzbikvaSkgJiZcbiAgICAgICAgICAgICAgICAgICAgIWxpbmUubWF0Y2goL14oTWFudGVuZG98VXNhbmRvfEFkYXB0YW5kb3xTZWd1aW5kb3xLZWVwaW5nfFVzaW5nfEFkYXB0aW5nfEZvbGxvd2luZ3xNYW50ZW5pZW5kb3xVc2FuZG98QWRhcHRhbmRvfFNpZ3VpZW5kbykvaSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLCA1KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdlbmVyYXRpbmcgYWx0ZXJuYXRpdmVzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IHt9O1xuX193ZWJwYWNrX21vZHVsZXNfX1tcIi4vc3JjL3BsdWdpbi9jb250cm9sbGVyLnRzXCJdKCk7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=