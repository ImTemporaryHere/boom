import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'boom',
  password: process.env.DB_PASSWORD || 'boom_dev_password',
  database: process.env.DB_DATABASE || 'boom_dev',
  entities: [User, RefreshToken],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development only
  logging: process.env.NODE_ENV === 'development',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};
