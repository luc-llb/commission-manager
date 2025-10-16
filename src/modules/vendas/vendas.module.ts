import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';
import { Venda } from './entities/venda.entity';
import { VendedoresModule } from '../vendedores/vendedores.module';
import { ProdutosModule } from '../produtos/produtos.module';

@Module({
  imports: [TypeOrmModule.forFeature([Venda]), VendedoresModule, ProdutosModule],
  controllers: [VendasController],
  providers: [VendasService],
  exports: [VendasService],
})
export class VendasModule {}
