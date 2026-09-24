import {
  ClassSerializerInterceptor,
  Controller,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from '../security/decorators/currentuser.decorator';
import { UpdateUserDto } from './dto/updateuser.dto';
import { JwtAuthGuard } from '../security/guards/jwt.auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Update the current user
   * @param updateUserDto - The data to update the user with
   * @param sub - The id of the user
   * @returns The updated user
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update the current user' })
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() { sub }: { sub: string },
  ) {
    return await this.userService.updateUser(updateUserDto, sub);
  }

  /**
   * Delete the current user
   * @param sub - The id of the user
   * @returns The deleted user
   */
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete the current user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteMe(@CurrentUser() { sub }: { sub: string }) {
    await this.userService.deleteUser(sub);
  }
}
