import i18n from 'i18next';

const STATUS_CLASS_MAP = {
  'Approved': 'status-green',
  'Pending': 'status-yellow',
  'Rejected': 'status-red',
};

const TYPE_I18N_KEY_MAP = {
  'Vacation': 'type_vacation',
  'SickLeave': 'type_sick_leave',
  'ParentalLeave': 'type_parental_leave',
  'BereavementLeave': 'type_bereavement_leave',
  'Other': 'type_other'
};

const STATUS_I18N_KEY_MAP = {
  'Approved': 'status_approved',
  'Pending': 'status_pending',
  'Rejected': 'status_rejected',
};

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

export const translateStatus = (key) => {
  const i18nKey = STATUS_I18N_KEY_MAP[key];
  return i18nKey ? i18n.t(i18nKey) : (STATUS_CONFIG[key]?.label || key);
};

export const getStatusClass = (key) => STATUS_CLASS_MAP[key] || "";

export const translateType = (key) => {
  const i18nKey = TYPE_I18N_KEY_MAP[key];
  return i18nKey ? i18n.t(i18nKey) : (TYPE_MAP[key] || key);
};