import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Produto } from '../../produtos/entities/produto.entity';
import { Vendedor } from '../../vendedores/entities/vendedor.entity';

@Entity('vendas')
@Index(['vendedor', 'dataVenda'])
@Index(['produto', 'dataVenda'])
@Index(['dataVenda'])
@Index(['status'])
export class Venda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Produto, { eager: true })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto;

  @Column({ name: 'produto_id' })
  produtoId: string;

  @ManyToOne(() => Vendedor, { eager: true })
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Vendedor;

  @Column({ name: 'vendedor_id' })
  vendedorId: string;

  @Column({ type: 'int' })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentualComissao: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorComissao: number;

  @Column({ type: 'timestamp' })
  dataVenda: Date;

  @Column({ type: 'text', nullable: true })
  observacao: string;

  @Column({ type: 'enum', enum: ['finalizada', 'cancelada', 'pendente'], default: 'finalizada' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
