import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para proteger rotas com JWT
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
