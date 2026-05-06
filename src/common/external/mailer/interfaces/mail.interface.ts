import { MailTemplates } from '../enums/templates.enum';

export interface IMail {
  to: string;
  //   from: string;
  subject: string;
  template: MailTemplates;
  context: {
    [key: string]: any;
  };
}
