// src/modules/users/users.controller.ts

import { Controller, Get, Post, Body, Param, Delete, Patch, Logger,ParseIntPipe } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entity/user.entity';

@Controller('user')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with data: ${JSON.stringify(createUserDto)}`);
    return await this.usersService.create(createUserDto);
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    this.logger.log(`Logging in user with data: ${JSON.stringify(loginDto)}`);
    return await this.usersService.login(loginDto);
  }

  @Get('getalluser')
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('getuserbyid/:id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }
  @Get('getuserbyusername/:username')
  async findUser(@Param('username') username: string): Promise<User> {
    return this.usersService.findUserByUsername(username);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
