import { RegisterDto, LoginDto } from 'src/auth/dto/auth.dto';
import { AuthController } from './../../../src/auth/auth.controller';
import { AuthService } from './../../../src/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole } from 'src/user/enums/user.enum';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let module: TestingModule;

  const fakeUser = {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
  };

  const registerDto: RegisterDto = {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    role: UserRole.USER,
  };

  const loginDto: LoginDto = {
    email: 'john@example.com',
    password: 'password123',
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockedAccessToken'),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({
              message: 'User created successfully',
              user: { id: fakeUser.id, username: fakeUser.username, email: fakeUser.email, role: fakeUser.role },
              access_token: 'mockedAccessToken',
            }),
            login: jest.fn().mockResolvedValue({
              message: 'Login successful',
              user: { id: fakeUser.id, username: fakeUser.username, email: fakeUser.email, role: fakeUser.role },
              access_token: 'mockedAccessToken',
            }),
            validateUser: jest.fn().mockResolvedValue({ id: fakeUser.id, username: fakeUser.username, email: fakeUser.email, role: fakeUser.role }),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    await module.close();
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should register a new user', async () => {
      const result = await authController.signUp(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        message: 'User created successfully',
        user: { id: fakeUser.id, username: fakeUser.username, email: fakeUser.email, role: fakeUser.role },
        access_token: 'mockedAccessToken',
      });
    });

    it('should throw an error if user already exists', async () => {
      jest.spyOn(authService, 'register').mockRejectedValue(new UnauthorizedException('User already exists'));
      await expect(authController.signUp(registerDto)).rejects.toThrow('User already exists');
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw a bad request error if registration fails', async () => {
      jest.spyOn(authService, 'register').mockRejectedValue(new BadRequestException('Error creating up a user'));
      await expect(authController.signUp(registerDto)).rejects.toThrow('Error creating up a user');
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('loginUser', () => {
    it('should log in a user successfully', async () => {
      const result = await authController.loginUser(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        message: 'Login successful',
        user: { id: fakeUser.id, username: fakeUser.username, email: fakeUser.email, role: fakeUser.role },
        access_token: 'mockedAccessToken',
      });
    });

    it('should throw an error for invalid credentials', async () => {
      jest.spyOn(authService, 'login').mockRejectedValue(new UnauthorizedException('Invalid credentials'));
      await expect(authController.loginUser(loginDto)).rejects.toThrow('Invalid credentials');
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw a bad request error if login fails', async () => {
      jest.spyOn(authService, 'login').mockRejectedValue(new BadRequestException('Error Logging a user'));
      await expect(authController.loginUser(loginDto)).rejects.toThrow('Error Logging a user');
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});