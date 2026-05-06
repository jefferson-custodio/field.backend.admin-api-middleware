import { VersionTypeEnum } from '../../../common/enums/version-type.enum';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  Index,
  Entity,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Version {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  @Index()
  entity: string;

  @Column({ nullable: false })
  @Index()
  entityId: number;

  @Column({
    type: 'enum',
    enum: VersionTypeEnum,
    nullable: false,
  })
  type: VersionTypeEnum;

  @Column('text', { nullable: true })
  old_data: string;

  @Column('text', { nullable: true })
  new_data: string;

  @Column({ nullable: false })
  @Index()
  userIdentityId: number;

  @CreateDateColumn()
  createdAt: Date;
}
