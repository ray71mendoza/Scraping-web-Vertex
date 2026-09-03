import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from '@vertex/database';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: dto.organizationName,
        apiQuotaLimit: 1000,
        apiQuotaUsed: 0,
      },
    });

    // Create user attached to organization
    const user = await prisma.user.create({
      data: {
        organizationId: organization.id,
        email: dto.email.toLowerCase(),
        name: dto.name,
        passwordHash,
        role: 'admin',
      },
    });

    const token = this.generateToken(user.id, user.email, organization.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: {
          id: organization.id,
          name: organization.name,
        },
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.generateToken(user.id, user.email, user.organizationId, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        apiQuotaLimit: user.organization.apiQuotaLimit,
        apiQuotaUsed: user.organization.apiQuotaUsed,
      },
    };
  }

  private generateToken(
    userId: string,
    email: string,
    organizationId: string,
    role: string,
  ): string {
    const payload = {
      sub: userId,
      email,
      organizationId,
      role,
    };

    return this.jwtService.sign(payload);
  }
}
