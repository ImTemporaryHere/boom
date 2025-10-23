import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async create(token: string, userId: string, expiresAt: Date): Promise<RefreshToken> {
    const refreshToken = this.repository.create({
      token,
      userId,
      expiresAt,
    });
    return await this.repository.save(refreshToken);
  }

  async findByTokenAndUserId(token: string, userId: string): Promise<RefreshToken | null> {
    return await this.repository.findOne({
      where: { token, userId },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
