import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('ranking')
  @ApiOperation({ summary: 'Ranking de vendedores por valor total vendido' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ranking retornado com sucesso' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Limite de resultados' })
  @ApiQuery({
    name: 'dataInicio',
    required: false,
    type: String,
    description: 'Data inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'dataFim',
    required: false,
    type: String,
    description: 'Data final (YYYY-MM-DD)',
  })
  async getRanking(
    @Query('limite') limite?: string | number,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const limiteNumero = limite ? Number(limite) : undefined;
    return this.relatoriosService.getRankingVendedores(limiteNumero, dataInicio, dataFim);
  }

  @Get('mensal')
  @ApiOperation({ summary: 'Relatório mensal de vendas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Relatório retornado com sucesso' })
  @ApiQuery({ name: 'mes', required: true, type: Number, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'ano', required: true, type: Number, description: 'Ano (ex: 2025)' })
  async getRelatorioMensal(@Query('mes') mes: string | number, @Query('ano') ano: string | number) {
    return this.relatoriosService.getRelatorioMensal(Number(mes), Number(ano));
  }

  @Get('comissoes')
  @ApiOperation({ summary: 'Total de comissões por vendedor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comissões retornadas com sucesso' })
  @ApiQuery({ name: 'vendedorId', required: false, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  async getComissoes(
    @Query('vendedorId') vendedorId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.relatoriosService.getComissoes(vendedorId, dataInicio, dataFim);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard com estatísticas gerais' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard retornado com sucesso' })
  async getDashboard() {
    return this.relatoriosService.getDashboard();
  }
}
