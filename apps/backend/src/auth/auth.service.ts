import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Tokens, JwtPayload } from './interfaces/tokens.interface';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Clean up expired tokens periodically
  async onModuleInit() {
    await this.cleanupExpiredTokens();
    // Run cleanup every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  private async cleanupExpiredTokens() {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<Tokens> {
    const user = await this.usersService.create(signUpDto);
    return this.generateTokens(user.id, user.email);
  }

  async signIn(signInDto: SignInDto): Promise<Tokens> {
    const user = await this.usersService.validatePassword(
      signInDto.email,
      signInDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify the refresh token exists in database and is not expired
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken, userId: payload.sub },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.refreshTokenRepository.delete(storedToken.id);
        throw new UnauthorizedException('Refresh token expired');
      }

      // Delete old refresh token
      await this.refreshTokenRepository.delete(storedToken.id);

      // Generate new tokens
      return this.generateTokens(payload.sub, payload.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Delete all refresh tokens for this user
    await this.refreshTokenRepository.delete({ userId });
  }

  private async generateTokens(userId: string, email: string): Promise<Tokens> {
    const accessPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: process.env.JWT_SECRET || 'secret-key-change-in-production',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production',
        expiresIn: '7d',
      }),
    ]);

    // Store the refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      userId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }
}
