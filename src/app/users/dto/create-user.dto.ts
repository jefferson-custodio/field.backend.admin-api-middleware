import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import {
  IsNotEmptyMessage,
  InvalidEnumMessage,
} from 'src/common/utils/validator-errors.utils';
import { User } from '../entities/user.entity';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: IsNotEmptyMessage('name', 'Nome') })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: IsNotEmptyMessage('email', 'Email') })
  email: string;

  @ApiProperty()
  @IsEnum(UserRoleEnum, {
    message: InvalidEnumMessage('role', 'Perfil', UserRoleEnum),
  })
  @IsNotEmpty({ message: IsNotEmptyMessage('role', 'Perfil') })
  role: UserRoleEnum;

  password: string;

  createdByUserId: number;
}
