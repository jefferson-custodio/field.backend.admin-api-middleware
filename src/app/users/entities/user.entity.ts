import { UserRoleEnum } from '../../../common/enums/user-role.enum';
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { BaseAppEntity } from '../../_base/base.entity';
import {
  hashPassword,
  comparePassword,
} from '../../../common/utils/password.utils';
import { AuthLoginAttempt } from '../../auth/entities/auth_login_attempt.entity';
import { FundAccess } from 'src/app/user-fund-access/entities/user-fund-access.entity';
@Entity()
export class User extends BaseAppEntity {
  @OneToMany(() => FundAccess, (fundAccess) => fundAccess.user)
  fundAccesses: FundAccess[];

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

  @Column({ nullable: true, select: false })
  password: string;

  @OneToMany(
    () => AuthLoginAttempt,
    (authLoginAttempt) => authLoginAttempt.user,
  )
  authLoginAttempts: AuthLoginAttempt[];

  @Column()
  createdByUserId: number;

  @Column({ nullable: true, type: 'varchar', length: 64, select: false })
  recoveryToken: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP', select: false })
  recoveryTokenCreatedAt: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', select: false })
  passwordLastUpdatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password && this.password.trim() !== '') {
      this.password = await hashPassword(this.password.trim());
      return this.password;
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return await comparePassword(password.trim(), this.password.trim());
  }
}
