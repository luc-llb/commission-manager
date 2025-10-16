import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venda } from '../vendas/entities/venda.entity';

/**
 * Interface para dados do ranking
 */
export interface RankingVendedor {
  vendedorId: string;
  vendedorNome: string;
  totalVendas: number;
  quantidadeVendas: number;
  totalComissoes: number;
  ticketMedio: number;
}

/**
 * Interface para relatório mensal
 */
export interface RelatorioMensal {
  mes: number;
  ano: number;
  totalVendas: number;
  quantidadeVendas: number;
  totalComissoes: number;
  ticketMedio: number;
  vendedores: any[];
}

/**
 * Interface para dashboard
 */
export interface Dashboard {
  vendasHoje: number;
  vendasMes: number;
  comissoesHoje: number;
  comissoesMes: number;
  ticketMedioHoje: number;
  ticketMedioMes: number;
  topVendedoresMes: RankingVendedor[];
}

/**
 * Service responsável pela geração de relatórios e análises
 * Segue o princípio Single Responsibility: apenas gera relatórios
 */
@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Venda)
    private vendaRepository: Repository<Venda>,
  ) {}

  /**
   * Gera ranking de vendedores por valor total vendido
   * Usa QueryBuilder do TypeORM para performance
   */
  async getRankingVendedores(
    limite: number = 10,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<RankingVendedor[]> {
    let query = this.vendaRepository
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.vendedor', 'vendedor')
      .select('venda.vendedorId', 'vendedorId')
      .addSelect('vendedor.nome', 'vendedorNome')
      .addSelect('SUM(venda.valorTotal)', 'totalVendas')
      .addSelect('COUNT(venda.id)', 'quantidadeVendas')
      .addSelect('SUM(venda.valorComissao)', 'totalComissoes')
      .addSelect('AVG(venda.valorTotal)', 'ticketMedio')
      .where('venda.status = :status', { status: 'finalizada' });

    if (dataInicio) {
      query = query.andWhere('venda.dataVenda >= :dataInicio', {
        dataInicio: new Date(dataInicio),
      });
    }

    if (dataFim) {
      query = query.andWhere('venda.dataVenda <= :dataFim', {
        dataFim: new Date(dataFim),
      });
    }

    const ranking = await query
      .groupBy('venda.vendedorId')
      .addGroupBy('vendedor.nome')
      .orderBy('totalVendas', 'DESC')
      .limit(limite)
      .getRawMany();

    return ranking.map((item) => ({
      vendedorId: item.vendedorId,
      vendedorNome: item.vendedorNome,
      totalVendas: Number(Number(item.totalVendas).toFixed(2)),
      quantidadeVendas: Number(item.quantidadeVendas),
      totalComissoes: Number(Number(item.totalComissoes).toFixed(2)),
      ticketMedio: Number(Number(item.ticketMedio).toFixed(2)),
    }));
  }

  /**
   * Gera relatório mensal completo
   * Inclui total de vendas, comissões, ticket médio e performance por vendedor
   */
  async getRelatorioMensal(mes: number, ano: number): Promise<RelatorioMensal> {
    this.validateMesAno(mes, ano);

    const { dataInicio, dataFim } = this.getDatasPeriodo(mes, ano);

    // Relatório geral do mês
    const relatorioGeral = await this.vendaRepository
      .createQueryBuilder('venda')
      .select('SUM(venda.valorTotal)', 'totalVendas')
      .addSelect('COUNT(venda.id)', 'quantidadeVendas')
      .addSelect('SUM(venda.valorComissao)', 'totalComissoes')
      .addSelect('AVG(venda.valorTotal)', 'ticketMedio')
      .where('venda.dataVenda >= :dataInicio', { dataInicio })
      .andWhere('venda.dataVenda <= :dataFim', { dataFim })
      .andWhere('venda.status = :status', { status: 'finalizada' })
      .getRawOne();

    // Desempenho por vendedor no mês
    const vendedores = await this.vendaRepository
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.vendedor', 'vendedor')
      .select('venda.vendedorId', 'vendedorId')
      .addSelect('vendedor.nome', 'vendedorNome')
      .addSelect('SUM(venda.valorTotal)', 'totalVendas')
      .addSelect('COUNT(venda.id)', 'quantidadeVendas')
      .addSelect('SUM(venda.valorComissao)', 'totalComissoes')
      .where('venda.dataVenda >= :dataInicio', { dataInicio })
      .andWhere('venda.dataVenda <= :dataFim', { dataFim })
      .andWhere('venda.status = :status', { status: 'finalizada' })
      .groupBy('venda.vendedorId')
      .addGroupBy('vendedor.nome')
      .orderBy('totalVendas', 'DESC')
      .getRawMany();

    const resultado = relatorioGeral || {
      totalVendas: 0,
      quantidadeVendas: 0,
      totalComissoes: 0,
      ticketMedio: 0,
    };

    return {
      mes,
      ano,
      totalVendas: Number(Number(resultado.totalVendas || 0).toFixed(2)),
      quantidadeVendas: Number(resultado.quantidadeVendas || 0),
      totalComissoes: Number(Number(resultado.totalComissoes || 0).toFixed(2)),
      ticketMedio: Number(Number(resultado.ticketMedio || 0).toFixed(2)),
      vendedores: vendedores.map((v) => ({
        vendedorId: v.vendedorId,
        vendedorNome: v.vendedorNome,
        totalVendas: Number(Number(v.totalVendas).toFixed(2)),
        quantidadeVendas: Number(v.quantidadeVendas),
        totalComissoes: Number(Number(v.totalComissoes).toFixed(2)),
      })),
    };
  }

  /**
   * Retorna total de comissões por vendedor
   */
  async getComissoes(vendedorId?: string, dataInicio?: string, dataFim?: string): Promise<any[]> {
    let query = this.vendaRepository
      .createQueryBuilder('venda')
      .leftJoinAndSelect('venda.vendedor', 'vendedor')
      .select('venda.vendedorId', 'vendedorId')
      .addSelect('vendedor.nome', 'vendedorNome')
      .addSelect('vendedor.email', 'vendedorEmail')
      .addSelect('vendedor.percentualComissao', 'percentualComissao')
      .addSelect('SUM(venda.valorComissao)', 'totalComissoes')
      .addSelect('SUM(venda.valorTotal)', 'totalVendas')
      .addSelect('COUNT(venda.id)', 'quantidadeVendas')
      .where('venda.status = :status', { status: 'finalizada' });

    if (vendedorId) {
      query = query.andWhere('venda.vendedorId = :vendedorId', { vendedorId });
    }

    if (dataInicio) {
      query = query.andWhere('venda.dataVenda >= :dataInicio', {
        dataInicio: new Date(dataInicio),
      });
    }

    if (dataFim) {
      query = query.andWhere('venda.dataVenda <= :dataFim', {
        dataFim: new Date(dataFim),
      });
    }

    const comissoes = await query
      .groupBy('venda.vendedorId')
      .addGroupBy('vendedor.nome')
      .addGroupBy('vendedor.email')
      .addGroupBy('vendedor.percentualComissao')
      .orderBy('totalComissoes', 'DESC')
      .getRawMany();

    return comissoes.map((item) => ({
      vendedorId: item.vendedorId,
      vendedorNome: item.vendedorNome,
      vendedorEmail: item.vendedorEmail,
      percentualComissao: Number(item.percentualComissao),
      totalComissoes: Number(Number(item.totalComissoes).toFixed(2)),
      totalVendas: Number(Number(item.totalVendas).toFixed(2)),
      quantidadeVendas: Number(item.quantidadeVendas),
    }));
  }

  /**
   * Retorna dashboard com estatísticas gerais
   */
  async getDashboard(): Promise<Dashboard> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

    // Estatísticas do dia
    const statsHoje = await this.getEstatisticasPeriodo(hoje, amanha);

    // Estatísticas do mês
    const statsMes = await this.getEstatisticasPeriodo(primeiroDiaMes, proximoMes);

    // Top vendedores do mês
    const topVendedores = await this.getRankingVendedores(
      5,
      primeiroDiaMes.toISOString(),
      proximoMes.toISOString(),
    );

    return {
      vendasHoje: statsHoje.totalVendas,
      vendasMes: statsMes.totalVendas,
      comissoesHoje: statsHoje.totalComissoes,
      comissoesMes: statsMes.totalComissoes,
      ticketMedioHoje: statsHoje.ticketMedio,
      ticketMedioMes: statsMes.ticketMedio,
      topVendedoresMes: topVendedores,
    };
  }

  /**
   * Retorna estatísticas de um período específico
   */
  private async getEstatisticasPeriodo(dataInicio: Date, dataFim: Date): Promise<any> {
    const stats = await this.vendaRepository
      .createQueryBuilder('venda')
      .select('SUM(venda.valorTotal)', 'totalVendas')
      .addSelect('SUM(venda.valorComissao)', 'totalComissoes')
      .addSelect('COUNT(venda.id)', 'quantidadeVendas')
      .addSelect('AVG(venda.valorTotal)', 'ticketMedio')
      .where('venda.dataVenda >= :dataInicio', { dataInicio })
      .andWhere('venda.dataVenda < :dataFim', { dataFim })
      .andWhere('venda.status = :status', { status: 'finalizada' })
      .getRawOne();

    return {
      totalVendas: Number(Number(stats?.totalVendas || 0).toFixed(2)),
      totalComissoes: Number(Number(stats?.totalComissoes || 0).toFixed(2)),
      quantidadeVendas: Number(stats?.quantidadeVendas || 0),
      ticketMedio: Number(Number(stats?.ticketMedio || 0).toFixed(2)),
    };
  }

  /**
   * Valida mês e ano
   */
  private validateMesAno(mes: number, ano: number): void {
    if (mes < 1 || mes > 12) {
      throw new BadRequestException('Mês deve estar entre 1 e 12');
    }

    if (ano < 2000 || ano > 2100) {
      throw new BadRequestException('Ano inválido');
    }
  }

  /**
   * Retorna datas de início e fim do mês
   */
  private getDatasPeriodo(mes: number, ano: number): { dataInicio: Date; dataFim: Date } {
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999);

    return { dataInicio, dataFim };
  }
}
