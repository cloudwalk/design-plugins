import React from 'react';

export interface InfoCardItem {
  /** Icon component to display */
  icon: React.ReactNode;
  /** Title of the card */
  title: string;
  /** Description or subtitle */
  description: string;
  /** Optional value to display */
  value?: string;
  /** Optional items array for plugin interaction */
  items?: string[];
  /** Optional click handler */
  onClick?: () => void;
}

export interface InfoCardProps {
  /** Array of items to display */
  data: InfoCardItem[];
  /** Optional className for container */
  className?: string;
  /** Whether to show dividers between items */
  showDividers?: boolean;
  /** Whether to enable hover effect */
  enableHover?: boolean;
  /** Optional click handler for each item */
  onItemClick?: (item: InfoCardItem) => void;
}

/**
 * InfoCard component for displaying consistent information cards
 * Used across different pages in the application
 */
export const InfoCard: React.FC<InfoCardProps> = ({
  data,
  className = '',
  showDividers = true,
  enableHover = true,
  onItemClick
}) => {
  const handleClick = (item: InfoCardItem) => {
    if (item.items) {
      parent.postMessage(
        { pluginMessage: { type: 'update-multiple-texts', items: item.items } },
        '*'
      );
    }
    
    if (item.onClick) {
      item.onClick();
    }

    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className={`flex flex-col w-full bg-[#0F0F0F] overflow-y-auto flex-1 items-start ${className}`}>
      <div className={`w-full ${showDividers ? 'divide-y divide-[#323232]' : ''}`}>
        {data.map((item, index) => (
          <div
            key={index}
            className={`
              flex items-center gap-4 py-4 px-6
              ${enableHover ? 'cursor-pointer hover:bg-[#323232] transition-colors' : ''}
            `}
            onClick={() => handleClick(item)}
          >
            <div className="w-10 h-10 flex items-center justify-center bg-[#616161] rounded-full shrink-0">
              <div className="text-[#F5F5F5] w-6 h-6">{item.icon}</div>
            </div>
            <div className="flex flex-col gap-1 max-w-[271px] overflow-hidden">
              <div className="text-[#F5F5F5] text-base leading-[21.9px] font-medium font-cera-pro truncate">
                {item.title}
              </div>
              <div className="text-[#C7C7C7] text-[14px] leading-[19.2px] font-normal font-cera-pro truncate">
                {item.description}
              </div>
              {item.value && (
                <div className="text-[#F5F5F5] text-sm font-medium">
                  {item.value}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 