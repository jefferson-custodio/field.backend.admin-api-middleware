import { User } from 'src/app/users/entities/user.entity';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

export const getCurrentUser = (): IJwtPayload => {
  return global.USER;
};
