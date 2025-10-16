import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RelatoriosService } from './relatorios.service';
import { Venda } from '../vendas/entities/venda.entity';

describe('RelatoriosService', () => {
  let service: RelatoriosService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  const mockVendaRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatoriosService,
        {
          provide: getRepositoryToken(Venda),
          useValue: mockVendaRepository,
        },
      ],
    }).compile();

    service = module.get<RelatoriosService>(RelatoriosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRankingVendedores', () => {
    it('deve retornar ranking de vendedores ordenado por total de vendas', async () => {
      const mockRanking = [
        {
          vendedorId: '1',
          vendedorNome: 'João Silva',
          totalVendas: 10000,
          quantidadeVendas: 20,
          totalComissoes: 500,
          ticketMedio: 500,
        },
        {
          vendedorId: '2',
          vendedorNome: 'Maria Santos',
          totalVendas: 8000,
          quantidadeVendas: 15,
          totalComissoes: 400,
          ticketMedio: 533.33,
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockRanking);

      const result = await service.getRankingVendedores(10);

      expect(result).toEqual(mockRanking);
      expect(mockVendaRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result[0].totalVendas).toBeGreaterThan(result[1].totalVendas);
    });

    it('deve aplicar filtro de data ao ranking', async () => {
      const dataInicio = '2025-01-01';
      const dataFim = '2025-01-31';

      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getRankingVendedores(10, dataInicio, dataFim);

      expect(mockVendaRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('deve limitar a quantidade de resultados', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getRankingVendedores(5);

      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('getRelatorioMensal', () => {
    it('deve retornar relatório mensal completo', async () => {
      const mes = 10;
      const ano = 2025;

      const mockRelatorio = {
        totalVendas: '50000',
        quantidadeVendas: '100',
        totalComissoes: '2500',
        ticketMedio: '500',
      };

      const mockVendedores = [
        {
          vendedorId: '1',
          vendedorNome: 'João Silva',
          totalVendas: '30000',
          quantidadeVendas: '60',
          totalComissoes: '1500',
        },
      ];

      mockQueryBuilder.getRawOne.mockResolvedValueOnce(mockRelatorio);

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockVendedores);

      const result = await service.getRelatorioMensal(mes, ano);

      expect(result).toHaveProperty('mes', mes);
      expect(result).toHaveProperty('ano', ano);
      expect(result).toHaveProperty('totalVendas');
      expect(result).toHaveProperty('vendedores');
    });

    it('deve calcular ticket médio corretamente', async () => {
      const totalVendas = 10000;
      const quantidadeVendas = 20;
      const ticketMedioEsperado = 500;

      const ticketMedio = totalVendas / quantidadeVendas;
      expect(ticketMedio).toBe(ticketMedioEsperado);
    });

    it('deve lançar erro para mês inválido', async () => {
      await expect(service.getRelatorioMensal(13, 2025)).rejects.toThrow();
      await expect(service.getRelatorioMensal(0, 2025)).rejects.toThrow();
    });

    it('deve lançar erro para ano inválido', async () => {
      await expect(service.getRelatorioMensal(10, 1999)).rejects.toThrow();
      await expect(service.getRelatorioMensal(10, 2101)).rejects.toThrow();
    });
  });

  describe('getComissoes', () => {
    it('deve retornar comissões de todos os vendedores', async () => {
      const mockComissoes = [
        {
          vendedorId: '1',
          vendedorNome: 'João Silva',
          vendedorEmail: 'joao@example.com',
          percentualComissao: 5,
          totalComissoes: 1500,
          totalVendas: 30000,
          quantidadeVendas: 60,
        },
        {
          vendedorId: '2',
          vendedorNome: 'Maria Santos',
          vendedorEmail: 'maria@example.com',
          percentualComissao: 10,
          totalComissoes: 1000,
          totalVendas: 20000,
          quantidadeVendas: 40,
        },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockComissoes);

      const result = await service.getComissoes();

      expect(result).toEqual(mockComissoes);
      expect(mockVendaRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('deve filtrar comissões por vendedor específico', async () => {
      const vendedorId = '123';
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getComissoes(vendedorId);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('venda.vendedorId = :vendedorId', {
        vendedorId,
      });
    });
  });

  describe('getDashboard', () => {
    it('deve retornar estatísticas do dashboard', async () => {
      const mockStatsHoje = {
        totalVendas: '1000',
        totalComissoes: '50',
        quantidadeVendas: '5',
        ticketMedio: '200',
      };

      const mockStatsMes = {
        totalVendas: '50000',
        totalComissoes: '2500',
        quantidadeVendas: '100',
        ticketMedio: '500',
      };

      const mockTopVendedores: any[] = [];

      mockQueryBuilder.getRawOne
        .mockResolvedValueOnce(mockStatsHoje)
        .mockResolvedValueOnce(mockStatsMes);

      mockQueryBuilder.getRawMany.mockResolvedValueOnce(mockTopVendedores);

      const result = await service.getDashboard();

      expect(result).toHaveProperty('vendasHoje');
      expect(result).toHaveProperty('vendasMes');
      expect(result).toHaveProperty('comissoesHoje');
      expect(result).toHaveProperty('comissoesMes');
      expect(result).toHaveProperty('ticketMedioHoje');
      expect(result).toHaveProperty('ticketMedioMes');
      expect(result).toHaveProperty('topVendedoresMes');
    });
  });
});
