import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VendedoresService } from './vendedores.service';
import { Vendedor } from './entities/vendedor.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('VendedoresService', () => {
  let service: VendedoresService;

  const mockVendedorRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendedoresService,
        {
          provide: getRepositoryToken(Vendedor),
          useValue: mockVendedorRepository,
        },
      ],
    }).compile();

    service = module.get<VendedoresService>(VendedoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createVendedorDto = {
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '12345678900',
      telefone: '11987654321',
      percentualComissao: 5,
    };

    it('deve criar um vendedor com sucesso', async () => {
      mockVendedorRepository.findOne.mockResolvedValue(null); // email não existe
      mockVendedorRepository.findOne.mockResolvedValue(null); // cpf não existe
      mockVendedorRepository.create.mockReturnValue(createVendedorDto);
      mockVendedorRepository.save.mockResolvedValue(createVendedorDto);

      const result = await service.create(createVendedorDto);

      expect(mockVendedorRepository.save).toHaveBeenCalled();
      expect(result).toEqual(createVendedorDto);
    });

    it('deve lançar ConflictException se email já existir', async () => {
      mockVendedorRepository.findOne.mockResolvedValueOnce({
        email: createVendedorDto.email,
      });

      await expect(service.create(createVendedorDto)).rejects.toThrow(ConflictException);
    });

    it('deve lançar ConflictException se CPF já existir', async () => {
      mockVendedorRepository.findOne
        .mockResolvedValueOnce(null) // email não existe
        .mockResolvedValueOnce({ cpf: createVendedorDto.cpf }); // cpf existe

      await expect(service.create(createVendedorDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os vendedores', async () => {
      const mockVendedores = [
        { nome: 'João', email: 'joao@example.com', ativo: true },
        { nome: 'Maria', email: 'maria@example.com', ativo: true },
      ];

      mockVendedorRepository.find.mockResolvedValue(mockVendedores);

      const result = await service.findAll();

      expect(result).toEqual(mockVendedores);
      expect(mockVendedorRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { nome: 'ASC' },
      });
    });

    it('deve filtrar vendedores ativos', async () => {
      mockVendedorRepository.find.mockResolvedValue([]);

      await service.findAll(true);

      expect(mockVendedorRepository.find).toHaveBeenCalledWith({
        where: { ativo: true },
        order: { nome: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um vendedor por ID', async () => {
      const vendedorId = '123e4567-e89b-12d3-a456-426614174000';
      const mockVendedor = {
        id: vendedorId,
        nome: 'João Silva',
        email: 'joao@example.com',
      };

      mockVendedorRepository.findOne.mockResolvedValue(mockVendedor);

      const result = await service.findOne(vendedorId);

      expect(result).toEqual(mockVendedor);
      expect(mockVendedorRepository.findOne).toHaveBeenCalledWith({
        where: { id: vendedorId },
      });
    });

    it('deve lançar NotFoundException se vendedor não existir', async () => {
      const vendedorId = '123e4567-e89b-12d3-a456-426614174000';

      mockVendedorRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(vendedorId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um vendedor', async () => {
      const vendedorId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto = { nome: 'João Silva Atualizado' };
      const vendedorExistente = {
        id: vendedorId,
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf: '12345678900',
      };
      const vendedorAtualizado = { ...vendedorExistente, ...updateDto };

      mockVendedorRepository.findOne.mockResolvedValueOnce(vendedorExistente);
      mockVendedorRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockVendedorRepository.findOne.mockResolvedValueOnce(vendedorAtualizado);

      const result = await service.update(vendedorId, updateDto);

      expect(result.nome).toBe(updateDto.nome);
      expect(mockVendedorRepository.update).toHaveBeenCalledWith(vendedorId, updateDto);
    });
  });

  describe('remove', () => {
    it('deve marcar vendedor como inativo (soft delete)', async () => {
      const vendedorId = '123e4567-e89b-12d3-a456-426614174000';

      mockVendedorRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.remove(vendedorId);

      expect(mockVendedorRepository.update).toHaveBeenCalledWith(vendedorId, {
        ativo: false,
      });
    });
  });
});
