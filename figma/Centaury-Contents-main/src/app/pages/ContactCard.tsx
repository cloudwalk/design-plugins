import React, { FunctionComponent, useMemo } from 'react';
import { User, Email, Phone, Document, Building } from '../../shared/components/icons';
import { InfoCard, InfoCardItem } from '../../shared/components/InfoCard/InfoCard';
import { ContactCardProps, ContactFieldType } from './types';
import { FIELD_TITLES } from './constants';

/**
 * Configuração dos campos de contato
 * @private
 */
const CONTACT_FIELDS: Array<{
  type: ContactFieldType;
  icon: JSX.Element;
  title: string;
  dataKey: keyof typeof DEMO_CONTACT;
  description: string;
}> = [
  {
    type: 'name',
    icon: <User />,
    title: 'Name',
    description: 'Ana Maria, Andreia João, Andressa Matias',
    dataKey: 'names'
  },
  {
    type: 'email',
    icon: <Email />,
    title: 'Email',
    description: 'anamaria@email.com, andreiajoao@email.com',
    dataKey: 'emails'
  },
  {
    type: 'phone',
    icon: <Phone />,
    title: 'Phone',
    description: '(11) 98765-4321, (11) 97654-3210',
    dataKey: 'phones'
  },
  {
    type: 'name',
    icon: <Document />,
    title: 'CPF',
    description: '123.456.789-00, 234.567.890-11',
    dataKey: 'cpfs'
  },
  {
    type: 'name',
    icon: <Document />,
    title: 'CNPJ',
    description: '12.345.678/0001-99, 23.456.789/0001-88',
    dataKey: 'cnpjs'
  },
  {
    type: 'company',
    icon: <Building />,
    title: 'Address',
    description: 'Avenida Paulista, 1000, Bloco B, Apartamento 203',
    dataKey: 'addresses'
  },
  {
    type: 'company',
    icon: <Building />,
    title: 'City',
    description: 'São Paulo, Rio de Janeiro, Curitiba',
    dataKey: 'cities'
  },
  {
    type: 'company',
    icon: <Building />,
    title: 'State',
    description: 'São Paulo, Rio de Janeiro, Paraná',
    dataKey: 'states'
  },
  {
    type: 'company',
    icon: <Building />,
    title: 'ZIP Code',
    description: '01310-100, 04532-000, 80230-000',
    dataKey: 'ceps'
  }
];

/**
 * Dados de exemplo para demonstração
 * @private
 */
const DEMO_CONTACT = {
  names: [
    'Ana Maria',
    'Andreia João',
    'Andressa Matias',
    'Antonio Carlos',
    'Beatriz Silva',
    'Bruno Santos',
    'Carla Oliveira',
    'Carlos Eduardo',
    'Carolina Lima',
    'Daniel Souza'
  ],
  emails: [
    'anamaria@email.com',
    'andreiajoao@email.com',
    'andressamatias@email.com',
    'antoniocarlos@email.com',
    'beatrizsilva@email.com',
    'brunosantos@email.com',
    'carlaoliveira@email.com',
    'carloseduardo@email.com',
    'carolinalima@email.com',
    'danielsouza@email.com'
  ],
  phones: [
    '(11) 98765-4321',
    '(11) 97654-3210',
    '(11) 96543-2109',
    '(11) 95432-1098',
    '(11) 94321-0987',
    '(11) 93210-9876',
    '(11) 92109-8765',
    '(11) 91098-7654',
    '(11) 90987-6543',
    '(11) 89876-5432'
  ],
  cpfs: [
    '123.456.789-00',
    '234.567.890-11',
    '345.678.901-22',
    '456.789.012-33',
    '567.890.123-44',
    '678.901.234-55',
    '789.012.345-66',
    '890.123.456-77',
    '901.234.567-88',
    '012.345.678-99'
  ],
  cnpjs: [
    '12.345.678/0001-99',
    '23.456.789/0001-88',
    '34.567.890/0001-77',
    '45.678.901/0001-66',
    '56.789.012/0001-55',
    '67.890.123/0001-44',
    '78.901.234/0001-33',
    '89.012.345/0001-22',
    '90.123.456/0001-11',
    '01.234.567/0001-00'
  ],
  addresses: [
    'Avenida Paulista, 1000, Bloco B, Apartamento 203',
    'Rua Augusta, 500, Casa 2',
    'Alameda Santos, 800, Conjunto 45',
    'Rua Oscar Freire, 300, Sala 12',
    'Avenida Brigadeiro Faria Lima, 2000, 10º Andar',
    'Rua Haddock Lobo, 400, Casa 5',
    'Alameda Jaú, 600, Apartamento 501',
    'Rua Bela Cintra, 700, Conjunto 32',
    'Avenida Rebouças, 1500, Sala 45',
    'Rua Estados Unidos, 200, Casa 3'
  ],
  cities: [
    'São Paulo',
    'Rio de Janeiro',
    'Curitiba',
    'Belo Horizonte',
    'Porto Alegre',
    'Salvador',
    'Recife',
    'Brasília',
    'Fortaleza',
    'Manaus'
  ],
  states: [
    'São Paulo',
    'Rio de Janeiro',
    'Paraná',
    'Minas Gerais',
    'Rio Grande do Sul',
    'Bahia',
    'Pernambuco',
    'Distrito Federal',
    'Ceará',
    'Amazonas'
  ],
  ceps: [
    '01310-100',
    '04532-000',
    '80230-000',
    '30130-110',
    '90050-170',
    '40020-130',
    '50030-150',
    '70070-120',
    '60150-160',
    '69020-110'
  ]
};

/**
 * Card de Contato
 * 
 * Exibe informações de contato em um card organizado, incluindo:
 * - Lista de nomes
 * - Lista de emails
 * - Lista de telefones
 * - Lista de documentos
 * - Lista de endereços
 * 
 * @example Uso básico - apenas exibição
 * ```tsx
 * <ContactCard />
 * ```
 * 
 * @example Com callback de seleção
 * ```tsx
 * <ContactCard 
 *   onSelect={(type, value) => {
 *     if (type === 'email') sendEmail(value);
 *     if (type === 'phone') makeCall(value);
 *   }}
 * />
 * ```
 * 
 * @example Com dados customizados
 * ```tsx
 * <ContactCard 
 *   data={[
 *     { 
 *       icon: <User />,
 *       title: 'Colaboradores',
 *       description: 'Time de desenvolvimento',
 *       items: ['Ana', 'Bruno', 'Carla']
 *     }
 *   ]}
 *   className="rounded-lg shadow-md"
 * />
 * ```
 */
const ContactCard: FunctionComponent<ContactCardProps> = ({
  data,
  className,
  onSelect
}) => {
  // Gera os cards de informação com base na configuração dos campos
  const contactData: InfoCardItem[] = useMemo(() => 
    CONTACT_FIELDS.map(field => ({
      icon: field.icon,
      title: field.title,
      description: field.description,
      items: DEMO_CONTACT[field.dataKey],
      onClick: () => onSelect?.(field.type, DEMO_CONTACT[field.dataKey][0])
    }))
  , [onSelect]);

  return (
    <InfoCard 
      data={data || contactData}
      className={className}
    />
  );
};

export default ContactCard;
