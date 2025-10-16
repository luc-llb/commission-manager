import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Venda } from './entities/venda.entity';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';
import { VendedoresService } from '../vendedores/vendedores.service';
import { ProdutosService } from '../produtos/produtos.service';

/**
 * Interface para filtros de busca
 */
interface FindAllFilters {
  vendedorId?: string;
  produtoId?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}

/**
 * Service responsável pela lógica de negócio das vendas
 * Implementa o cálculo automático de comissões
 * Segue o princípio de Single Responsibility e Dependency Inversion
 */
@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda)
    private vendaRepository: Repository<Venda>,
    private vendedoresService: VendedoresService,
    private produtosService: ProdutosService,
  ) {}

  /**
   * Cria uma nova venda
   * Calcula automaticamente: valor total, percentual de comissão e valor da comissão
   */
  async create(createVendaDto: CreateVendaDto): Promise<Venda> {
    // Valida e busca o vendedor
    const vendedor = await this.vendedoresService.findOne(createVendaDto.vendedorId);

    if (!vendedor.ativo) {
      throw new BadRequestException('Vendedor inativo não pode realizar vendas');
    }

    // Valida e busca o produto
    const produto = await this.produtosService.findOne(createVendaDto.produtoId);

    if (!produto.ativo) {
      throw new BadRequestException('Produto inativo não pode ser vendido');
    }

    // Calcula os valores da venda
    const valorUnitario = Number(produto.preco);
    const valorTotal = this.calcularValorTotal(valorUnitario, createVendaDto.quantidade);
    const percentualComissao = Number(vendedor.percentualComissao);
    const valorComissao = this.calcularComissao(valorTotal, percentualComissao);

    // Cria a venda com todos os valores calculados
    const venda = this.vendaRepository.create({
      ...createVendaDto,
      produtoId: createVendaDto.produtoId,
      vendedorId: createVendaDto.vendedorId,
      valorUnitario,
      valorTotal,
      percentualComissao,
      valorComissao,
      dataVenda: new Date(createVendaDto.dataVenda),
      status: 'finalizada',
    });

    return this.vendaRepository.save(venda);
  }

  /**
   * Lista todas as vendas com filtros opcionais
   * Aplica o princípio Open/Closed - aberto para extensão de filtros
   */
  async findAll(filters: FindAllFilters = {}): Promise<Venda[]> {
    const where: any = {};

    // Aplica filtros
    if (filters.vendedorId) {
      this.validateUuid(filters.vendedorId);
      where.vendedorId = filters.vendedorId;
    }

    if (filters.produtoId) {
      this.validateUuid(filters.produtoId);
      where.produtoId = filters.produtoId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Filtro de data
    if (filters.dataInicio && filters.dataFim) {
      where.dataVenda = Between(new Date(filters.dataInicio), new Date(filters.dataFim));
    } else if (filters.dataInicio) {
      where.dataVenda = MoreThanOrEqual(new Date(filters.dataInicio));
    } else if (filters.dataFim) {
      where.dataVenda = LessThanOrEqual(new Date(filters.dataFim));
    }

    return this.vendaRepository.find({
      where,
      relations: ['vendedor', 'produto'],
      order: { dataVenda: 'DESC' },
    });
  }

  /**
   * Busca uma venda por ID com dados populados
   */
  async findOne(id: string): Promise<Venda> {
    this.validateUuid(id);

    const venda = await this.vendaRepository.findOne({
      where: { id },
      relations: ['vendedor', 'produto'],
    });

    if (!venda) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada`);
    }

    return venda;
  }

  /**
   * Atualiza uma venda
   * Recalcula comissão se quantidade ou produto forem alterados
   */
  async update(id: string, updateVendaDto: UpdateVendaDto): Promise<Venda> {
    this.validateUuid(id);

    const vendaAtual = await this.findOne(id);

    // Se alterar quantidade ou produto, recalcula valores
    if (updateVendaDto.quantidade || updateVendaDto.produtoId) {
      const produto = updateVendaDto.produtoId
        ? await this.produtosService.findOne(updateVendaDto.produtoId)
        : await this.produtosService.findOne(vendaAtual.produtoId);

      const quantidade = updateVendaDto.quantidade || vendaAtual.quantidade;
      const valorUnitario = Number(produto.preco);
      const valorTotal = this.calcularValorTotal(valorUnitario, quantidade);
      const valorComissao = this.calcularComissao(
        valorTotal,
        Number(vendaAtual.percentualComissao),
      );

      Object.assign(updateVendaDto, {
        valorUnitario,
        valorTotal,
        valorComissao,
      });
    }

    await this.vendaRepository.update(id, updateVendaDto);
    return this.findOne(id);
  }

  /**
   * Cancela uma venda (soft delete)
   */
  async remove(id: string): Promise<void> {
    this.validateUuid(id);

    const result = await this.vendaRepository.update(id, { status: 'cancelada' });

    if (result.affected === 0) {
      throw new NotFoundException(`Venda com ID ${id} não encontrada`);
    }
  }

  /**
   * Calcula o valor total da venda
   * Método isolado para facilitar testes
   */
  private calcularValorTotal(valorUnitario: number, quantidade: number): number {
    return Number((valorUnitario * quantidade).toFixed(2));
  }

  /**
   * Calcula o valor da comissão baseado no percentual
   * Método isolado para facilitar testes unitários
   */
  private calcularComissao(valorTotal: number, percentualComissao: number): number {
    return Number(((valorTotal * percentualComissao) / 100).toFixed(2));
  }

  /**
   * Valida se o ID é um UUID válido
   */
  private validateUuid(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException(`ID ${id} inválido`);
    }
  }
}
