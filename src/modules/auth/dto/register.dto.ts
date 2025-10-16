import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome de usuário',
    example: 'joao.silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'O username é obrigatório' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;

  @ApiProperty({
    description: 'Nome completo',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    example: 'user',
    enum: ['admin', 'user', 'manager'],
    default: 'user',
  })
  @IsEnum(['admin', 'user', 'manager'], {
    message: 'Role deve ser: admin, user ou manager',
  })
  @IsNotEmpty()
  role: string;
}
