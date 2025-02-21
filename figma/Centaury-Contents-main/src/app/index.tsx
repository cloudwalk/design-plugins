import React from "react";
import { createRoot } from 'react-dom/client';
import '@shared/styles/theme.css';
import App from './components/App';

// Ensure the DOM is fully loaded before rendering
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('react-page');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error('Failed to find the root element');
  }
});
