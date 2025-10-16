import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';

/**
 * Service responsável pela lógica de autenticação
 * Implementa os princípios SOLID:
 * - Single Responsibility: apenas gerencia autenticação
 * - Dependency Inversion: depende de abstrações (JwtService, Repository)
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida as credenciais do usuário
   * Retorna o usuário se válido, null caso contrário
   */
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username, ativo: true },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Realiza o login e retorna o token JWT
   */
  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Registra um novo usuário
   * Hash da senha usando bcrypt
   */
  async register(registerDto: RegisterDto): Promise<any> {
    // Valida se username já existe
    const existingUsername = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username já está em uso');
    }

    // Valida se email já existe
    const existingEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Cria o usuário
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Remove a senha do retorno
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = savedUser;
    return result;
  }

  /**
   * Busca um usuário por ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'nome', 'email', 'role', 'ativo', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  /**
   * Cria o usuário admin padrão se não existir
   * Útil para inicialização do sistema
   */
  async createDefaultAdmin(): Promise<void> {
    const adminExists = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = this.userRepository.create({
        username: 'admin',
        password: hashedPassword,
        nome: 'Administrador',
        email: 'admin@example.com',
        role: 'admin',
      });

      await this.userRepository.save(admin);
      console.log('✅ Usuário admin padrão criado (username: admin, senha: admin123)');
    }
  }
}
