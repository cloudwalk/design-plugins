# Customização de Tom de Voz

Este plugin permite customizar os tons de voz utilizados nas sugestões de texto através de um arquivo de configuração externo.

## Como configurar seu tom de voz personalizado

1. Duplique o arquivo `src/app/toneDefinitions.example.json` e renomeie para `src/app/toneDefinitions.json`
2. Edite o arquivo `toneDefinitions.json` com suas definições específicas de tom de voz
3. O arquivo `toneDefinitions.json` está no `.gitignore` e não será incluído no repositório público

## Estrutura do arquivo de definições

O arquivo de definições JSON contém três seções principais:

### toneOptions

Contém os tons de voz disponíveis para cada idioma. Estrutura:

```json
{
  "toneOptions": {
    "CÓDIGO-DO-IDIOMA": {
      "IDENTIFICADOR-DO-TOM": {
        "label": "Nome exibido na interface",
        "instructions": "Instruções detalhadas para o modelo de linguagem sobre como aplicar este tom"
      },
      // outros tons...
    },
    // outros idiomas...
  }
}
```

### suggestionOptions

Contém sugestões rápidas de reformulação para cada idioma:

```json
{
  "suggestionOptions": {
    "CÓDIGO-DO-IDIOMA": {
      "IDENTIFICADOR-DA-SUGESTÃO": {
        "label": "Nome exibido na interface",
        "instructions": "Instruções detalhadas para o modelo de linguagem sobre como reformular o texto"
      },
      // outras sugestões...
    },
    // outros idiomas...
  }
}
```

### languageOptions

Contém configurações para cada idioma suportado:

```json
{
  "languageOptions": {
    "CÓDIGO-DO-IDIOMA": {
      "label": "Nome do idioma",
      "icon": "Emoji ou ícone para o idioma",
      "instructions": "Instruções para o modelo de linguagem sobre como usar este idioma",
      "interface": {
        "title": "Título da aplicação",
        "toneLabel": "Rótulo para a seção de tom de voz",
        "suggestionsTitle": "Título para a seção de sugestões"
        // outros textos da interface...
      }
    },
    // outros idiomas...
  }
}
```

## Exemplo

Veja o arquivo `src/app/toneDefinitions.example.json` para um exemplo completo de como estruturar seu arquivo de definições personalizado. 