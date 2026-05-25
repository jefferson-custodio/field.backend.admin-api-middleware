import { ApiProperty } from '@nestjs/swagger';

export class LiabilityShareholderMovementItemDto {
  @ApiProperty({ example: '2024-01-01' })
  dataConversao: string;

  @ApiProperty({ example: '999999999998' })
  codigoCotista: string;

  @ApiProperty({ example: 'COTISTA 20211' })
  nomeCotista: string;

  @ApiProperty({ example: '2024-01-01' })
  dataSolicitacao: string;

  @ApiProperty({ example: '2024-01-01' })
  dataLiquidacao: string;

  @ApiProperty({ example: 100.0 })
  aplicacao: number;

  @ApiProperty({ example: 0 })
  resgate: number;
}

export class LiabilityShareholderMovementTotalsDto {
  @ApiProperty({ example: 200 })
  totalAplicacoes: number;

  @ApiProperty({ example: 100 })
  totalResgates: number;

  @ApiProperty({ example: 300 })
  somaTotal: number;

  @ApiProperty({ example: 200 })
  totalNet: number;
}

export class LiabilityShareholderMovementDto {
  @ApiProperty({ example: '75.960.285/0001-01' })
  cnpjFundo: string;

  @ApiProperty({ type: LiabilityShareholderMovementItemDto, isArray: true })
  movimentacaoCotista: LiabilityShareholderMovementItemDto[];

  @ApiProperty({ type: LiabilityShareholderMovementTotalsDto })
  total: LiabilityShareholderMovementTotalsDto;
}
