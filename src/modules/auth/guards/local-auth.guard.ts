import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para autenticação local (login)
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
