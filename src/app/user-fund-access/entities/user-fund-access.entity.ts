import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseAppEntity } from '../../_base/base.entity';
import { Fund } from '../../funds/entities/fund.entity';
import { ReportTypeEnum } from '../../funds/enums/report-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity('user_fund_access')
export class UserFundAccess extends BaseAppEntity {
  @ManyToOne(() => User, (user) => user.userFundAccesses)
  user: User;

  @ManyToOne(() => Fund, (fund) => fund.userFundAccesses)
  fund: Fund;

  @Column({
    type: 'enum',

    enum: ReportTypeEnum,
    nullable: false,
  })
  reportType: ReportTypeEnum;
}
