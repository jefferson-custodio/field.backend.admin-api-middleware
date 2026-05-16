import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { BaseGuard } from 'src/app/_base/base.guard';
import { FundsService } from 'src/app/funds/funds.service';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { REPORT_TYPE_KEY } from 'src/common/decorator/report-type.decorator';
import { ReportTypeEnum } from 'src/app/funds/enums/report-type.enum';

@Injectable()
export class ProxyVortxGuard extends BaseGuard {
  constructor(
    public jwtService: JwtService,
    public reflector: Reflector,
    private readonly fundsService: FundsService,
  ) {
    super(jwtService, reflector);
  }

  private extractFundDocument(request: any): string | undefined {
    const rawValue =
      request.params?.fundDocument ??
      request.query?.fundDocument ??
      request.query?.cnpjFundo ??
      request.query?.['cnpjFundos[]'] ??
      request.query?.cnpjFundos ??
      request.body?.fundDocument;

    if (Array.isArray(rawValue)) {
      return rawValue.find((item) => typeof item === 'string' && item.trim());
    }

    if (typeof rawValue === 'string' && rawValue.trim()) {
      return rawValue;
    }

    return undefined;
  }

  async extraValidations(
    user: IJwtPayload,
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const reportType = this.reflector.getAllAndOverride<ReportTypeEnum>(
      REPORT_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!reportType) {
      throw new ForbiddenException('Tipo de relatório não configurado.');
    }

    const fundDocument = this.extractFundDocument(request);

    if (!fundDocument) {
      throw new ForbiddenException('Documento do fundo não informado.');
    }

    const documentWithoutMask = fundDocument.replace(/\D/g, '');
    if (!documentWithoutMask) {
      throw new ForbiddenException('Documento do fundo não informado.');
    }

    const hasAccess = await this.fundsService.hasAccess(
      user.id,
      documentWithoutMask,
      reportType,
    );

    if (!hasAccess) {
      throw new ForbiddenException('Usuário não tem acesso a este relatório.');
    }

    return true;
  }
}
