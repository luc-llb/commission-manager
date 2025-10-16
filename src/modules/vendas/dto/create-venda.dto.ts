import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVendaDto {
  @ApiProperty({
    description: 'ID do produto vendido',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'ID do produto inválido' })
  @IsNotEmpty({ message: 'O ID do produto é obrigatório' })
  produtoId: string;

  @ApiProperty({
    description: 'ID do vendedor responsável',
    example: '507f1f77bcf86cd799439012',
  })
  @IsMongoId({ message: 'ID do vendedor inválido' })
  @IsNotEmpty({ message: 'O ID do vendedor é obrigatório' })
  vendedorId: string;

  @ApiProperty({
    description: 'Quantidade vendida',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'A quantidade deve ser no mínimo 1' })
  @IsNotEmpty({ message: 'A quantidade é obrigatória' })
  quantidade: number;

  @ApiProperty({
    description: 'Data da venda',
    example: '2025-10-16T10:30:00.000Z',
  })
  @IsDateString({}, { message: 'Data inválida' })
  @IsNotEmpty({ message: 'A data da venda é obrigatória' })
  dataVenda: string;

  @ApiProperty({
    description: 'Observações sobre a venda',
    example: 'Venda com desconto de 10%',
    required: false,
  })
  @IsString()
  @IsOptional()
  observacao?: string;
}
