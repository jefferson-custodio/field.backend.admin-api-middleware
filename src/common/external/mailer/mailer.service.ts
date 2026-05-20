import { Injectable, Logger } from '@nestjs/common';
import { IMail } from './interfaces/mail.interface';
import { Attachment } from 'nodemailer/lib/mailer';
import Handlebars from 'handlebars';
import { MailTemplates } from './enums/templates.enum';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CONFIG } from 'src/config';
import * as fs from 'fs';
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: CONFIG.mail.host,
      port: CONFIG.mail.port,
      secure: CONFIG.mail.secure,
      auth: CONFIG.mail.auth,
    });
  }

  async sendMail(mail: IMail, attachments?: Attachment[]) {
    try {
      await this.transporter.sendMail({
        to: mail.to,
        from: CONFIG.mail.from,
        subject: mail.subject,
        html: this.compileTemplate(mail.template, mail.context),
        attachments,
      });
    } catch (error) {
      this.logger.error(`Não foi possível enviar o email`, error);
      throw new Error(`Não foi possível enviar o email.`);
    }
  }

  private compileTemplate(tpl: MailTemplates, tplContext: any) {
    const template = Handlebars.compile(
      fs.readFileSync(this.getTemplatePath(tpl), { encoding: 'utf-8' }),
    );
    return template(tplContext);
  }

  private getTemplatePath(tpl: MailTemplates) {
    return path.resolve(
      process.cwd(),
      'src',
      'common',
      'external',
      'mailer',
      'templates',
      tpl + '.hbs',
    );
  }
}
