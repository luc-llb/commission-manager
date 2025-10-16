import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

/**
 * Service responsável pela lógica de negócio dos produtos
 * Segue o princípio Single Responsibility
 */
@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
  ) {}

  /**
   * Cria um novo produto
   * Valida se SKU já existe
   */
  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    await this.validateUniqueSku(createProdutoDto.sku);

    const produto = this.produtoRepository.create(createProdutoDto);
    return this.produtoRepository.save(produto);
  }

  /**
   * Lista todos os produtos
   * Opcionalmente filtra por status ativo e/ou categoria
   */
  async findAll(ativo?: boolean, categoria?: string): Promise<Produto[]> {
    const where: any = {};

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    if (categoria) {
      where.categoria = categoria;
    }

    return this.produtoRepository.find({
      where,
      order: { nome: 'ASC' },
    });
  }

  /**
   * Busca produtos por texto (nome ou descrição)
   * Usa LIKE para busca em MySQL
   */
  async search(query: string): Promise<Produto[]> {
    return this.produtoRepository.find({
      where: [{ nome: Like(`%${query}%`) }, { descricao: Like(`%${query}%`) }],
      order: { nome: 'ASC' },
    });
  }

  /**
   * Busca um produto por ID
   */
  async findOne(id: string): Promise<Produto> {
    this.validateUuid(id);

    const produto = await this.produtoRepository.findOne({ where: { id } });

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return produto;
  }

  /**
   * Atualiza um produto
   * Valida unicidade de SKU se for alterado
   */
  async update(id: string, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    this.validateUuid(id);

    const produto = await this.findOne(id);

    // Valida SKU único se foi alterado
    if (updateProdutoDto.sku && updateProdutoDto.sku !== produto.sku) {
      await this.validateUniqueSku(updateProdutoDto.sku);
    }

    await this.produtoRepository.update(id, updateProdutoDto);
    return this.findOne(id);
  }

  /**
   * Remove um produto (soft delete)
   */
  async remove(id: string): Promise<void> {
    this.validateUuid(id);

    const result = await this.produtoRepository.update(id, { ativo: false });

    if (result.affected === 0) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
  }

  /**
   * Atualiza o estoque de um produto
   * Usado internamente pelo módulo de vendas
   */
  async updateEstoque(id: string, quantidade: number): Promise<Produto> {
    this.validateUuid(id);

    const produto = await this.findOne(id);
    const novoEstoque = produto.estoque + quantidade;

    if (novoEstoque < 0) {
      throw new BadRequestException('Estoque insuficiente');
    }

    await this.produtoRepository.update(id, { estoque: novoEstoque });
    return this.findOne(id);
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

  /**
   * Valida se o SKU já está cadastrado
   */
  private async validateUniqueSku(sku: string): Promise<void> {
    const existingSku = await this.produtoRepository.findOne({ where: { sku } });
    if (existingSku) {
      throw new ConflictException(`SKU ${sku} já está cadastrado`);
    }
  }
}
