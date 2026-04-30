const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao conectar ao banco de dados' });
  }
});

// ==========================================
// CLIENTES
// ==========================================
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { nome, cpf, telefone, email, endereco } = req.body;
    const result = await pool.query(
      'INSERT INTO clientes (nome, cpf, telefone, email, endereco) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, cpf, telefone, email, endereco]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar cliente', details: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, telefone, email, endereco } = req.body;
    const result = await pool.query(
      'UPDATE clientes SET nome = $1, cpf = $2, telefone = $3, email = $4, endereco = $5 WHERE id = $6 RETURNING *',
      [nome, cpf, telefone, email, endereco, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// ==========================================
// VEÍCULOS
// ==========================================
app.get('/api/veiculos', async (req, res) => {
  try {
    // Busca os veículos fazendo JOIN com clientes para pegar o nome
    const query = `
      SELECT v.*, c.nome as "clienteNome" 
      FROM veiculos v 
      JOIN clientes c ON v.cliente_id = c.id 
      ORDER BY v.id DESC
    `;
    const result = await pool.query(query);
    
    // Mapear propriedades para camelCase no angular
    const veiculos = result.rows.map(row => ({
      id: row.id,
      clienteId: row.cliente_id,
      clienteNome: row.clienteNome,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      placa: row.placa,
      cor: row.cor,
      quilometragem: row.quilometragem
    }));
    
    res.json(veiculos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar veículos' });
  }
});

app.get('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM veiculos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
    
    const row = result.rows[0];
    res.json({
      id: row.id,
      clienteId: row.cliente_id,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      placa: row.placa,
      cor: row.cor,
      quilometragem: row.quilometragem
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar veículo' });
  }
});

app.post('/api/veiculos', async (req, res) => {
  try {
    const { clienteId, marca, modelo, ano, placa, cor, quilometragem } = req.body;
    const result = await pool.query(
      'INSERT INTO veiculos (cliente_id, marca, modelo, ano, placa, cor, quilometragem) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [clienteId, marca, modelo, ano, placa, cor, quilometragem]
    );
    res.status(201).json({
       id: result.rows[0].id,
       clienteId: result.rows[0].cliente_id,
       ...result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar veículo', details: err.message });
  }
});

app.put('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { clienteId, marca, modelo, ano, placa, cor, quilometragem } = req.body;
    const result = await pool.query(
      'UPDATE veiculos SET cliente_id = $1, marca = $2, modelo = $3, ano = $4, placa = $5, cor = $6, quilometragem = $7 WHERE id = $8 RETURNING *',
      [clienteId, marca, modelo, ano, placa, cor, quilometragem, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Veículo não encontrado' });
    res.json({
       id: result.rows[0].id,
       clienteId: result.rows[0].cliente_id,
       ...result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar veículo' });
  }
});

app.delete('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM veiculos WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar veículo' });
  }
});

// ==========================================
// ORDENS DE SERVIÇO
// ==========================================
app.get('/api/ordens-servico', async (req, res) => {
  try {
    const query = `
      SELECT o.*, 
             c.nome as "clienteNome", 
             v.marca || ' ' || v.modelo as "veiculoInfo"
      FROM ordens_servico o
      JOIN clientes c ON o.cliente_id = c.id
      JOIN veiculos v ON o.veiculo_id = v.id
      ORDER BY o.id DESC
    `;
    const result = await pool.query(query);
    
    // Processar cada OS para buscar os serviços
    const ordens = [];
    for (const row of result.rows) {
      const itemsResult = await pool.query('SELECT descricao, valor FROM itens_servico WHERE ordem_servico_id = $1', [row.id]);
      
      ordens.push({
        id: row.id,
        clienteId: row.cliente_id,
        clienteNome: row.clienteNome,
        veiculoId: row.veiculo_id,
        veiculoInfo: row.veiculoInfo,
        descricaoProblema: row.descricao_problema,
        status: row.status,
        dataAbertura: row.data_abertura,
        dataConclusao: row.data_conclusao,
        observacoes: row.observacoes,
        valorTotal: row.valor_total,
        servicos: itemsResult.rows.map(item => ({
            descricao: item.descricao,
            valor: Number(item.valor)
        }))
      });
    }
    
    res.json(ordens);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
  }
});

app.get('/api/ordens-servico/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM ordens_servico WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'OS não encontrada' });
    
    const row = result.rows[0];
    const itemsResult = await pool.query('SELECT descricao, valor FROM itens_servico WHERE ordem_servico_id = $1', [id]);
    
    res.json({
        id: row.id,
        clienteId: row.cliente_id,
        veiculoId: row.veiculo_id,
        descricaoProblema: row.descricao_problema,
        status: row.status,
        dataAbertura: row.data_abertura,
        dataConclusao: row.data_conclusao,
        observacoes: row.observacoes,
        valorTotal: row.valor_total,
        servicos: itemsResult.rows.map(item => ({
            descricao: item.descricao,
            valor: Number(item.valor)
        }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar OS' });
  }
});

app.post('/api/ordens-servico', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { clienteId, veiculoId, descricaoProblema, servicos, observacoes, valorTotal } = req.body;
    
    const osResult = await client.query(
      'INSERT INTO ordens_servico (cliente_id, veiculo_id, descricao_problema, observacoes, valor_total) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clienteId, veiculoId, descricaoProblema, observacoes, valorTotal]
    );
    
    const osId = osResult.rows[0].id;
    
    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        await client.query(
          'INSERT INTO itens_servico (ordem_servico_id, descricao, valor) VALUES ($1, $2, $3)',
          [osId, servico.descricao, servico.valor]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json({ id: osId, message: 'OS criada com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erro ao criar OS', details: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/ordens-servico/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { status, observacoes, valorTotal, dataConclusao } = req.body;
    
    const result = await client.query(
      'UPDATE ordens_servico SET status = $1, observacoes = $2, valor_total = $3, data_conclusao = $4 WHERE id = $5 RETURNING *',
      [status, observacoes, valorTotal, dataConclusao, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'OS não encontrada' });
    }
    
    await client.query('COMMIT');
    res.json({ message: 'OS atualizada com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erro ao atualizar OS' });
  } finally {
    client.release();
  }
});

app.delete('/api/ordens-servico/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM ordens_servico WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar OS' });
  }
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
