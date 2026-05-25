import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseService } from '../_base/base.service';
import { VersionsService } from '../versions/versions.service';
import { Fund } from './entities/fund.entity';

@Injectable()
export class FundsService extends BaseService<Fund> {
  constructor(
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
    versionsService: VersionsService,
  ) {
    super(
      fundRepository,
      {
        searchableColumns: ['name'],
        relations: ['fundAccesses'],
        sortableColumns: ['id'],
      },
      versionsService,
    );
  }

  protected override queryBuilderWithAccessFilter(alias: string) {
    return this.fundRepository.createQueryBuilder(alias);
  }
}
