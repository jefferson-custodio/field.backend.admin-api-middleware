import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Version } from './entities/version.entity';
import { VersionTypeEnum } from '../../common/enums/version-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '../_base/base.service';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class VersionsService extends BaseService<Version> {
  constructor(
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>,
  ) {
    super(versionRepository, {}, null);
  }

  protected override queryBuilderWithAccessFilter(alias: string) {
    const qb = this.versionRepository.createQueryBuilder(alias);

    return qb;
  }

  async registerCreation(entity: string, id: number, user: IJwtPayload) {
    const version = this.versionRepository.create({
      entity: entity,
      entityId: id,
      type: VersionTypeEnum.CREATE,
      userIdentityId: user.id,
    });

    return this.versionRepository.save(version);
  }

  async registerUpdates(
    entity: string,
    id: number,
    old_data: any,
    new_data: any,
    user: IJwtPayload,
  ) {
    if (this.areObjectsEqual(old_data, new_data)) return false;
    const version = this.versionRepository.create({
      entity: entity,
      entityId: id,
      type: VersionTypeEnum.UPDATE,
      userIdentityId: user.id,
      old_data: JSON.stringify(old_data),
      new_data: JSON.stringify(new_data),
    });

    return this.versionRepository.save(version);
  }

  async registerDeletion(entity: string, id: number, user: IJwtPayload) {
    const version = this.versionRepository.create({
      entity: entity,
      entityId: id,
      type: VersionTypeEnum.DELETE,
      userIdentityId: user.id,
    });

    return this.versionRepository.save(version);
  }

  areObjectsEqual(ob1, ob2): boolean {
    return (
      Object.entries(this.filterRelevantValues(ob1)).sort().toString() ===
      Object.entries(this.filterRelevantValues(ob2)).sort().toString()
    );
  }
  filterRelevantValues(obj: any): any {
    const deletion: string[] = [];
    if (obj.updatedAt) deletion.push('updatedAt');

    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        deletion.push(key);
      } else if (typeof obj[key] === 'number') {
        obj[key] = String(value);
      } else if (
        typeof obj[key] === 'object' &&
        obj[key]?.id &&
        obj[key]?.createdAt
      ) {
        deletion.push(key);
      }
    });

    deletion.forEach((item) => {
      delete obj[item];
    });

    return obj;
  }
}
