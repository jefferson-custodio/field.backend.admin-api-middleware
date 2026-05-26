import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import {
  InvalidPasswordMessage,
  IsNotEmptyMessage,
} from '../../../common/utils/validator-errors.utils';

export class AuthDto {
  @ApiProperty({ default: 'master@dition.com.br' })
  @IsNotEmpty({ message: IsNotEmptyMessage('email', 'Email') })
  email: string;

  @ApiProperty({ default: '' })
  @IsNotEmpty({ message: IsNotEmptyMessage('password', 'Senha') })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
  //   message: InvalidPasswordMessage('password'),
  // })
  password: string;
}
