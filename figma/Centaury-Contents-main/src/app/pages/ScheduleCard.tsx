import React, { FunctionComponent, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Month, WeekDays } from '../../shared/components/icons';
import { InfoCard, InfoCardItem } from '../../shared/components/InfoCard/InfoCard';
import { ScheduleCardProps, ScheduleFieldType } from './types';
import { FIELD_TITLES, DEFAULT_DESCRIPTION_ITEM_COUNT } from './constants';

/**
 * Configuração dos campos de agendamento
 * @private
 */
const SCHEDULE_FIELDS: Array<{
  type: ScheduleFieldType;
  icon: JSX.Element;
  title: string;
  dataKey: keyof typeof DEMO_SCHEDULE;
  description: string;
}> = [
  { 
    type: 'date', 
    icon: <CalendarIcon />, 
    title: 'Data',
    description: '12 Jan, 2024, 15 Fev, 2024',
    dataKey: 'dates' 
  },
  { 
    type: 'time', 
    icon: <Clock />, 
    title: 'Horário',
    description: '10:10, 12:30, 14:45',
    dataKey: 'times' 
  },
  { 
    type: 'timezone', 
    icon: <Month />, 
    title: 'Mês',
    description: 'Jan, Fev, Mar',
    dataKey: 'months' 
  },
  { 
    type: 'duration', 
    icon: <WeekDays />, 
    title: 'Dias da Semana',
    description: 'Segunda-Feira, Terça-Feira, Quarta-Feira',
    dataKey: 'weekDays' 
  }
];

/**
 * Dados de exemplo para demonstração
 * @private
 */
const DEMO_SCHEDULE = {
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
  times: [
    '10:10',
    '12:30',
    '14:45',
    '16:20',
    '18:00',
    '09:15',
    '11:45',
    '15:30'
  ],
  months: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
  ],
  weekDays: [
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
    'Domingo'
  ]
};

/**
 * Card de Agendamento
 * 
 * Exibe opções de data e hora em cards organizados, com suporte para:
 * - Seleção de datas específicas
 * - Horários disponíveis
 * - Meses do ano
 * - Dias da semana
 * 
 * @example Uso básico - apenas exibição
 * ```tsx
 * <ScheduleCard />
 * ```
 * 
 * @example Com callback de seleção
 * ```tsx
 * <ScheduleCard 
 *   onSelect={(type, value) => {
 *     if (type === 'date') setSelectedDate(value);
 *     if (type === 'time') setSelectedTime(value);
 *   }}
 * />
 * ```
 * 
 * @example Com dados customizados
 * ```tsx
 * <ScheduleCard 
 *   data={[
 *     { 
 *       icon: <CalendarIcon />,
 *       title: 'Próximos Eventos',
 *       description: 'Datas disponíveis',
 *       items: ['01 Mar, 2024', '15 Mar, 2024', '30 Mar, 2024']
 *     }
 *   ]}
 *   className="rounded-lg shadow-md"
 *   descriptionItemCount={2}
 * />
 * ```
 */
const ScheduleCard: FunctionComponent<ScheduleCardProps> = ({
  data,
  className,
  onSelect
}) => {
  // Gera os cards de informação com base na configuração dos campos
  const scheduleData: InfoCardItem[] = useMemo(() => 
    SCHEDULE_FIELDS.map(field => ({
      icon: field.icon,
      title: field.title,
      description: field.description,
      items: DEMO_SCHEDULE[field.dataKey],
      onClick: () => onSelect?.(field.type, DEMO_SCHEDULE[field.dataKey][0])
    }))
  , [onSelect]);

  return (
    <InfoCard 
      data={data || scheduleData}
      className={className}
    />
  );
};

export default ScheduleCard; 