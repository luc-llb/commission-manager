import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from './entities/vendedor.entity';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';

/**
 * Service responsável pela lógica de negócio dos vendedores
 * Segue o princípio Single Responsibility: apenas gerencia vendedores
 */
@Injectable()
export class VendedoresService {
  constructor(
    @InjectRepository(Vendedor)
    private vendedorRepository: Repository<Vendedor>,
  ) {}

  /**
   * Cria um novo vendedor
   * Valida se email e CPF já existem
   */
  async create(createVendedorDto: CreateVendedorDto): Promise<Vendedor> {
    await this.validateUniqueFields(createVendedorDto.email, createVendedorDto.cpf);

    const vendedor = this.vendedorRepository.create(createVendedorDto);
    return this.vendedorRepository.save(vendedor);
  }

  /**
   * Lista todos os vendedores
   * Opcionalmente filtra por status ativo
   */
  async findAll(ativo?: boolean): Promise<Vendedor[]> {
    const where = ativo !== undefined ? { ativo } : {};
    return this.vendedorRepository.find({
      where,
      order: { nome: 'ASC' },
    });
  }

  /**
   * Busca um vendedor por ID
   * Lança NotFoundException se não encontrar
   */
  async findOne(id: string): Promise<Vendedor> {
    this.validateUuid(id);

    const vendedor = await this.vendedorRepository.findOne({ where: { id } });

    if (!vendedor) {
      throw new NotFoundException(`Vendedor com ID ${id} não encontrado`);
    }

    return vendedor;
  }

  /**
   * Atualiza um vendedor
   * Valida unicidade de email e CPF se forem alterados
   */
  async update(id: string, updateVendedorDto: UpdateVendedorDto): Promise<Vendedor> {
    this.validateUuid(id);

    const vendedor = await this.findOne(id);

    // Valida email único se foi alterado
    if (updateVendedorDto.email && updateVendedorDto.email !== vendedor.email) {
      await this.validateUniqueEmail(updateVendedorDto.email);
    }

    // Valida CPF único se foi alterado
    if (updateVendedorDto.cpf && updateVendedorDto.cpf !== vendedor.cpf) {
      await this.validateUniqueCpf(updateVendedorDto.cpf);
    }

    await this.vendedorRepository.update(id, updateVendedorDto);
    return this.findOne(id);
  }

  /**
   * Remove um vendedor (soft delete - apenas marca como inativo)
   */
  async remove(id: string): Promise<void> {
    this.validateUuid(id);

    const result = await this.vendedorRepository.update(id, { ativo: false });

    if (result.affected === 0) {
      throw new NotFoundException(`Vendedor com ID ${id} não encontrado`);
    }
  }

  /**
   * Remove fisicamente um vendedor do banco (hard delete)
   */
  async hardDelete(id: string): Promise<void> {
    this.validateUuid(id);

    const result = await this.vendedorRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Vendedor com ID ${id} não encontrado`);
    }
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
   * Valida se email e CPF são únicos
   */
  private async validateUniqueFields(email: string, cpf: string): Promise<void> {
    await this.validateUniqueEmail(email);
    await this.validateUniqueCpf(cpf);
  }

  /**
   * Valida se o email já está cadastrado
   */
  private async validateUniqueEmail(email: string): Promise<void> {
    const existingEmail = await this.vendedorRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException(`Email ${email} já está cadastrado`);
    }
  }

  /**
   * Valida se o CPF já está cadastrado
   */
  private async validateUniqueCpf(cpf: string): Promise<void> {
    const existingCpf = await this.vendedorRepository.findOne({ where: { cpf } });
    if (existingCpf) {
      throw new ConflictException(`CPF ${cpf} já está cadastrado`);
    }
  }
}
