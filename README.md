<p align="center">
  <a href="https://dition.com.br/" target="blank"><img src="https://dition.s3.sa-east-1.amazonaws.com/logo-dition-dark-blue.png" width="200" alt="Dition Logo" /></a>
</p>

## Description

Projeto Dition NestJS

## Installation

```bash
$ npm install
```

## Running the app on docker

```bash
# RUN APP
$ docker compose up

# EXECUTE MIGRATIONS (em outro terminal)
$ docker compose exec app npm run migration:run

# EXECUTE SEEDER
$ docker compose exec app npm run migration:run
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrations

```bash
# gerar migrations
$ npm run migration:generate -name={name}

# rodar migrations
$ npm run migration:run

# reverter migrations
$ npm run migration:revert
```

## Seeders

```bash
# rodar seeds
$ npm run seed

# atualizar seeds
$ seed:refresh
```

### Usuário Incial

Após executar o seeder, será criado um usuário na aplicação de acordo com os dados do arquivo:

```bash
src/db/seeds/users.seed.ts
```

## Variáveis de ambiente

_Deve ser criado um arquivo .env na raiz do projeto para adicionar essas variáveis._

- Base
  - `DB_HOST` // Host do banco de dados
  - `DB_PORT` // Porta do banco de dados
  - `DB_USERNAME` // User do banco de dados
  - `DB_PASSWORD` // Senha do banco de dados
  - `DB_DATABASE` // Nome do banco de dados

- jwt
  - `JWT_KEY` // Chave do token jwt

- MAILER
  - `MAIL_HOST`
  - `MAIL_PORT`
  - `MAIL_USER`
  - `MAIL_PASS`

## Padrões do projeto

Para criar um novo módulo execute:

```bash
cd src/app && nest g res {nome-recurso}
```

**Após executar, selecione Rest API e responda Y para CRUD entry points.**

### Sua entidade deve estender a entidade base:

```ts
import { UserRoleEnum } from '../../../common/enums/user-role.enum';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../_base/base.entity';

@Entity()
export class User extends BaseAppEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    nullable: false,
  })
  role: UserRoleEnum;

  @Column({ nullable: false })
  password: string;
}
```

### Seu service deve estender o serviço base:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../_base/base.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super(userRepository, {
      searchableColumns: ['name', 'email'],
    });
  }

  async findByEmail(email: string, relations?: string[]): Promise<User> {
    return this.userRepository.findOne({ relations, where: { email } });
  }
}
```

## Auth

### Perfis de acesso

Para configurar os perfis de acesso, acesso o arquivo:

```bash
src/common/enums/user-role.enum.ts
```

### Guards

#### Em src/app/guards/{entidade}.guard.ts crie um arquivo de Guard estendendo o Guard base:

```ts
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BaseGuard } from 'src/app/_base/base.guard';
import { IJwtPayload } from 'src/common/external/identity/interfaces/jwt-payload.interface';

@Injectable()
export class FundGuard extends BaseGuard {
  constructor(
    public identityService: IdentityService,
    public reflector: Reflector,
  ) {
    super(identityService, reflector);
  }

  async extraValidations(user: IJwtPayload): Promise<boolean> {
    // escreva aqui suas regras de validação adicionais caso necessário
    return true;
  }
}
```

### Em seus controllers utilize o Guard da seguinte forma:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../_base/base.service';
import { User } from './entities/user.entity';

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
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: IRequest,
  ): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(UserGuard)
  @Roles(UserRoleEnum.MASTER)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: IRequest,
  ): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(UserGuard)
  @Roles(UserRoleEnum.MASTER)
  delete(@Param('id') id: string, @Req() req: IRequest): Promise<void> {
    return this.usersService.delete(+id);
  }
}
```

### Build e Deploy - API

#### 1. **Login**

```bash
az login
```

#### 2. **Login no ACR**

```bash
az acr login --name fieldbackendadminmiddleware-aeekfnb5gud5d8bj
```

#### 3. **Build e Push da Imagem**

```bash
docker buildx build -f Dockerfile --platform linux/amd64 --provenance=false -t fieldbackendadminmiddleware-aeekfnb5gud5d8bj.azurecr.io/field-backend-admin-api-middleware:prd --push .
```
