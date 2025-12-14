import { useFormatter } from 'next-intl';

export function useLocalizedFormatters() {
  const format = useFormatter();

  return {
    formatDate: (date: Date) => {
      return format.dateTime(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },

    formatShortDate: (date: Date) => {
      return format.dateTime(date, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    },

    formatNumber: (num: number) => {
      return format.number(num);
    },

    formatRelativeTime: (date: Date) => {
      return format.relativeTime(date);
    },
  };
}
