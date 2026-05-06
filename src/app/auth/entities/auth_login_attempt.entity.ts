import { BaseAppEntity } from '../../_base/base.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthLoginAttemptResultEnum } from '../enums/auth-login-attempt-result.enum';
@Entity()
export class AuthLoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.authLoginAttempts, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: number;

  @Column({
    type: 'enum',
    enum: AuthLoginAttemptResultEnum,
    nullable: false,
  })
  result: AuthLoginAttemptResultEnum;

  @Column({ nullable: false })
  ip: string;
}
