# 🌿 Centaury Contents

<div align="center">
  
  <img src="assets/logo-reduzida.png" alt="Centaury Contents Logo" width="200"/>

  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
  [![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-orange.svg)](https://www.figma.com/community/plugin/centaury-contents)
  [![Made with React](https://img.shields.io/badge/Made%20with-React-blue.svg)](https://reactjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)

  *Transform your Figma content management with elegance and efficiency*
</div>

## 🎯 Overview

Centaury Contents is an innovative open-source Figma plugin that revolutionizes how designers and developers manage content in their design systems. Built with modern web technologies and focusing on user experience, it provides a seamless interface for handling various types of content, from personal information to payment details.

## 🎬 Demo

<div align="center">
  <img src="assets/demo.gif" alt="Centaury Contents Demo" />
  
  > 📺 [Assista ao vídeo completo da demonstração](https://drive.google.com/file/d/1_wl5ZbCnhLut4YhBrNj6VplaKkm7XfHU/view?usp=sharing)
</div>

**Nota**: O vídeo completo da demonstração está disponível no Google Drive. Para desenvolvedores, você pode baixar o vídeo e colocá-lo na pasta `assets` com o nome `demo.mov` para testes locais.

## ✨ Key Features

### 📝 Content Management
- **Multiple Content Types**
  - Personal Information (names, emails, documents)
  - Payment Methods (credit card, PIX, bank transfer)
  - Scheduling (dates, times, weekdays)
  - Contact Details (phone, address)
  - Placeholder Content

### 🎨 Smart Formatting
- **Dates**: "12 Jan, 2024"
- **Phone Numbers**: "(11)12345-1234"
- **Week Days**: "Segunda, Terça, Quarta..."
- **Payment Info**: "Link de Pagamento, InfiniteTap, Pix..."

### 💻 Technical Features
- Modern React + TypeScript architecture
- Dark mode support
- Responsive design
- Real-time content updates

## 🚀 Getting Started

### For Users

1. **Install the Plugin**
   - Open Figma Desktop
   - Go to Menu > Plugins > Browse Plugins
   - Search for "Centaury Contents"
   - Click "Install"

2. **Using the Plugin**
   - Select any text layer in your design
   - Right-click > Plugins > Centaury Contents
   - Choose your content type
   - Apply changes

### For Developers

1. **Prerequisites**
   - Node.js (v14 or higher)
   - npm
   - Figma Desktop App

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/your-username/centaury-contents.git
   cd centaury-contents

   # Install dependencies
   npm install

   # Start development build
   npm run dev
   ```

3. **Development**
   ```bash
   # Build for production
   npm run build
   ```

## 🔧 Project Structure

```
src/
├── app/                 # Core application
│   ├── components/      # React components
│   ├── pages/          # Plugin pages
│   └── index.tsx       # Entry point
├── shared/             # Shared resources
│   ├── components/     # Reusable components
│   ├── design-system/  # Design tokens & styles
│   └── styles/         # Global styles
└── plugin/             # Figma plugin code
```

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build**: Webpack
- **Plugin**: Figma Plugin API

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <img src="assets/logo-reduzida.png" alt="Centaury Contents Logo" width="100"/>
  
  ### Made with ❤️ by the community

  [Report Bug](https://github.com/your-username/centaury-contents/issues) · [Request Feature](https://github.com/your-username/centaury-contents/issues)
</div> 