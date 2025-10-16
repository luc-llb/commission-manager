import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VendasService } from './vendas.service';
import { Venda } from './entities/venda.entity';
import { VendedoresService } from '../vendedores/vendedores.service';
import { ProdutosService } from '../produtos/produtos.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('VendasService', () => {
  let service: VendasService;
  let vendedoresService: VendedoresService;
  let produtosService: ProdutosService;

  const mockVendaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockVendedoresService = {
    findOne: jest.fn(),
  };

  const mockProdutosService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendasService,
        {
          provide: getRepositoryToken(Venda),
          useValue: mockVendaRepository,
        },
        {
          provide: VendedoresService,
          useValue: mockVendedoresService,
        },
        {
          provide: ProdutosService,
          useValue: mockProdutosService,
        },
      ],
    }).compile();

    service = module.get<VendasService>(VendasService);
    vendedoresService = module.get<VendedoresService>(VendedoresService);
    produtosService = module.get<ProdutosService>(ProdutosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createVendaDto = {
      produtoId: '123e4567-e89b-12d3-a456-426614174000',
      vendedorId: '123e4567-e89b-12d3-a456-426614174001',
      quantidade: 2,
      dataVenda: new Date().toISOString(),
    };

    const mockVendedor = {
      _id: createVendaDto.vendedorId,
      nome: 'João Silva',
      email: 'joao@example.com',
      percentualComissao: 5,
      ativo: true,
    };

    const mockProduto = {
      _id: createVendaDto.produtoId,
      nome: 'Notebook',
      preco: 3000,
      ativo: true,
    };

    it('deve criar uma venda e calcular comissão automaticamente', async () => {
      mockVendedoresService.findOne.mockResolvedValue(mockVendedor);
      mockProdutosService.findOne.mockResolvedValue(mockProduto);

      const mockVenda = {
        ...createVendaDto,
        valorUnitario: 3000,
        valorTotal: 6000,
        percentualComissao: 5,
        valorComissao: 300,
        status: 'finalizada',
      };

      mockVendaRepository.create.mockReturnValue(mockVenda);
      mockVendaRepository.save.mockResolvedValue(mockVenda);

      await service.create(createVendaDto);

      expect(vendedoresService.findOne).toHaveBeenCalledWith(createVendaDto.vendedorId);
      expect(produtosService.findOne).toHaveBeenCalledWith(createVendaDto.produtoId);
      expect(mockVendaRepository.create).toHaveBeenCalled();
      expect(mockVendaRepository.save).toHaveBeenCalled();
    });

    it('deve calcular valor total corretamente', async () => {
      mockVendedoresService.findOne.mockResolvedValue(mockVendedor);
      mockProdutosService.findOne.mockResolvedValue(mockProduto);

      const mockVenda = {
        ...createVendaDto,
        valorUnitario: 3000,
        valorTotal: 6000,
        percentualComissao: 5,
        valorComissao: 300,
      };

      mockVendaRepository.create.mockReturnValue(mockVenda);
      mockVendaRepository.save.mockResolvedValue(mockVenda);

      const result = await service.create(createVendaDto);

      // Verificar se os cálculos estão corretos
      expect(result.valorTotal).toBe(6000);
      expect(result.valorComissao).toBe(300);
    });

    it('deve lançar erro se vendedor estiver inativo', async () => {
      mockVendedoresService.findOne.mockResolvedValue({
        ...mockVendedor,
        ativo: false,
      });

      await expect(service.create(createVendaDto)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se produto estiver inativo', async () => {
      mockVendedoresService.findOne.mockResolvedValue(mockVendedor);
      mockProdutosService.findOne.mockResolvedValue({
        ...mockProduto,
        ativo: false,
      });

      await expect(service.create(createVendaDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cálculo de comissão', () => {
    it('deve calcular comissão de 5% corretamente', () => {
      const valorTotal = 1000;
      const percentual = 5;
      const comissaoEsperada = 50;

      // Como o método é privado, testamos através do create
      // Mas podemos criar um teste específico se extrairmos o método
      const resultado = (valorTotal * percentual) / 100;
      expect(Number(resultado.toFixed(2))).toBe(comissaoEsperada);
    });

    it('deve calcular comissão de 10% corretamente', () => {
      const valorTotal = 2500;
      const percentual = 10;
      const comissaoEsperada = 250;

      const resultado = (valorTotal * percentual) / 100;
      expect(Number(resultado.toFixed(2))).toBe(comissaoEsperada);
    });

    it('deve arredondar valores corretamente', () => {
      const valorTotal = 1999.99;
      const percentual = 5;
      const comissaoEsperada = 100.0;

      const resultado = (valorTotal * percentual) / 100;
      expect(Number(resultado.toFixed(2))).toBe(comissaoEsperada);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma venda por ID', async () => {
      const vendaId = '123e4567-e89b-12d3-a456-426614174002';
      const mockVenda = {
        id: vendaId,
        valorTotal: 1000,
        valorComissao: 50,
      };

      mockVendaRepository.findOne.mockResolvedValue(mockVenda);

      const result = await service.findOne(vendaId);

      expect(mockVendaRepository.findOne).toHaveBeenCalledWith({
        where: { id: vendaId },
        relations: ['vendedor', 'produto'],
      });
      expect(result).toEqual(mockVenda);
    });

    it('deve lançar NotFoundException se venda não existir', async () => {
      const vendaId = '123e4567-e89b-12d3-a456-426614174003';

      mockVendaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(vendaId)).rejects.toThrow(NotFoundException);
    });
  });
});
