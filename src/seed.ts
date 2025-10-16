import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';
import { VendedoresService } from './modules/vendedores/vendedores.service';
import { ProdutosService } from './modules/produtos/produtos.service';
import { VendasService } from './modules/vendas/vendas.service';

/**
 * Script de seed para popular o banco com dados iniciais
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const vendedoresService = app.get(VendedoresService);
  const produtosService = app.get(ProdutosService);
  const vendasService = app.get(VendasService);

  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // 1. Cria usuário admin
    console.log('👤 Criando usuário admin...');
    await authService.createDefaultAdmin();
    console.log('✅ Usuário admin criado!\n');

    // 2. Cria vendedores
    console.log('👥 Criando vendedores...');
    const vendedores = [];

    const vendedor1 = await vendedoresService.create({
      nome: 'João Silva',
      email: 'joao.silva@example.com',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      percentualComissao: 5,
    });
    vendedores.push(vendedor1);
    console.log(`  ✓ ${vendedor1.nome} - Comissão: ${vendedor1.percentualComissao}%`);

    const vendedor2 = await vendedoresService.create({
      nome: 'Maria Santos',
      email: 'maria.santos@example.com',
      cpf: '987.654.321-00',
      telefone: '(11) 98765-1234',
      percentualComissao: 7,
    });
    vendedores.push(vendedor2);
    console.log(`  ✓ ${vendedor2.nome} - Comissão: ${vendedor2.percentualComissao}%`);

    const vendedor3 = await vendedoresService.create({
      nome: 'Pedro Oliveira',
      email: 'pedro.oliveira@example.com',
      cpf: '456.789.123-00',
      telefone: '(11) 98765-5678',
      percentualComissao: 10,
    });
    vendedores.push(vendedor3);
    console.log(`  ✓ ${vendedor3.nome} - Comissão: ${vendedor3.percentualComissao}%`);

    const vendedor4 = await vendedoresService.create({
      nome: 'Ana Costa',
      email: 'ana.costa@example.com',
      cpf: '321.654.987-00',
      telefone: '(11) 98765-9012',
      percentualComissao: 6,
    });
    vendedores.push(vendedor4);
    console.log(`  ✓ ${vendedor4.nome} - Comissão: ${vendedor4.percentualComissao}%\n`);

    // 3. Cria produtos
    console.log('📦 Criando produtos...');
    const produtos = [];

    const produto1 = await produtosService.create({
      nome: 'Notebook Dell Inspiron 15',
      descricao: 'Notebook com Intel Core i7, 16GB RAM, 512GB SSD',
      sku: 'NB-DELL-001',
      preco: 4500.0,
      categoria: 'Informática',
    });
    produtos.push(produto1);
    console.log(`  ✓ ${produto1.nome} - R$ ${produto1.preco.toFixed(2)}`);

    const produto2 = await produtosService.create({
      nome: 'Mouse Logitech MX Master 3',
      descricao: 'Mouse sem fio ergonômico',
      sku: 'MS-LOG-001',
      preco: 450.0,
      categoria: 'Periféricos',
    });
    produtos.push(produto2);
    console.log(`  ✓ ${produto2.nome} - R$ ${produto2.preco.toFixed(2)}`);

    const produto3 = await produtosService.create({
      nome: 'Teclado Mecânico Keychron K2',
      descricao: 'Teclado mecânico wireless 75%',
      sku: 'KB-KEY-001',
      preco: 650.0,
      categoria: 'Periféricos',
    });
    produtos.push(produto3);
    console.log(`  ✓ ${produto3.nome} - R$ ${produto3.preco.toFixed(2)}`);

    const produto4 = await produtosService.create({
      nome: 'Monitor LG UltraWide 29"',
      descricao: 'Monitor 29 polegadas, resolução 2560x1080',
      sku: 'MN-LG-001',
      preco: 1800.0,
      categoria: 'Monitores',
    });
    produtos.push(produto4);
    console.log(`  ✓ ${produto4.nome} - R$ ${produto4.preco.toFixed(2)}`);

    const produto5 = await produtosService.create({
      nome: 'Webcam Logitech C920',
      descricao: 'Webcam Full HD 1080p',
      sku: 'WC-LOG-001',
      preco: 550.0,
      categoria: 'Periféricos',
    });
    produtos.push(produto5);
    console.log(`  ✓ ${produto5.nome} - R$ ${produto5.preco.toFixed(2)}`);

    const produto6 = await produtosService.create({
      nome: 'Headset HyperX Cloud II',
      descricao: 'Headset gamer com microfone',
      sku: 'HS-HYP-001',
      preco: 480.0,
      categoria: 'Áudio',
    });
    produtos.push(produto6);
    console.log(`  ✓ ${produto6.nome} - R$ ${produto6.preco.toFixed(2)}\n`);

    // 4. Cria vendas
    console.log('💰 Criando vendas...');

    // Vendas do mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Venda 1: João Silva - Notebook
    const venda1 = await vendasService.create({
      produtoId: produto1.id,
      vendedorId: vendedor1.id,
      quantidade: 2,
      dataVenda: new Date(primeiroDiaMes.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor1.nome} vendeu ${venda1.quantidade}x ${produto1.nome} - Total: R$ ${venda1.valorTotal.toFixed(2)} (Comissão: R$ ${venda1.valorComissao.toFixed(2)})`,
    );

    // Venda 2: Maria Santos - Mouse + Teclado
    const venda2 = await vendasService.create({
      produtoId: produto2.id,
      vendedorId: vendedor2.id,
      quantidade: 5,
      dataVenda: new Date(primeiroDiaMes.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor2.nome} vendeu ${venda2.quantidade}x ${produto2.nome} - Total: R$ ${venda2.valorTotal.toFixed(2)} (Comissão: R$ ${venda2.valorComissao.toFixed(2)})`,
    );

    const venda3 = await vendasService.create({
      produtoId: produto3.id,
      vendedorId: vendedor2.id,
      quantidade: 3,
      dataVenda: new Date(primeiroDiaMes.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor2.nome} vendeu ${venda3.quantidade}x ${produto3.nome} - Total: R$ ${venda3.valorTotal.toFixed(2)} (Comissão: R$ ${venda3.valorComissao.toFixed(2)})`,
    );

    // Venda 4: Pedro Oliveira - Monitor
    const venda4 = await vendasService.create({
      produtoId: produto4.id,
      vendedorId: vendedor3.id,
      quantidade: 4,
      dataVenda: new Date(primeiroDiaMes.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor3.nome} vendeu ${venda4.quantidade}x ${produto4.nome} - Total: R$ ${venda4.valorTotal.toFixed(2)} (Comissão: R$ ${venda4.valorComissao.toFixed(2)})`,
    );

    // Venda 5: Ana Costa - Webcam + Headset
    const venda5 = await vendasService.create({
      produtoId: produto5.id,
      vendedorId: vendedor4.id,
      quantidade: 6,
      dataVenda: new Date(primeiroDiaMes.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor4.nome} vendeu ${venda5.quantidade}x ${produto5.nome} - Total: R$ ${venda5.valorTotal.toFixed(2)} (Comissão: R$ ${venda5.valorComissao.toFixed(2)})`,
    );

    const venda6 = await vendasService.create({
      produtoId: produto6.id,
      vendedorId: vendedor4.id,
      quantidade: 4,
      dataVenda: new Date(primeiroDiaMes.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor4.nome} vendeu ${venda6.quantidade}x ${produto6.nome} - Total: R$ ${venda6.valorTotal.toFixed(2)} (Comissão: R$ ${venda6.valorComissao.toFixed(2)})`,
    );

    // Venda 7: João Silva - Setup completo
    const venda7 = await vendasService.create({
      produtoId: produto4.id,
      vendedorId: vendedor1.id,
      quantidade: 3,
      dataVenda: new Date(primeiroDiaMes.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor1.nome} vendeu ${venda7.quantidade}x ${produto4.nome} - Total: R$ ${venda7.valorTotal.toFixed(2)} (Comissão: R$ ${venda7.valorComissao.toFixed(2)})`,
    );

    // Venda 8: Pedro Oliveira - Notebook
    const venda8 = await vendasService.create({
      produtoId: produto1.id,
      vendedorId: vendedor3.id,
      quantidade: 1,
      dataVenda: new Date(primeiroDiaMes.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    });
    console.log(
      `  ✓ ${vendedor3.nome} vendeu ${venda8.quantidade}x ${produto1.nome} - Total: R$ ${venda8.valorTotal.toFixed(2)} (Comissão: R$ ${venda8.valorComissao.toFixed(2)})`,
    );

    // Calcular totais
    const totalVendas = [venda1, venda2, venda3, venda4, venda5, venda6, venda7, venda8].reduce(
      (sum, v) => sum + Number(v.valorTotal),
      0,
    );
    const totalComissoes = [venda1, venda2, venda3, venda4, venda5, venda6, venda7, venda8].reduce(
      (sum, v) => sum + Number(v.valorComissao),
      0,
    );

    console.log('\n📊 Resumo do Seed:');
    console.log(`  • ${vendedores.length} vendedores criados`);
    console.log(`  • ${produtos.length} produtos criados`);
    console.log(`  • 8 vendas registradas`);
    console.log(`  • Total de vendas: R$ ${totalVendas.toFixed(2)}`);
    console.log(`  • Total de comissões: R$ ${totalComissoes.toFixed(2)}`);

    console.log('\n✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('\n❌ Erro durante o seed:', error.message);
    throw error;
  }

  await app.close();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Erro ao executar seed:', error);
  process.exit(1);
});
