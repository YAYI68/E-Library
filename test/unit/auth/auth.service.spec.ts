import { LoginDto, RegisterDto } from 'src/auth/dto/auth.dto';
import { AuthService } from './../../../src/auth/auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/user/enums/user.enum';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { verifyPassword, hashPassword } from 'src/auth/utils/password';
verifyPassword

jest.mock('src/auth/utils/password'); // Mock password utilities

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let module: TestingModule;

  const fakeUser = {
    id: '1234567890abcdef12345678',
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

  const mockUserService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockedAccessToken'),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    // Mock password utilities
    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
    (verifyPassword as jest.Mock).mockResolvedValue(true);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    await module.close();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate a user with correct credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);
      const result = await authService.validateUser(loginDto.email, loginDto.password);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPassword).toHaveBeenCalledWith(loginDto.password, fakeUser.password);
      expect(result).toEqual({
        id: fakeUser.id,
        username: fakeUser.username,
        email: fakeUser.email,
        role: fakeUser.role,
      });
    });

    it('should return null for invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);
      (verifyPassword as jest.Mock).mockResolvedValue(false);
      const result = await authService.validateUser(loginDto.email, loginDto.password);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPassword).toHaveBeenCalledWith(loginDto.password, fakeUser.password);
      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      const result = await authService.validateUser(loginDto.email, loginDto.password);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);
      const result = await authService.login(loginDto);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(verifyPassword).toHaveBeenCalledWith(loginDto.password, fakeUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: fakeUser.username,
        sub: fakeUser.id,
        role: fakeUser.role,
      });
      expect(result).toEqual({
        message: 'Login successful',
        user: {
          id: fakeUser.id,
          username: fakeUser.username,
          email: fakeUser.email,
          role: fakeUser.role,
        },
        access_token: 'mockedAccessToken',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for general errors', async () => {
      mockUserService.findByEmail.mockRejectedValue(new Error('Database error'));
      await expect(authService.login(loginDto)).rejects.toThrow(BadRequestException);
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(fakeUser);
      const result = await authService.register(registerDto);
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(userService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword123',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: fakeUser.email,
        sub: fakeUser.id,
        role: fakeUser.role,
      });
      expect(result).toEqual({
        message: 'User created successfully',
        user: {
          id: fakeUser.id,
          username: fakeUser.username,
          email: fakeUser.email,
          role: fakeUser.role,
        },
        access_token: 'mockedAccessToken',
      });
    });

    it('should throw UnauthorizedException if user already exists', async () => {
      mockUserService.findByEmail.mockResolvedValue(fakeUser);
      await expect(authService.register(registerDto)).rejects.toThrow(UnauthorizedException);
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(hashPassword).not.toHaveBeenCalled();
      expect(userService.create).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for general errors', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockRejectedValue(new Error('Database error'));
      await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(userService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashedPassword123',
      });
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});