import React, { FunctionComponent, useMemo } from 'react';
import { Calendar, Currency, CreditCard, Lock } from '../../shared/components/icons';
import { InfoCard, InfoCardItem } from '../../shared/components/InfoCard/InfoCard';
import { PricingCardProps, PricingFieldType } from './types';
import { FIELD_TITLES, DEFAULT_DESCRIPTION_ITEM_COUNT } from './constants';

/**
 * Configuração dos campos de preços
 * @private
 */
const PRICING_FIELDS: Array<{
  type: PricingFieldType;
  icon: JSX.Element;
  title: string;
  dataKey: keyof typeof DEMO_PRICING;
  description: string;
}> = [
  { 
    type: 'method',
    icon: <CreditCard />,
    title: 'Tipo',
    description: 'Link de Pagamento, InfiniteTap, Pix, Boleto, Crédito, Débito',
    dataKey: 'paymentTypes'
  },
  { 
    type: 'price',
    icon: <Currency />,
    title: 'High Value',
    description: 'R$ 42.000,00 - R$ 100.000,00',
    dataKey: 'highValues'
  },
  { 
    type: 'price',
    icon: <Currency />,
    title: 'Medium Value',
    description: 'R$ 1.000,00 - R$ 10.000,00',
    dataKey: 'mediumValues'
  },
  { 
    type: 'price',
    icon: <Currency />,
    title: 'Low Value',
    description: 'R$ 10,00 - R$ 1.000,00',
    dataKey: 'lowValues'
  },
  { 
    type: 'installments',
    icon: <Calendar />,
    title: 'Installments',
    description: '1x, 2x, 3x, 4x, 5x, 6x',
    dataKey: 'installments'
  }
];

/**
 * Dados de exemplo para demonstração
 * @private
 */
const DEMO_PRICING = {
  paymentTypes: [
    'Link de Pagamento',
    'InfiniteTap',
    'Pix',
    'Boleto',
    'Crédito',
    'Débito',
    'Transferência',
    'Dinheiro'
  ],
  highValues: [
    'R$ 42.000,00',
    'R$ 42.420,00',
    'R$ 54.200,00',
    'R$ 62.000,00',
    'R$ 72.000,00',
    'R$ 82.000,00',
    'R$ 92.000,00',
    'R$ 100.000,00'
  ],
  mediumValues: [
    'R$ 1.000,00',
    'R$ 2.000,00',
    'R$ 3.000,00',
    'R$ 4.000,00',
    'R$ 5.000,00',
    'R$ 6.000,00',
    'R$ 7.000,00',
    'R$ 8.000,00'
  ],
  lowValues: [
    'R$ 10,00',
    'R$ 20,00',
    'R$ 50,00',
    'R$ 100,00',
    'R$ 200,00',
    'R$ 500,00',
    'R$ 750,00',
    'R$ 1.000,00'
  ],
  installments: [
    '1x',
    '2x',
    '3x',
    '4x',
    '5x',
    '6x',
    '7x',
    '8x',
    '9x',
    '10x',
    '11x',
    '12x'
  ]
};

/**
 * Card de Preços e Pagamentos
 * 
 * Exibe opções de pagamento em cards organizados, com suporte para:
 * - Faixas de valor (alto, médio, baixo)
 * - Métodos de pagamento (cartões)
 * - Opções de parcelamento
 * - Recursos de segurança
 * 
 * @example Uso básico - apenas exibição
 * ```tsx
 * <PricingCard />
 * ```
 * 
 * @example Com callback de seleção
 * ```tsx
 * <PricingCard 
 *   onSelect={(type, value) => {
 *     if (type === 'method') setupPayment(value);
 *     if (type === 'installments') calculateInstallments(value);
 *   }}
 * />
 * ```
 * 
 * @example Com dados customizados
 * ```tsx
 * <PricingCard 
 *   data={[
 *     { 
 *       icon: <Currency />,
 *       title: 'Planos Premium',
 *       description: 'Opções especiais',
 *       items: ['R$ 199,90/mês', 'R$ 999,90/ano']
 *     }
 *   ]}
 *   className="rounded-lg shadow-md"
 *   descriptionItemCount={2}
 * />
 * ```
 */
const PricingCard: FunctionComponent<PricingCardProps> = ({
  data,
  className,
  onSelect
}) => {
  // Gera os cards de informação com base na configuração dos campos
  const pricingData: InfoCardItem[] = useMemo(() => 
    PRICING_FIELDS.map(field => ({
      icon: field.icon,
      title: field.title,
      description: field.description,
      items: DEMO_PRICING[field.dataKey],
      onClick: () => onSelect?.(field.type, DEMO_PRICING[field.dataKey][0])
    }))
  , [onSelect]);

  return (
    <InfoCard 
      data={data || pricingData}
      className={className}
    />
  );
};

export default PricingCard; 