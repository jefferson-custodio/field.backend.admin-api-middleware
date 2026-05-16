import { SetMetadata } from '@nestjs/common';
import { ReportTypeEnum } from 'src/app/funds/enums/report-type.enum';

export const REPORT_TYPE_KEY = 'reportType';
export const ReportType = (reportType: ReportTypeEnum) =>
  SetMetadata(REPORT_TYPE_KEY, reportType);
