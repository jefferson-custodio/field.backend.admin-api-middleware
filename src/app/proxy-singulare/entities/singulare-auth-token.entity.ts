import { Column, Entity } from 'typeorm';
import { BaseAppEntity } from '../../_base/base.entity';

@Entity('proxy_singulare_auth_token')
export class SingulareAuthToken extends BaseAppEntity {
  @Column({ type: 'varchar', length: 32, unique: true })
  provider: string;

  @Column({ type: 'text' })
  encryptedToken: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
