import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { hashPassword, verifyPassword } from './utils/password';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await verifyPassword(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    try{
       const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const { password, ...userResult } = user;
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload)
    return {
      message: 'Login successful',
      user: userResult,
      access_token: accessToken,
    };
    }
    catch(error){
      this.logger.error(`Error Logging a user: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error; 
      }
      throw new BadRequestException('Error Logging a user')
    }
    
  }

  async register(registerDto: RegisterDto) {
    try{
        const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await hashPassword(registerDto.password);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const { password, ...userResult } = user;
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload)
    return {
      message: 'User created successfully',
      user: userResult,
      access_token: accessToken,
    };
    }
      catch(error){
      this.logger.error(`Error creating up a user: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error; // Propagate UnauthorizedException as-is
      }
      throw new BadRequestException('Error creating up a user')
    }
  
  }
}
