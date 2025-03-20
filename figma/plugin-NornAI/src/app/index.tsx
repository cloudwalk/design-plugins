import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './styles/theme.css';
import './styles/inferno-theme.css';

// Create a basic theme context
const ThemeContext = React.createContext({ theme: 'dark' });

// Ensure the DOM is fully loaded before rendering
const initializeApp = () => {
  console.log('🎨 Initializing React app...');
  const container = document.getElementById('react-page');
  
  if (!container) {
    console.error('❌ Failed to find the root element #react-page');
    return;
  }

  try {
    console.log('🌱 Creating React root...');
    const root = createRoot(container);
    
    console.log('🎭 Rendering app...');
    root.render(
      <ThemeContext.Provider value={{ theme: 'dark' }}>
        <App />
      </ThemeContext.Provider>
    );
    
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering React app:', error);
  }
};

// Try to initialize immediately if the DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
