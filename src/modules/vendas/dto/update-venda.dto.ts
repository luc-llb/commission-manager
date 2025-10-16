import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateVendaDto } from './create-venda.dto';

export class UpdateVendaDto extends PartialType(CreateVendaDto) {
  @ApiProperty({
    description: 'Status da venda',
    example: 'finalizada',
    enum: ['finalizada', 'cancelada', 'pendente'],
    required: false,
  })
  @IsEnum(['finalizada', 'cancelada', 'pendente'], {
    message: 'Status deve ser: finalizada, cancelada ou pendente',
  })
  @IsOptional()
  status?: string;
}
