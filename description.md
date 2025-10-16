# Sistema de Controle de Vendas e Comissões
## 🧠 Conceito:

Um sistema onde o usuário (gerente) pode cadastrar vendedores, produtos e vendas realizadas, e o sistema calcula automaticamente comissões e desempenho de cada vendedor.

## ⚙️ Funcionalidades sugeridas:

- CRUD de Vendedores, Produtos e Vendas;
- Cada venda possui:
    - produto vendido,
    - vendedor responsável,
    - valor da venda e data.
- O backend calcula automaticamente:
    - comissão do vendedor (por exemplo, 5% do valor da venda);
    - ranking dos vendedores com base no valor total vendido;
    - relatório mensal (total de vendas, comissões, ticket médio).

## 🧩 Tecnologias exercitadas:

- NestJS + TypeORM + MongoDB → módulos vendas, produtos, vendedores;
- DTOs e Pipes para validação;
- Jest → testes de unidade dos serviços (cálculo de comissão, ranking, etc.);
- ReactJS → painel de controle com tabelas, filtros e gráficos (usando ApexCharts);
- Autenticação JWT.
- Uso do Docker para:
    - subir o MongoDB localmente.
    - subir a API em outro container.