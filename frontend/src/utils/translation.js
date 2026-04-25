export const STATUS_CONFIG = {
  'Approved': { label: 'Aceite', className: 'status-green' },
  'Pending': { label: 'Pendente', className: 'status-yellow' },
  'Rejected': { label: 'Rejeitado', className: 'status-red' },
};

export const TYPE_MAP = {
  'Vacation': 'Férias',
  'SickLeave': 'Baixa Médica',
  'ParentalLeave': 'Licença Parental',
  'BereavementLeave': 'Dias de Nojo',
  'Other': 'Outro'
};

export const translateStatus = (key) => STATUS_CONFIG[key]?.label || key;
export const getStatusClass = (key) => STATUS_CONFIG[key]?.className || "";
export const translateType = (key) => TYPE_MAP[key] || key;