import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { User } from './entities/user.entity';
import { UserGuard } from './guards/user.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(UserGuard)
  @Roles(UserRoleEnum.MASTER)
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.usersService.findAllPaginated(query);
  }

  @Get(':id')
  @UseGuards(UserGuard)
  @Roles(UserRoleEnum.MASTER)
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findByIdOrFail(+id);
  }

  @Post()
  @UseGuards(UserGuard)
  @Roles(UserRoleEnum.MASTER)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    createUserDto.createdByUserId = global.USER.id;
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(UserGuard)
  @Roles(UserRoleEnum.MASTER)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    delete updateUserDto['password'];
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  @Roles(UserRoleEnum.MASTER)
  delete(@Param('id') id: string): Promise<void> {
    return this.usersService.delete(+id);
  }
}
