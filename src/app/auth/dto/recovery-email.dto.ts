import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsNotEmptyMessage } from '../../../common/utils/validator-errors.utils';

export class RecoveryEmailDto {
  @ApiProperty({ default: 'master@fieldasset.com.br' })
  @IsNotEmpty({ message: IsNotEmptyMessage('email', 'Email') })
  email: string;
}
