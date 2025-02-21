/**
 * Títulos dos campos
 */
export const FIELD_TITLES = {
  // Campos comuns
  NAME: 'Nome',
  EMAIL: 'Email',
  PHONE: 'Telefone',
  ADDRESS: 'Endereço',
  COMPANY: 'Empresa',

  // Campos de agendamento
  DATE: 'Data',
  TIME: 'Horário',
  TIMEZONE: 'Fuso Horário',
  DURATION: 'Duração',

  // Campos de preço
  PRICE: 'Preço',
  CURRENCY: 'Moeda',
  INSTALLMENTS: 'Parcelas',
  METHOD: 'Forma de Pagamento',

  // Campos de demonstração
  LOREM: 'Lorem Ipsum',
  PLACEHOLDER: 'Texto de Exemplo'
} as const;

/**
 * Descrições padrão
 */
export const DEFAULT_DESCRIPTIONS = {
  LOREM: 'Texto de exemplo em latim',
  PLACEHOLDER: 'Texto para demonstração'
} as const;

/**
 * Número padrão de itens a exibir na descrição
 */
export const DEFAULT_DESCRIPTION_ITEM_COUNT = 3;

// Configurações
export const DEFAULT_CURRENCY_FORMAT = 'BRL';
export const DEFAULT_CURRENCY_LOCALE = 'pt-BR';
export const DEFAULT_DATE_FORMAT = 'DD MMM, YYYY';
export const DEFAULT_TIME_FORMAT = 'HH:mm'; 