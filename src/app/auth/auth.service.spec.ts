import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { UserRoleEnum } from '../../common/enums/user-role.enum';
import { IJwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { VersionsService } from '../versions/versions.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByDocument: jest.fn(),
          },
        },
        { provide: VersionsService, useValue: {} },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('returns a user when validation is successful', async () => {
      const user = new User();
      user.document = 123456;
      user.password = 'password';
      user.comparePassword = jest.fn().mockResolvedValue(true);
      jest.spyOn(usersService, 'findByDocument').mockResolvedValue(user);

      const result = await service.validateUser(123456, 'password');
      expect(result).toEqual(user);
    });

    it('returns null when user cannot be found', async () => {
      jest.spyOn(usersService, 'findByDocument').mockResolvedValue(null);

      const result = await service.validateUser(123456, 'password');
      expect(result).toBeNull();
    });

    it('returns null when password is invalid', async () => {
      const user = new User();
      user.document = 123456;
      user.password = 'password';
      user.comparePassword = jest.fn().mockResolvedValue(false);
      jest.spyOn(usersService, 'findByDocument').mockResolvedValue(user);

      const result = await service.validateUser(123456, 'wrong-password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('returns a JWT when login is successful', async () => {
      const user = new User();
      user.email = 'teste@email.com';
      user.password = 'password';
      jest.spyOn(service, 'validateUser').mockResolvedValue(user);
      jest.spyOn(service, 'getToken').mockReturnValue('jwt-token');

      const result = await service.login(
"teste@email.com", password: 'password' },
        '123',
      );
      expect(result).toEqual({ accessToken: 'jwt-token' });
    });

    it('returns null when validation fails', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      const result = await service.login({
        document: 123456,
        password: 'password',
      });
      expect(result).toBeNull();
    });
  });
});
