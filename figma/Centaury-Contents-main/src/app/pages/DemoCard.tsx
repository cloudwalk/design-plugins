import React, { FunctionComponent, useMemo } from 'react';
import { CreditCard, Calendar, Document, Phone } from '../../shared/components/icons';
import { InfoCard, InfoCardItem } from '../../shared/components/InfoCard/InfoCard';
import { DemoCardProps, DemoFieldType } from './types';
import { FIELD_TITLES, DEFAULT_DESCRIPTIONS, DEFAULT_DESCRIPTION_ITEM_COUNT } from './constants';

/**
 * Configuração dos campos de demonstração
 * @private
 */
const DEMO_FIELDS: Array<{
  type: DemoFieldType;
  icon: JSX.Element;
  title: string;
  description: string;
  dataKey: keyof typeof DEMO_DATA;
}> = [
  { 
    type: 'placeholder',
    icon: <Phone />,
    title: 'Telefone',
    description: '(11)12345-1234',
    dataKey: 'phones'
  },
  { 
    type: 'placeholder',
    icon: <Calendar />,
    title: 'Data',
    description: '12 Jan, 2024, 15 Fev, 2024',
    dataKey: 'dates'
  },
  { 
    type: 'placeholder',
    icon: <Document />,
    title: 'Documento',
    description: 'CPF, CNPJ, RG',
    dataKey: 'documents'
  }
];

/**
 * Dados de exemplo para demonstração
 * @private
 */
const DEMO_DATA = {
  phones: [
    '(11)12345-1234',
    '(11)23456-2345',
    '(11)34567-3456',
    '(11)45678-4567',
    '(11)56789-5678',
    '(11)67890-6789'
  ],
  dates: [
    '12 Jan, 2024',
    '15 Fev, 2024',
    '20 Mar, 2024',
    '25 Abr, 2024',
    '30 Mai, 2024',
    '05 Jun, 2024',
    '10 Jul, 2024',
    '15 Ago, 2024'
  ],
  documents: [
    'CPF',
    'CNPJ',
    'RG',
    'CNH',
    'Passaporte',
    'Título de Eleitor'
  ]
};

/**
 * Card de Demonstração
 * 
 * Exibe textos de exemplo em cards organizados, útil para:
 * - Parcelas
 * - Datas
 * - Documentos
 * 
 * @example Uso básico - apenas exibição
 * ```tsx
 * <DemoCard />
 * ```
 * 
 * @example Com callback de seleção
 * ```tsx
 * <DemoCard 
 *   onSelect={(type, value) => {
 *     if (type === 'placeholder') copyToClipboard(value);
 *   }}
 * />
 * ```
 * 
 * @example Com dados customizados
 * ```tsx
 * <DemoCard 
 *   data={[
 *     { 
 *       icon: <Document />,
 *       title: 'Documentos',
 *       description: 'Lista de documentos',
 *       items: ['CPF', 'RG', 'CNH']
 *     }
 *   ]}
 *   className="rounded-lg shadow-md"
 * />
 * ```
 */
const DemoCard: FunctionComponent<DemoCardProps> = ({
  data,
  className,
  onSelect
}) => {
  // Gera os cards de informação com base na configuração dos campos
  const demoData: InfoCardItem[] = useMemo(() => 
    DEMO_FIELDS.map(field => ({
      icon: field.icon,
      title: field.title,
      description: field.description,
      items: DEMO_DATA[field.dataKey],
      onClick: () => onSelect?.(field.type, DEMO_DATA[field.dataKey][0])
    }))
  , [onSelect]);

  return (
    <InfoCard 
      data={data || demoData}
      className={className}
    />
  );
};

export default DemoCard; 