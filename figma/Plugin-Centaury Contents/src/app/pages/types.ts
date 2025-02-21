import { InfoCardItem } from '../../shared/components/InfoCard/InfoCard';

// Base props compartilhadas
export interface BaseInfoCardProps {
  data?: InfoCardItem[];
  className?: string;
  descriptionItemCount?: number;
}

// Tipos para o ScheduleCard
export type ScheduleFieldType = 'date' | 'time' | 'timezone' | 'duration';

export interface ScheduleCardProps extends BaseInfoCardProps {
  onSelect?: (type: ScheduleFieldType, value: string) => void;
}

// Tipos para o PricingCard
export type PricingFieldType = 'price' | 'currency' | 'installments' | 'method';

export interface PricingCardProps extends BaseInfoCardProps {
  onSelect?: (type: PricingFieldType, value: string) => void;
}

// Tipos para o DemoCard
export type DemoFieldType = 'lorem' | 'placeholder';

export interface DemoCardProps extends BaseInfoCardProps {
  onSelect?: (type: DemoFieldType, value: string) => void;
}

// Tipos para o ProfileCard
export type ProfileFieldType = 'name' | 'email' | 'phone' | 'address';

export interface ProfileCardProps extends BaseInfoCardProps {
  onSelect?: (type: ProfileFieldType, value: string) => void;
}

// Tipos para o ContactCard
export type ContactFieldType = 'name' | 'email' | 'phone' | 'company';

export interface ContactCardProps extends BaseInfoCardProps {
  onSelect?: (type: ContactFieldType, value: string) => void;
}

// Interfaces de dados
export interface UserData {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface ScheduleData {
  dates?: string[];
  times?: string[];
  weekDays?: string[];
}

export interface PricingData {
  highValues?: string[];
  mediumValues?: string[];
  lowValues?: string[];
  creditCards?: string[];
  installments?: string[];
  security?: string[];
}

export interface DemoData {
  loremItems?: string[];
  placeholderItems?: string[];
} 