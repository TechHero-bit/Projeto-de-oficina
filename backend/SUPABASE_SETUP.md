# 📚 Guia de Integração com Supabase PostgreSQL

## 📖 Índice
1. [Configuração Inicial](#configuração-inicial)
2. [Variáveis de Ambiente](#variáveis-de-ambiente)
3. [Estrutura da Conexão](#estrutura-da-conexão)
4. [Teste de Conexão](#teste-de-conexão)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Melhores Práticas](#melhores-práticas)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Configuração Inicial

### Passo 1: Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Crie uma conta (pode usar GitHub)
4. Crie um novo **Project**

### Passo 2: Obter as Credenciais

1. Após criar o projeto, clique em **"Project Settings"** (ícone de engrenagem)
2. Vá para a aba **"Database"**
3. Você verá a **"Connection string"** no seguinte formato:

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Exemplo:**
```
postgresql://postgres:xR3mK9pL2w@abc-123.supabase.co:5432/postgres
```

### Passo 3: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Abra o `.env` e preencha com suas credenciais:

```env
DB_USER=postgres
DB_HOST=abc-123.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_PASSWORD=sua-senha-aqui
PORT=3000
NODE_ENV=development
```

> ⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` em seu repositório!

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env` - Estrutura Completa

```env
# ==========================================
# DATABASE - SUPABASE
# ==========================================
DB_USER=postgres              # Usuário do banco (padrão: postgres)
DB_HOST=seu-projeto.supabase.co  # Host do Supabase
DB_PORT=5432                  # Porta PostgreSQL (padrão: 5432)
DB_NAME=postgres              # Nome do banco (padrão: postgres)
DB_PASSWORD=sua-senha         # Senha do usuário

# ==========================================
# SERVER
# ==========================================
PORT=3000                     # Porta do Express
NODE_ENV=development          # development, production, test
```

### Por que usar `.env`?

✅ **Segurança**: Credenciais não ficam expostas no código  
✅ **Flexibilidade**: Diferentes ambientes (dev, produção)  
✅ **Variáveis Sensíveis**: Senhas e tokens protegidos  
✅ **CI/CD**: Fácil integração com pipelines  

---

## 🔌 Estrutura da Conexão

### Arquivo: `backend/db.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();

// Validação de Variáveis Obrigatórias
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variáveis não definidas:', missingEnvVars.join(', '));
  process.exit(1);
}

// Configuração do Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  max: 20,                          // Máximo de conexões
  idleTimeoutMillis: 30000,         // 30 segundos
  connectionTimeoutMillis: 2000,    // 2 segundos
  application_name: 'projeto_oficina',
});

// Event Listeners
pool.on('error', (err, client) => {
  console.error('❌ ERRO no Pool:', err.message);
});

// Testar Conexão
async function testConnection(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await pool.query('SELECT version();');
      console.log('✅ Conectado ao Supabase!');
      return true;
    } catch (err) {
      console.error(`❌ Tentativa ${attempt} falhou:`, err.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  return false;
}

module.exports = pool;
module.exports.testConnection = testConnection;
```

### Parâmetros Importantes do Pool

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| `max` | 20 | Máximo de conexões simultâneas |
| `idleTimeoutMillis` | 30000 | Tempo para descartar conexões ociosas |
| `connectionTimeoutMillis` | 2000 | Tempo máximo para estabelecer conexão |
| `application_name` | projeto_oficina | Identificar a app no Supabase |

---

## 🧪 Teste de Conexão

### Executar Teste

```bash
npm run test:db
```

### O que o Teste Faz

1. ✅ Valida variáveis de ambiente
2. ✅ Conecta ao banco de dados
3. ✅ Verifica versão do PostgreSQL
4. ✅ Lista as tabelas do banco
5. ✅ Executa query de teste
6. ✅ Testa query parametrizada

### Resultado Esperado

```
╔════════════════════════════════════════════════════════════╗
║  🧪 TESTE DE CONEXÃO COM SUPABASE POSTGRESQL              ║
╚════════════════════════════════════════════════════════════╝

📋 Verificando variáveis de ambiente...

✅ DB_USER        : postgres
✅ DB_HOST        : abc-123.supabase.co
✅ DB_PORT        : 5432
✅ DB_NAME        : postgres
✅ DB_PASSWORD    : ***

✅ TODOS OS TESTES PASSARAM COM SUCESSO!
```

---

## ⚠️ Tratamento de Erros

### Padrão Try/Catch no Express

```javascript
app.get('/api/clientes', async (req, res) => {
  try {
    // Sua query aqui
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    // Log do erro
    console.error('❌ Erro ao buscar clientes:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });

    // Resposta ao cliente
    res.status(500).json({
      error: 'Erro ao buscar clientes',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno',
    });
  }
});
```

### Códigos de Erro Comuns

| Código | Significado | Solução |
|--------|------------|---------|
| `ENOTFOUND` | Host não encontrado | Verifique URL do Supabase |
| `ECONNREFUSED` | Conexão recusada | Verifique host e porta |
| `28P01` | Autenticação falhou | Verifique usuário e senha |
| `3D000` | Banco não existe | Verifique nome do banco |
| `TIMEOUT` | Conexão lenta | Aumente `connectionTimeoutMillis` |

---

## 🎯 Melhores Práticas

### 1️⃣ Sempre Use Variáveis de Ambiente

❌ **ERRADO:**
```javascript
const pool = new Pool({
  user: 'postgres',
  password: 'senha123',  // ⚠️ NUNCA!
  host: 'abc-123.supabase.co',
});
```

✅ **CORRETO:**
```javascript
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
});
```

### 2️⃣ Use Prepared Statements com Parâmetros

❌ **ERRADO (SQL Injection):**
```javascript
await pool.query(`SELECT * FROM clientes WHERE id = ${id}`);
```

✅ **CORRETO:**
```javascript
await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
```

### 3️⃣ Sempre Trate Erros

```javascript
try {
  const result = await pool.query(query, params);
  return result.rows;
} catch (err) {
  console.error('Erro na query:', err.message);
  throw err; // Re-lançar ou tratar apropriadamente
}
```

### 4️⃣ Use Logs Estruturados

```javascript
console.log('Query executada:', {
  query: text.substring(0, 100),
  duration: `${Date.now() - start}ms`,
  rowCount: result.rowCount,
});
```

### 5️⃣ Configure Backup Regular

No Supabase:
1. Project Settings > Backups
2. Ative backups automáticos
3. Configure retenção (recomendado: 7 dias)

---

## 🐛 Troubleshooting

### Problema: "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

### Problema: "ECONNREFUSED - Connection refused"

**Causas possíveis:**
- Servidor Supabase está desligado
- Host ou porta incorretos
- Firewall bloqueando conexão

**Soluções:**
1. Verifique URL no Supabase Dashboard
2. Teste com `npm run test:db`
3. Verifique IP whitelist no Supabase

### Problema: "28P01 - Authentication failed"

**Causa:** Usuário ou senha incorretos

**Solução:**
1. Vá para Supabase Dashboard > Project Settings
2. Clique em "Reset Database Password"
3. Atualize `.env` com a nova senha

### Problema: Conexão Muito Lenta

**Causas:**
- Pool de conexões pequeno
- Muitas queries simultâneas
- Rede instável

**Soluções:**
```javascript
// Aumentar pool
max: 30,

// Aumentar timeout
connectionTimeoutMillis: 5000,

// Usar connection pooling
```

### Problema: "3D000 - Database does not exist"

**Causa:** Nome do banco incorreto

**Solução:**
- Padrão Supabase: `postgres`
- Verifique em Project Settings > Database

---

## 📞 Suporte e Recursos

- **Docs Supabase**: https://supabase.com/docs
- **Docs node-postgres**: https://node-postgres.com/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## ✅ Checklist de Implementação

- [ ] Conta criada no Supabase
- [ ] Projeto criado
- [ ] Arquivo `.env` configurado
- [ ] `npm install` executado
- [ ] `npm run test:db` passou
- [ ] Servidor rodando com `npm start`
- [ ] API health check funcionando
- [ ] Tabelas criadas no banco
- [ ] CRUD testado
- [ ] Backup automático ativado

---

**Desenvolvido com ❤️ para sua aplicação de oficina!**
