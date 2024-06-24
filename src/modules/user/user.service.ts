// src/modules/users/users.service.ts

import { Injectable, NotFoundException,  BadRequestException, Logger, Body, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entity/user.entity';
import { validate as isUUID } from 'uuid';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const {username,password,role} = createUserDto;
    console.log(createUserDto);
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    console.log(`Creating user with data in service: ${JSON.stringify(createUserDto)}`);
    const user = this.usersRepository.create(createUserDto);
    console.log(user);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Finding user with ID: ${id}`);
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
    const user = await this.usersRepository.findOneBy({ userid: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<User> {
    console.log(username);
    if (!username || username.trim() === '') {
      throw new BadRequestException('Username must be provided');
    }
    this.logger.log(`Finding user with username: ${username}`);
    const user = await this.usersRepository.findOneBy({ username });
    this.logger.log(`User found: ${JSON.stringify(user)}`);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.findUserByUsername(username);
    if (user && bcrypt.compare(password, user.password)) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    const payload = { username: user.username, userid: user.userid, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

 async remove(id: string): Promise<void> {
    this.logger.log(`Removing user with ID: ${id}`);
    if (!isUUID(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
