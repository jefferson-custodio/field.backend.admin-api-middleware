import { UserRoleEnum } from '../enums/user-role.enum';

export interface IJwtPayload {
  id: number;
  name: string;
  role: UserRoleEnum;
}
