/**
 * 📚 EXEMPLO DE ROTAS MELHORADAS COM SUPABASE
 * 
 * Este arquivo mostra como estruturar suas rotas Express
 * com tratamento robusto de erros e logging
 * 
 * Copie este padrão para suas rotas em server.js
 */

const express = require('express');
const pool = require('./db');

// ==========================================
// MIDDLEWARE PARA LOGGING
// ==========================================

// Middleware para logar todas as requisições
const logMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// ==========================================
// ROTAS EXEMPLO: CLIENTES
// ==========================================

// GET /api/clientes - Listar todos os clientes
async function getClientes(req, res) {
  try {
    console.log('📝 Buscando todos os clientes...');
    
    const result = await pool.query(
      'SELECT * FROM clientes ORDER BY id DESC'
    );
    
    console.log(`✅ ${result.rows.length} clientes encontrados`);
    res.json(result.rows);
    
  } catch (err) {
    console.error('❌ Erro ao buscar clientes:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });
    
    res.status(500).json({
      error: 'Erro ao buscar clientes',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno',
    });
  }
}

// GET /api/clientes/:id - Buscar cliente por ID
async function getClienteById(req, res) {
  try {
    const { id } = req.params;
    
    // Validação
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    console.log(`📝 Buscando cliente ${id}...`);
    
    const result = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log(`⚠️ Cliente ${id} não encontrado`);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    console.log(`✅ Cliente encontrado: ${result.rows[0].nome}`);
    res.json(result.rows[0]);
    
  } catch (err) {
    console.error('❌ Erro ao buscar cliente:', err.message);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
}

// POST /api/clientes - Criar novo cliente
async function createCliente(req, res) {
  try {
    const { nome, cpf, telefone, email, endereco } = req.body;
    
    // Validação de campos obrigatórios
    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }
    
    console.log(`📝 Criando novo cliente: ${nome}`);
    
    const result = await pool.query(
      `INSERT INTO clientes (nome, cpf, telefone, email, endereco)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, cpf, telefone, email, endereco]
    );
    
    console.log(`✅ Cliente criado com ID ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    // Diferenciar tipos de erro
    if (err.code === '23505') {
      // Constraint única (CPF ou email duplicado)
      console.error('❌ Erro: Registro duplicado', err.constraint);
      return res.status(409).json({ 
        error: `${err.constraint?.replace('clientes_', '')} já existe` 
      });
    }
    
    console.error('❌ Erro ao criar cliente:', err.message);
    res.status(500).json({ 
      error: 'Erro ao criar cliente',
      message: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
}

// PUT /api/clientes/:id - Atualizar cliente
async function updateCliente(req, res) {
  try {
    const { id } = req.params;
    const { nome, cpf, telefone, email, endereco } = req.body;
    
    // Validação
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    console.log(`📝 Atualizando cliente ${id}...`);
    
    const result = await pool.query(
      `UPDATE clientes 
       SET nome = COALESCE($1, nome), 
           cpf = COALESCE($2, cpf), 
           telefone = COALESCE($3, telefone), 
           email = COALESCE($4, email), 
           endereco = COALESCE($5, endereco),
           data_atualizacao = NOW()
       WHERE id = $6
       RETURNING *`,
      [nome, cpf, telefone, email, endereco, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`⚠️ Cliente ${id} não encontrado`);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    console.log(`✅ Cliente ${id} atualizado`);
    res.json(result.rows[0]);
    
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'CPF ou email já existe' });
    }
    
    console.error('❌ Erro ao atualizar cliente:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
}

// DELETE /api/clientes/:id - Deletar cliente
async function deleteCliente(req, res) {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    console.log(`📝 Deletando cliente ${id}...`);
    
    // Usar transação para manter integridade
    await client.query('BEGIN');
    
    // Verificar se cliente tem veículos
    const veiculos = await client.query(
      'SELECT COUNT(*) FROM veiculos WHERE cliente_id = $1',
      [id]
    );
    
    if (parseInt(veiculos.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      console.log(`⚠️ Cliente ${id} tem veículos associados`);
      return res.status(409).json({ 
        error: 'Cliente possui veículos associados',
        hint: 'Delete os veículos primeiro'
      });
    }
    
    // Deletar cliente
    const result = await client.query(
      'DELETE FROM clientes WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    await client.query('COMMIT');
    console.log(`✅ Cliente ${id} deletado`);
    res.status(204).send();
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao deletar cliente:', err.message);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  } finally {
    client.release();
  }
}

// ==========================================
// ROTA DE SAÚDE DO SERVIDOR
// ==========================================

async function healthCheck(req, res) {
  try {
    // Testar conexão com banco
    const result = await pool.query('SELECT NOW() as current_time');
    
    console.log('✅ Health check OK');
    res.json({
      status: 'Ok',
      timestamp: result.rows[0].current_time,
      environment: process.env.NODE_ENV || 'unknown',
    });
  } catch (err) {
    console.error('❌ Health check FAILED:', err.message);
    res.status(503).json({
      status: 'Error',
      error: 'Conexão com banco de dados falhou',
      message: err.message,
    });
  }
}

// ==========================================
// ROTAS COM BUSCA AVANÇADA
// ==========================================

// GET /api/clientes/search?nome=João&email=@gmail.com
async function searchClientes(req, res) {
  try {
    const { nome, email, cpf } = req.query;
    
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Construir query dinamicamente
    if (nome) {
      query += ` AND nome ILIKE $${paramIndex++}`;
      params.push(`%${nome}%`);
    }
    
    if (email) {
      query += ` AND email ILIKE $${paramIndex++}`;
      params.push(`%${email}%`);
    }
    
    if (cpf) {
      query += ` AND cpf = $${paramIndex++}`;
      params.push(cpf);
    }
    
    query += ' ORDER BY nome ASC';
    
    console.log('🔍 Buscando clientes com filtros...', { nome, email, cpf });
    
    const result = await pool.query(query, params);
    
    console.log(`✅ ${result.rows.length} resultado(s)`);
    res.json(result.rows);
    
  } catch (err) {
    console.error('❌ Erro na busca:', err.message);
    res.status(500).json({ error: 'Erro na busca' });
  }
}

// ==========================================
// ROTAS COM PAGINAÇÃO
// ==========================================

// GET /api/clientes/paginated?page=1&limit=10
async function getClientesPaginado(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: 'Page e limit devem ser >= 1' });
    }
    
    const offset = (page - 1) * limit;
    
    console.log(`📄 Buscando página ${page} com ${limit} itens...`);
    
    // Total de registros
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM clientes'
    );
    const total = parseInt(countResult.rows[0].count);
    
    // Dados da página
    const result = await pool.query(
      `SELECT * FROM clientes 
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    console.log(`✅ Página ${page} de ${Math.ceil(total / limit)}`);
    
    res.json({
      dados: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    
  } catch (err) {
    console.error('❌ Erro na paginação:', err.message);
    res.status(500).json({ error: 'Erro ao paginar' });
  }
}

// ==========================================
// EXPORTAR FUNÇÕES
// ==========================================

module.exports = {
  logMiddleware,
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  healthCheck,
  searchClientes,
  getClientesPaginado,
};

// ==========================================
// COMO USAR EM server.js
// ==========================================

/*

const handlers = require('./rotas-exemplo');
const express = require('express');
const app = express();

// Aplicar middleware
app.use(handlers.logMiddleware);
app.use(express.json());

// Rotas
app.get('/api/health', handlers.healthCheck);

// Clientes
app.get('/api/clientes', handlers.getClientes);
app.get('/api/clientes/search', handlers.searchClientes);
app.get('/api/clientes/paginated', handlers.getClientesPaginado);
app.get('/api/clientes/:id', handlers.getClienteById);
app.post('/api/clientes', handlers.createCliente);
app.put('/api/clientes/:id', handlers.updateCliente);
app.delete('/api/clientes/:id', handlers.deleteCliente);

app.listen(process.env.PORT || 3000, () => {
  console.log('✅ Servidor rodando');
});

*/
