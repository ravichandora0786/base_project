import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ModuleActiveGuard } from '../../common/guards/module-active.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ModuleKey, BypassModuleActive } from '../../common/decorators/module-key.decorator';
import { RoleEnum } from '../../common/constants/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, ModuleActiveGuard)
@ModuleKey('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @BypassModuleActive()
  @Get('me')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Roles(RoleEnum.ADMIN)
  @Post()
  create(@Body() registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('is_active') isActive?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('limit') limit?: string,
    @CurrentUser('id') currentUserId?: string,
    @CurrentUser('email') currentUserEmail?: string,
  ) {
    return this.usersService.findAll({
      search,
      isActive,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : (limit ? Number(limit) : undefined),
      currentUserId,
      currentUserEmail,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
  ) {
    // Only allow updating own profile, unless user is Admin
    if (currentUser.id !== id && currentUser.role !== RoleEnum.ADMIN) {
      throw new ForbiddenException('You cannot update other users profiles');
    }
    return this.usersService.update(id, updateUserDto, currentUser.role === RoleEnum.ADMIN);
  }

  @Roles(RoleEnum.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('is_active') isActive: boolean,
  ) {
    return this.usersService.updateStatus(id, isActive);
  }

  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Roles(RoleEnum.ADMIN)
  @Patch(':id/profile-image')
  @UseInterceptors(
    FileInterceptor('profile_image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async uploadProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new Error('File upload failed');
    }
    const profileImageUrl = `http://localhost:${process.env.PORT || 4000}/uploads/${file.filename}`;
    return this.usersService.update(id, { profile_image: profileImageUrl }, true);
  }

  @Roles(RoleEnum.ADMIN)
  @Delete(':id/profile-image')
  async deleteProfileImage(@Param('id') id: string) {
    return this.usersService.deleteProfileImage(id);
  }
}
