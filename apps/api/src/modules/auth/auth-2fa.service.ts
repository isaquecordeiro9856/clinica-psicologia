import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { randomBytes } from 'crypto';
import * as speakeasy from 'speakeasy';

@Injectable()
export class Auth2faService {
  private readonly logger = new Logger(Auth2faService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a new TOTP secret for a user.
   * Returns the secret and OTP auth URL for QR code generation.
   */
  async generateSecret(userId: string) {
    const secret = speakeasy.generateSecret({
      name: 'ClínicaPsi',
      length: 20,
    });

    // Store the secret temporarily (not enabled yet)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 } as never,
    });

    this.logger.log(`[2FA] Secret generated for user ${userId}`);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Verify a TOTP code and enable 2FA for the user.
   */
  async verifyAndEnable(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const secret = (user as Record<string, unknown>).twoFactorSecret as string;
    if (!secret) throw new UnauthorizedException('Secret 2FA não gerado');

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Código 2FA inválido');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true } as never,
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      randomBytes(4).toString('hex').toUpperCase()
    );

    this.logger.log(`[2FA] Enabled for user ${userId}`);

    return {
      enabled: true,
      backupCodes,
    };
  }

  /**
   * Verify a TOTP code during login.
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const secret = (user as Record<string, unknown>).twoFactorSecret as string;
    if (!secret) return false;

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
  }

  /**
   * Disable 2FA for a user.
   */
  async disable(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null } as never,
    });

    this.logger.log(`[2FA] Disabled for user ${userId}`);
    return { disabled: true };
  }
}
