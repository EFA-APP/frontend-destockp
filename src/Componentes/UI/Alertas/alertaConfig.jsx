import { XCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const tiposDeAlertas = {
  exito: {
    icon: CheckCircle2,
    iconColor: '!text-[var(--success)]',
    indicatorColor: '!bg-[var(--success)]',
  },
  error: {
    icon: XCircle,
    iconColor: '!text-[var(--error)]',
    indicatorColor: '!bg-[var(--error)]',
  },
  advertencia: {
    icon: AlertTriangle,
    iconColor: '!text-[var(--warning)]',
    indicatorColor: '!bg-[var(--warning)]',
  },
  info: {
    icon: Info,
    iconColor: '!text-[var(--primary)]',
    indicatorColor: '!bg-[var(--primary)]',
  }
};