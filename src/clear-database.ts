import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

/**
 * Script para limpar completamente o banco de dados
 * ATENÇÃO: Este script remove TODOS os dados do banco!
 *
 * Uso (em desenvolvimento): npm run db:clear
 */
async function clearDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('Limpando banco de dados...');

    // Desabilita checagem de foreign keys temporariamente
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

    // Limpa cada tabela
    const tables = ['vendas', 'produtos', 'vendedores', 'users'];
    for (const table of tables) {
      await dataSource.query(`TRUNCATE TABLE ${table}`);
      console.log(`  - Tabela '${table}' limpa`);
    }

    // Reabilita checagem de foreign keys
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\nBanco de dados completamente limpo!');
    console.log('Execute "npm run seed" para popular com dados de exemplo.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('\nErro ao limpar banco:', errorMessage);
    throw error;
  }

  await app.close();
  process.exit(0);
}

clearDatabase().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
  console.error('Erro fatal:', errorMessage);
  process.exit(1);
});
