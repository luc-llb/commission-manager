import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VendasService } from './vendas.service';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';

@ApiTags('Vendas')
@ApiBearerAuth()
@Controller('vendas')
export class VendasController {
  constructor(private readonly vendasService: VendasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova venda (calcula comissão automaticamente)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Venda registrada com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Produto ou vendedor não encontrado' })
  create(@Body() createVendaDto: CreateVendaDto) {
    return this.vendasService.create(createVendaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as vendas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de vendas retornada com sucesso' })
  @ApiQuery({ name: 'vendedorId', required: false, type: String })
  @ApiQuery({ name: 'produtoId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  findAll(
    @Query('vendedorId') vendedorId?: string,
    @Query('produtoId') produtoId?: string,
    @Query('status') status?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.vendasService.findAll({
      vendedorId,
      produtoId,
      status,
      dataInicio,
      dataFim,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar venda por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Venda encontrada' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Venda não encontrada' })
  findOne(@Param('id') id: string) {
    return this.vendasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar venda' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Venda atualizada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Venda não encontrada' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateVendaDto: UpdateVendaDto) {
    return this.vendasService.update(id, updateVendaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar venda' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Venda cancelada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Venda não encontrada' })
  remove(@Param('id') id: string) {
    return this.vendasService.remove(id);
  }
}
