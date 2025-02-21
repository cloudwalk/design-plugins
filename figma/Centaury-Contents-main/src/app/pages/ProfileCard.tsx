import React, { FunctionComponent, useMemo } from 'react';
import { User, Email, Phone, Document, Building } from '../../shared/components/icons';
import { InfoCard, InfoCardItem } from '../../shared/components/InfoCard/InfoCard';
import { ProfileCardProps, ProfileFieldType } from './types';
import { FIELD_TITLES } from './constants';

/**
 * Configuração dos campos do perfil
 * @private
 */
const PROFILE_FIELDS: Array<{
  type: ProfileFieldType;
  icon: JSX.Element;
  title: string;
  dataKey: keyof typeof DEMO_PROFILE;
}> = [
  {
    type: 'name',
    icon: <User />,
    title: 'Name',
    dataKey: 'name'
  },
  {
    type: 'name',
    icon: <Document />,
    title: 'Infinitetag',
    dataKey: 'username'
  },
  {
    type: 'email',
    icon: <Email />,
    title: 'Email',
    dataKey: 'email'
  },
  {
    type: 'phone',
    icon: <Phone />,
    title: 'Phone',
    dataKey: 'phone'
  },
  {
    type: 'name',
    icon: <Document />,
    title: 'CPF',
    dataKey: 'cpf'
  },
  {
    type: 'name',
    icon: <Document />,
    title: 'CNPJ',
    dataKey: 'cnpj'
  },
  {
    type: 'address',
    icon: <Building />,
    title: 'Address',
    dataKey: 'address'
  },
  {
    type: 'address',
    icon: <Building />,
    title: 'City',
    dataKey: 'city'
  },
  {
    type: 'address',
    icon: <Building />,
    title: 'State',
    dataKey: 'state'
  },
  {
    type: 'address',
    icon: <Building />,
    title: 'ZIP Code',
    dataKey: 'zipcode'
  }
];

/**
 * Dados de exemplo para demonstração
 * @private
 */
const DEMO_PROFILE = {
  name: 'Claudia Walker',
  username: '@claudiawalker',
  email: 'claudiawalker@cloudwalk.io',
  phone: '(11) 98765-4321',
  cpf: '123.456.789-00',
  cnpj: '12.345.678/0001-99',
  address: 'Avenida Paulista, 1000, Bloco B, Apartamento 203',
  city: 'São Paulo',
  state: 'São Paulo',
  zipcode: '01310-100'
};

/**
 * Card de Perfil
 * 
 * Exibe informações de perfil do usuário em um card organizado, incluindo:
 * - Nome completo
 * - Email
 * - Telefone
 * - Endereço
 * 
 * @example Uso básico - apenas exibição
 * ```tsx
 * <ProfileCard />
 * ```
 * 
 * @example Com callback de seleção
 * ```tsx
 * <ProfileCard 
 *   onSelect={(type, value) => {
 *     if (type === 'email') sendEmail(value);
 *     if (type === 'phone') makeCall(value);
 *   }}
 * />
 * ```
 * 
 * @example Com dados customizados
 * ```tsx
 * <ProfileCard 
 *   data={[
 *     { 
 *       icon: <User />,
 *       title: 'Nome',
 *       items: ['Claudia Walker']
 *     }
 *   ]}
 *   className="rounded-lg shadow-md"
 * />
 * ```
 */
const ProfileCard: FunctionComponent<ProfileCardProps> = ({
  data,
  className,
  onSelect
}) => {
  // Gera os cards de informação com base na configuração dos campos
  const profileData: InfoCardItem[] = useMemo(() => 
    PROFILE_FIELDS.map(field => ({
      icon: field.icon,
      title: field.title,
      description: DEMO_PROFILE[field.dataKey],
      items: [DEMO_PROFILE[field.dataKey]],
      onClick: () => onSelect?.(field.type, DEMO_PROFILE[field.dataKey])
    }))
  , [onSelect]);

  return (
    <InfoCard 
      data={data || profileData}
      className={className}
    />
  );
};

export default ProfileCard;
