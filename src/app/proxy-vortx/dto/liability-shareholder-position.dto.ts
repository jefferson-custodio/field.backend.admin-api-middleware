import { ApiProperty } from '@nestjs/swagger';

export class LiabilityShareholderPositionDto {
  @ApiProperty({ example: 'FUNDO DE INVESTIMENTO IMOBILIARIO' })
  nomeFundo: string;

  @ApiProperty({ example: '75.960.285/0001-01' })
  cnpjFundo: string;

  @ApiProperty({ example: '21/11/2023' })
  dataPosicao: string;

  @ApiProperty({ example: '53298235' })
  idInternoCotista: string;

  @ApiProperty({ example: 'FIM RICCO' })
  nomeCotista: string;

  @ApiProperty({ example: '98.160.302/0001-21' })
  identificacaoCotista: string;

  @ApiProperty({ example: 'Juridica' })
  tipoCotista: string;

  @ApiProperty({ example: 'VORTX' })
  distribuidorNome: string;

  @ApiProperty({ example: '22.610.500/0001-88' })
  distribuidorCnpj: string;

  @ApiProperty({ example: 7350000 })
  valorBrutoDisponivel: number;

  @ApiProperty({ example: 212363.67362445 })
  quantidadeCotas: number;
}
