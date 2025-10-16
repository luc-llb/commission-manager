import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Notebook Dell Inspiron',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({
    description: 'Descrição detalhada do produto',
    example: 'Notebook com processador Intel i7, 16GB RAM, SSD 512GB',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({
    description: 'Preço do produto',
    example: 3500.0,
  })
  @IsNumber()
  @Min(0, { message: 'O preço deve ser maior ou igual a 0' })
  @IsNotEmpty({ message: 'O preço é obrigatório' })
  preco: number;

  @ApiProperty({
    description: 'SKU (código único) do produto',
    example: 'DELL-INSP-15-I7',
  })
  @IsString()
  @IsNotEmpty({ message: 'O SKU é obrigatório' })
  sku: string;

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 50,
    default: 0,
    required: false,
  })
  @IsNumber()
  @Min(0, { message: 'O estoque deve ser maior ou igual a 0' })
  @IsOptional()
  estoque?: number;

  @ApiProperty({
    description: 'Categoria do produto',
    example: 'Eletrônicos',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoria?: string;
}
