import {
  intervalToDuration,
  parse,
  format,
  differenceInDays,
  eachDayOfInterval,
} from 'date-fns';

const TIME_ZONE = 'America/Sao_Paulo';

export const parseDate = (date: string, format: string): Date => {
  if (!date) return null;

  const parsedDate = parse(date, format, new Date());

  if (isNaN(parsedDate.getTime())) return null;

  return parsedDate;
};

export const formatDate = (date: Date, formatStr: string) => {
  return format(date, formatStr);
};

export const dateInterval = (start: Date, end: Date) => {
  return intervalToDuration({
    start,
    end,
  });
};

export const daysCountOfDateInterval = (start: Date, end: Date) => {
  return eachDayOfInterval({
    start,
    end,
  }).length;
};

export const dateIntervalInDays = (d1: Date, d2: Date): number => {
  return Math.abs(differenceInDays(new Date(d1), new Date(d2)));
};

export const dateToExcelTime = (date: Date): number => {
  date = new Date(date);
  return (
    25569.0 +
    (date.getTime() - date.getTimezoneOffset() * 60 * 1000) /
      (1000 * 60 * 60 * 24)
  );
};

export const excelTimeStampToDate = (excelTimeInDays: number) => {
  const seventyYearInDays = 25569;
  const oneDayInMiliseconds = 1000 * 60 * 60 * 24;
  const threeHours = 1000 * 60 * 60 * 3;

  return new Date(
    (excelTimeInDays - seventyYearInDays) * oneDayInMiliseconds + threeHours,
  );
};

export function processDateToPtBr(date: Date) {
  const d = new Date(date);
  d.setHours(d.getHours() < 3 ? d.getHours() + 3 : d.getHours());
  return d.toLocaleDateString('pt-BR');
}
