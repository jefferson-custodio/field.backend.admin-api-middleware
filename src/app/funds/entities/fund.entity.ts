import { Column, Entity, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../_base/base.entity';
import { FundAccess } from './user-fund-access.entity';

@Entity()
export class Fund extends BaseAppEntity {
  @OneToMany(() => FundAccess, (fundAccess) => fundAccess.fund)
  fundAccesses: FundAccess[];

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  externalCode: string;

  @Column({ nullable: false })
  isActive: boolean;
}
