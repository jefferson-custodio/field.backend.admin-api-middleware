import { Column, Entity, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../_base/base.entity';
import { UserFundAccess } from '../../user-fund-access/entities/user-fund-access.entity';

@Entity()
export class Fund extends BaseAppEntity {
  @OneToMany(() => UserFundAccess, (userFundAccess) => userFundAccess.fund)
  userFundAccesses: UserFundAccess[];

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  externalCode: string;

  @Column({ nullable: false })
  isActive: boolean;
}
