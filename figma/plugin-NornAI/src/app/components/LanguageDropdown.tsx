import React, { useState } from 'react';

interface LanguageOption {
  label: string;
  icon: string;
  instructions: string;
  interface: any;
}

interface LanguageDropdownProps {
  options: Record<string, LanguageOption>;
  value: string;
  onChange: (value: string) => void;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options[value];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="language-dropdown"
      >
        <span className="icon">{selectedOption.icon}</span>
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-surface-primary border border-border-primary rounded-lg shadow-lg overflow-hidden z-50">
          {Object.entries(options).map(([key, option]) => (
            <button
              key={key}
              onClick={() => {
                onChange(key);
                setIsOpen(false);
              }}
              className={`language-dropdown w-full text-left ${
                key === value ? 'bg-hover-bg' : ''
              }`}
            >
              <span className="icon">{option.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 