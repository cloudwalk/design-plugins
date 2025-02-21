import React, { FunctionComponent, useState } from 'react';
import { Chip, ChipContainer } from '../../shared/components/Chip';
import '@shared/styles/theme.css';
import { 
  ScheduleCard,
  PricingCard,
  DemoCard,
  ProfileCard,
  ContactCard 
} from '../pages';

type TabType = 'profile' | 'contact' | 'pricing' | 'schedule' | 'placeholder';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'contact', label: 'Contact' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'placeholder', label: 'Placeholder' }
] as const;

const App: FunctionComponent = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('profile');

  return (
    <div 
      className="min-h-screen bg-background-primary"
      data-semantic-colors-mode="dark-infinitepay"
      data-primitive-tokens-mode="infinite-pay"
    >
      <div className="w-[375px] mx-auto flex flex-col h-screen overflow-hidden">
        <header className="bg-background-primary sticky top-0 z-10">
          <ChipContainer>
            {TABS.map((tab) => (
              <Chip
                key={tab.id}
                label={tab.label}
                isSelected={selectedTab === tab.id}
                onClick={() => setSelectedTab(tab.id as TabType)}
              />
            ))}
          </ChipContainer>
        </header>
        {selectedTab === 'profile' && <ProfileCard />}
        {selectedTab === 'contact' && <ContactCard />}
        {selectedTab === 'pricing' && <PricingCard />}
        {selectedTab === 'schedule' && <ScheduleCard />}
        {selectedTab === 'placeholder' && <DemoCard />}
      </div>
    </div>
  );
};

export default App;
