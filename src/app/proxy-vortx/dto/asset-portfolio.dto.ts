import { ApiProperty } from '@nestjs/swagger';

export class AssetPortfolioFundDto {
  @ApiProperty({ example: '2023-08-21T00:00:00.000Z' })
  dataAtual: string;

  @ApiProperty({ example: '00.000.000/0000-00' })
  empresa: string;

  @ApiProperty({ example: '00000000000000' })
  cnpjFundo: string;

  @ApiProperty({ example: '00000000' })
  carteira: string;

  @ApiProperty({ example: 'FIDC FICTICIO' })
  nome: string;

  @ApiProperty({ example: 'FIDC' })
  nomeResumido: string;

  @ApiProperty({ example: 'Ativa' })
  status: string;

  @ApiProperty({ example: 0 })
  pl: number;

  @ApiProperty({ example: 0 })
  quantidadeCotas: number;

  @ApiProperty({ example: 0 })
  valorCota: number;

  @ApiProperty({ example: 0 })
  variacaoCota: number;

  @ApiProperty({ example: 'Fechado' })
  tipoCondominio: string;

  @ApiProperty({ example: 'BRL' })
  tipoMoeda: string;

  @ApiProperty({ nullable: true, example: null })
  tipoFundo: string | null;

  @ApiProperty({ nullable: true, example: null })
  ultimaPosicao: string | null;
}

export class AssetPortfolioCategoryDto {
  @ApiProperty({ example: 'Renda Fixa' })
  tipo: string;

  @ApiProperty({ example: 200000 })
  plTotal: number;

  @ApiProperty({
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  ativos: Record<string, any>[];
}

export class AssetPortfolioAssetsBucketDto {
  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  Acoes: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  RendaFixa: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  RendaVariavel: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  RendaCompromissada: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  RendaVariavelAluguel: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  OpcoesAcoes: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  OpcoesFuturos: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  Futuros: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  Imoveis: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  Cotas: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  ProvisaoAReceber: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  Disponibilidade: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  Swap: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  TituloPrivado: AssetPortfolioCategoryDto | null;

  @ApiProperty({ type: AssetPortfolioCategoryDto, nullable: true })
  TituloPublico: AssetPortfolioCategoryDto | null;
}

export class AssetPortfolioLiabilityDto {
  @ApiProperty({ example: 'Passivos' })
  tipo: string;

  @ApiProperty({ example: 5000.0520001 })
  plTotal: number;

  @ApiProperty({
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  ativos: Record<string, any>[];
}

export class AssetPortfolioResponseDto {
  @ApiProperty({ type: AssetPortfolioFundDto, isArray: true })
  carteiras: AssetPortfolioFundDto[];

  @ApiProperty({ type: AssetPortfolioAssetsBucketDto, isArray: true })
  ativos: AssetPortfolioAssetsBucketDto[];

  @ApiProperty({ type: AssetPortfolioLiabilityDto, isArray: true })
  passivos: AssetPortfolioLiabilityDto[];
}
