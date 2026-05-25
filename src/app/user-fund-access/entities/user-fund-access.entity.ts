import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseAppEntity } from '../../_base/base.entity';
import { Fund } from '../../funds/entities/fund.entity';
import { ReportTypeEnum } from '../../funds/enums/report-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity()
export class FundAccess extends BaseAppEntity {
  @ManyToOne(() => User, (user) => user.fundAccesses)
  user: User;

  @ManyToOne(() => Fund, (fund) => fund.fundAccesses)
  fund: Fund;

  @Column({ nullable: false })
  reportType: ReportTypeEnum;
}
