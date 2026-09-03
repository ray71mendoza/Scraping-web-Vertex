// ═══════════════════════════════════════════════════════════
// VERTEX Prospect — Auth Guard (JWT)
// ═══════════════════════════════════════════════════════════

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET', 'dev-secret');
      const payload = jwt.verify(token, secret) as JwtPayload;

      // Attach user info to request
      request.user = {
        id: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
