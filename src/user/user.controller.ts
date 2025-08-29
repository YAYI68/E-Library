import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { QueryDto } from 'src/common/dto/common.dto';
import { IUser } from './types/user.type';

@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('borrowed-books')
  @UseGuards(JwtAuthGuard)
  async getBorrowedBooks(@CurrentUser() user:IUser, @Query() queryDto: QueryDto) {
    return this.userService.getBorrowedBooks(user.id,queryDto);
  }

}
