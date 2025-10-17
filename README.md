# 📊 Sistema de Controle de Vendas e Comissões

Sistema completo para gerenciamento de vendas, vendedores e cálculo automático de comissões. Desenvolvido com NestJS, TypeORM e MySQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.3.0-red.svg)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.19-orange.svg)

## 🎯 Sobre o Projeto

Um sistema onde o gerente pode cadastrar vendedores, produtos e vendas realizadas, e o sistema calcula automaticamente comissões e desempenho de cada vendedor.

### ✨ Funcionalidades Principais

- ✅ **CRUD Completo** de Vendedores, Produtos e Vendas
- 💰 **Cálculo Automático** de comissões baseado em percentual configurável
- 📈 **Ranking de Vendedores** por desempenho
- 📊 **Relatórios Mensais** com total de vendas, comissões e ticket médio
- 🔐 **Autenticação JWT** para segurança
- 📝 **Validação Completa** de dados com DTOs e Pipes
- 🧪 **Testes Unitários** com Jest
- 📖 **Documentação Swagger** automática
- 🐳 **Docker Ready** para fácil deployment

## 🏗️ Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/              # Autenticação e autorização
│   │   ├── guards/        # Guards JWT e Local
│   │   ├── strategies/    # Estratégias Passport
│   │   └── dto/           # DTOs de login/registro
│   ├── vendedores/        # Módulo de vendedores
│   ├── produtos/          # Módulo de produtos
│   ├── vendas/            # Módulo de vendas
│   └── relatorios/        # Módulo de relatórios
├── app.module.ts          # Módulo principal
├── main.ts                # Entry point
└── seed.ts                # Script de seed
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js progressivo
- **TypeORM** - ORM para TypeScript
- **MySQL** - Banco de dados relacional
- **Passport & JWT** - Autenticação e autorização
- **Swagger** - Documentação automática da API
- **Jest** - Framework de testes

### DevOps
- **Docker & Docker Compose** - Containerização
- **TypeScript** - Tipagem estática
- **ESLint & Prettier** - Qualidade de código

## 🚀 Rodando o Projeto

### Pré-requisitos

- Node.js 18+ e npm
- Docker e Docker Compose (opcional, mas recomendado)
- MySQL (se não usar Docker)

### Instalação com Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/commission-manager.git
cd commission-manager

# 2. Inicie os containers
docker-compose up -d

# 3. A API estará disponível em:
# - API: http://localhost:3000/api/v1
# - Swagger: http://localhost:3000/api/docs
```

### Instalação Manual

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/commission-manager.git
cd commission-manager

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Inicie o MySQL (ou configure a conexão no .env)

# 5. Inicie a aplicação
npm run start:dev
```

## 📚 Documentação Completa

Acesse a documentação (Swagger) em: http://localhost:3000/api/docs

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev        # Inicia em modo desenvolvimento
npm run start:debug      # Inicia com debugger

# Produção
npm run build            # Compila o projeto
npm run start:prod       # Inicia em produção

# Database
npm run seed             # Popula o banco com dados de teste
npm run db:clear         # Limpa o banco de dados
```

> Use `docker-compose exec api node dist/[script]` caso deseje executar a um script pelo docker, como no caso do `seed.ts` ou `clear-database.ts`

## 🔐 Segurança

- Autenticação via JWT
- Senhas com hash bcrypt
- Guards protegendo rotas
- Validação de dados com class-validator
- CORS configurável

## 🌟 Funcionalidades em Destaque

### Cálculo Automático de Comissões
O sistema calcula automaticamente a comissão de cada venda baseado no percentual configurado para o vendedor.

### Ranking Dinâmico
Acompanhe o desempenho dos vendedores em tempo real com rankings por período.

### Relatórios Completos
- Total de vendas por período
- Comissões individuais e totais
- Ticket médio
- Dashboard com métricas do dia e do mês

### Soft Delete
Vendedores e produtos são marcados como inativos, preservando histórico.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, veja [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

## 📄 Licença

Este projeto está sob a não liscenciado. Sinta-se livre para utiliza-lo como preferir. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
