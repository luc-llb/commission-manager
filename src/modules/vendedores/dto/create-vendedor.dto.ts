import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateVendedorDto {
  @ApiProperty({
    description: 'Nome completo do vendedor',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'Email do vendedor',
    example: 'joao.silva@example.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'CPF do vendedor',
    example: '12345678900',
  })
  @IsString()
  @IsNotEmpty({ message: 'O CPF é obrigatório' })
  cpf: string;

  @ApiProperty({
    description: 'Telefone do vendedor',
    example: '11987654321',
    required: false,
  })
  @IsString()
  @IsOptional()
  telefone?: string;

  @ApiProperty({
    description: 'Percentual de comissão do vendedor',
    example: 5,
    default: 5,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsNumber()
  @Min(0, { message: 'O percentual de comissão deve ser no mínimo 0' })
  @Max(100, { message: 'O percentual de comissão deve ser no máximo 100' })
  @IsOptional()
  percentualComissao?: number;
}
