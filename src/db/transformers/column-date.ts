import { parseDate } from '../../common/utils/date.utils';

export class ColumDateTransformer {
  to(value: string): string {
    return value;
  }
  from(value: string): Date {
    return parseDate(value, 'yyyy-MM-dd');
  }
}
