import { IsEmail, IsString, MinLength, IsOptional, IsIn, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/user/enums/user.enum';



export class RegisterDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: UserRole.USER, enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)  
  role?: UserRole = UserRole.USER;
}


export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}