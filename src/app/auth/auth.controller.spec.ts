import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('returns an access token when login is successful', async () => {
    const authDto = { document: 123456, password: 'password' };
    const expectedResponse = { accessToken: 'jwt-token' };

    jest.spyOn(authService, 'login').mockResolvedValue(expectedResponse);

    const result = await controller.login(authDto);
    expect(result).toEqual(expectedResponse);
  });

  it('throws an exception when login fails', async () => {
    const authDto = { document: 123456, password: 'password' };

    jest.spyOn(authService, 'login').mockResolvedValue(null);

    await expect(controller.login(authDto)).rejects.toThrow(
      new HttpException(
        'CPF e/ou senha incorretos...',
        HttpStatus.UNAUTHORIZED,
      ),
    );
  });
});
