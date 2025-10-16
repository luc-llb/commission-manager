import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateVendedorDto } from './create-vendedor.dto';

export class UpdateVendedorDto extends PartialType(CreateVendedorDto) {
  @ApiProperty({
    description: 'Status ativo/inativo do vendedor',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}
