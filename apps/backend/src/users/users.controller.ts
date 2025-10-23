import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users', type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    // Remove passwords from response
    return users.map(({ password, ...user }) => user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  async findOne(@Param('id') id: string): Promise<UserResponseDto | null> {
    const user = await this.usersService.findById(id);
    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }
}
