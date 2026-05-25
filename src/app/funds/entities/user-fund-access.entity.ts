import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseAppEntity } from '../../_base/base.entity';
import { User } from '../../users/entities/user.entity';
import { Fund } from './fund.entity';
import { ReportTypeEnum } from '../enums/report-type.enum';

@Entity()
export class FundAccess extends BaseAppEntity {
  @ManyToOne(() => User, (user) => user.fundAccesses)
  user: User;

  @ManyToOne(() => Fund, (fund) => fund.fundAccesses)
  fund: Fund;

  @Column({ nullable: false })
  reportType: ReportTypeEnum;
}
