// @ts-nocheck
import {
  FilterOperator,
  PaginateQuery,
  Paginated,
  paginate,
} from 'nestjs-paginate';
import { BaseEntity, Repository, In, DataSource, EntityTarget } from 'typeorm';
// import { VersionsService } from '../versions/versions.service';
import { JwtPayload } from '../../common/external/identity/interfaces/jwt-payload.interface';
import { getTenantSource } from '../../common/utils/tenancy.utils';
import { QueryFailedError } from 'typeorm';
import { BadRequestException, Logger } from '@nestjs/common';
interface Config<T> {
  searchableColumns?: string[];
  filterableColumns?: { [key: string]: FilterOperator[] | boolean };
  relations?: string[];
  sortableColumns: Column<T>[];
}

export class BaseService<T> {
  private readonly BLogger = new Logger(BaseService.name);

  constructor(
    private readonly repository: Repository<T>,
    readonly config: Config = {},
    readonly versionsService: VersionsService,
    protected readonly dataSource: DataSource = {}, // default;
  ) {
    if (!this.repository) {
      throw new Error(
        `Repository for entity ${entity} could not be initialized`,
      );
    }
  }

  protected abstract queryBuilderWithAccessFilter(
    alias: string,
  ): SelectQueryBuilder<T> {
    throw new Error(
      `Method ${this.queryBuilderWithAccessFilter} not implemented.`,
    );
  }

  async count(where?: object): Promise<number> {
    return this.repository.count({ where });
  }

  async findAll(relations: string[] = []): Promise<T[]> {
    return this.repository.find({ relations });
  }

  async findAllPaginated(
    query: PaginateQuery,
    relations?: Object | string[],
  ): Promise<Paginated<T>> {
    return paginate(query, this.repository, {
      relations: relations,
      sortableColumns: this.config.sortableColumns || ['createdAt'],
      nullSort: 'last',
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: this.config.searchableColumns || ['id'],
      filterableColumns: this.config.filterableColumns || ['id'],
      maxLimit: this.config.maxLimit,
    });
  }

  async findById(id: number, relations?: string[]): Promise<T> {
    return this.repository.findOne({
      where: { id },
      relations,
    });
  }

  async findByIds(ids: number[], relations?: string[]): Promise<T[]> {
    return this.repository.find({
      where: { id: In(ids) },
      relations,
    });
  }

  async findByIdOrFail(id: number, relations?: Object | string[]): Promise<T> {
    return this.repository.findOneOrFail({
      where: { id },
      relations,
    });
  }

  async create(data: T | Partial<T>): Promise<T> {
    try {
      const obj = this.repository.create(data);
      const res = await this.repository.save(obj);

      this.versionsService.registerCreation(
        this.repository.metadata.name,
        res.id,
        global.USER,
      );
      return res;
    } catch (error) {
      this.parseErrors(error as QueryFailedError);
      throw error;
    }
  }

  async update(id: number, updateData: T | Partial<T>): Promise<T> {
    try {
      id = Number(id);
      const property = await this.findByIdOrFail(id);

      await this.repository.save({
        ...property,
        ...updateData,
        id: id,
      });

      const res = await this.findByIdOrFail(id);

      this.versionsService.registerUpdates(
        this.repository.metadata.name,
        res.id,
        property,
        res,
        global.USER || { id: 0 },
      );
      return res;
    } catch (error) {
      this.parseErrors(error as QueryFailedError);
      throw error;
    }
  }

  async save(e: T): Promise<T> {
    return this.repository.save(e);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
    this.versionsService.registerDeletion(
      this.repository.metadata.name,
      id,
      global.USER,
    );
  }

  async upsert(filters, data): Promise<T> {
    let item = filters ? await this.repository.findOneBy(filters) : undefined;

    if (item) {
      return await this.update(item.id, data);
    } else {
      return await this.create(data);
    }
  }

  async sync(filters, data): Promise<boolean> {
    const dataFromDb = await this.repository.findBy(filters);
    const persistedItemsIds = [];

    for (let item of data) {
      let storedItem = await this.upsert(
        item.id ? { id: item.id } : null,
        item,
      );
      persistedItemsIds.push(+storedItem.id);
    }

    for (let itemFromDb of dataFromDb) {
      const id = itemFromDb.id;
      if (!persistedItemsIds.includes(+id)) await this.delete(id);
    }

    return true;
  }

  private parseErrors(error: QueryFailedError): string {
    this.BLogger.error(error);
    this.BLogger.verbose(error.query);
    const detail = (error as any).driverError?.detail;

    if (detail) {
      throw new BadRequestException(detail, error.message);
    }

    throw error;
  }
}
