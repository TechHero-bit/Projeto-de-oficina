# 🚀 GUIA RÁPIDO - 5 MINUTOS

## ⏱️ Você vai conseguir em 5 minutos:
- ✅ Conta Supabase criada
- ✅ Projeto configurado
- ✅ Banco de dados conectado
- ✅ API funcionando

---

## PASSO 1️⃣ - Criar Conta Supabase (1 min)

1. Abra [supabase.com](https://supabase.com)
2. Clique **"Start your project"**
3. Crie conta (email ou GitHub)
4. **Clique em "New Project"**

```
⏱️ Tempo: ~1 minuto
```

---

## PASSO 2️⃣ - Copiar Credenciais Supabase (1 min)

1. Seu projeto foi criado
2. Clique **"Project Settings"** (ícone ⚙️)
3. Vá para **"Database"** na esquerda
4. Copie a **Connection String**:

```
postgresql://postgres:SUA_SENHA@abc-123.supabase.co:5432/postgres
```

```
⏱️ Tempo: ~1 minuto
```

---

## PASSO 3️⃣ - Configurar Arquivo .env (1 min)

1. Abra: `backend/.env.example`
2. **Copie todo o conteúdo**
3. Salve como: `backend/.env`
4. Preencha com seus dados:

```env
DB_USER=postgres
DB_HOST=abc-123.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_PASSWORD=sua-senha-aqui
```

✅ **NÃO commite este arquivo!** (já está no .gitignore)

```
⏱️ Tempo: ~1 minuto
```

---

## PASSO 4️⃣ - Testar Conexão (1 min)

No terminal, na pasta `backend/`:

```bash
npm install
npm run test:db
```

### Resultado Esperado:
```
✅ TODOS OS TESTES PASSARAM COM SUCESSO!
```

Se passou ✅, continue. Se não, veja troubleshooting no final.

```
⏱️ Tempo: ~1 minuto
```

---

## PASSO 5️⃣ - Iniciar Servidor (1 min)

```bash
npm start
```

### Testar no navegador:
```
http://localhost:3000/api/health
```

### Você verá:
```json
{
  "status": "Ok",
  "time": "2024-05-18T10:30:45.123Z"
}
```

```
⏱️ Tempo: ~1 minuto
```

---

## ✅ Pronto! 🎉

Seu servidor está conectado ao Supabase PostgreSQL!

---

## 📊 Próximas Etapas

### Criar Tabelas no Banco

1. Abra **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Copie arquivo: `backend/schema.sql`
4. Cole tudo lá
5. Clique **"Run"**

### Testar com Dados

```bash
# Terminal em backend/
curl http://localhost:3000/api/clientes
```

---

## 🆘 Deu Erro?

### Erro: "Cannot connect"
- [ ] Verifique `.env` está preenchido
- [ ] Verifique URL do Supabase
- [ ] Execute: `npm run test:db`

### Erro: "28P01 - Auth failed"
- [ ] Senha incorreta no `.env`
- [ ] Vá para Supabase > Reset Password
- [ ] Atualize `.env`

### Erro: "Module not found pg"
- [ ] Execute: `npm install`

### Erro: "Port 3000 already in use"
- [ ] Mude em `.env`: `PORT=3001`

---

## 📚 Documentação Completa

Se quiser aprender mais:

- 📖 **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Guia completo
- 💻 **[exemplos-uso.js](exemplos-uso.js)** - 12 exemplos de código
- 🧪 **[test-connection.js](test-connection.js)** - Testes detalhados
- 📊 **[schema.sql](schema.sql)** - Estrutura do banco

---

## 🎯 Exemplo: Sua Primeira Query

Arquivo: `backend/server.js`

```javascript
// ANTES
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Agora você pode fazer:
// curl http://localhost:3000/api/clientes
```

---

## 💡 Dica: Use o Query Logger

Todos os seus queries são automaticamente logados:

```
✅ Query executada com sucesso {
  duration: '45ms',
  rowCount: 5
}
```

---

## 🔐 Segurança

✅ **Credenciais protegidas** - `.env` no `.gitignore`
✅ **SQL Injection prevenida** - Parâmetros em `$1, $2`
✅ **Erros logados** - Todas queries rastreadas
✅ **Conexão SSL** - Supabase usa SSL por padrão

---

## ⚡ Scripts Disponíveis

```bash
npm start          # Inicia servidor
npm run dev        # Inicia com hot-reload (nodemon)
npm run test:db    # Testa conexão com 6 testes
npm test           # Placeholder para tests
```

---

## 🎓 Conceitos Importantes

### Pool de Conexões
- Máximo: 20 conexões simultâneas
- Reutiliza conexões
- Mais rápido que criar conexão toda vez

### Prepared Statements
```javascript
// ✅ SEGURO - Usa parâmetros
pool.query('SELECT * FROM clientes WHERE id = $1', [id])

// ❌ INSEGURO - SQL Injection
pool.query(`SELECT * FROM clientes WHERE id = ${id}`)
```

### Error Handling
```javascript
try {
  // sua query
} catch (err) {
  // automaticamente logado e tratado
}
```

---

## 🏁 Checklist Final

- [ ] Conta Supabase criada
- [ ] `.env` configurado
- [ ] `npm run test:db` passou ✅
- [ ] `npm start` funcionando
- [ ] `http://localhost:3000/api/health` respondendo
- [ ] Tabelas criadas via `schema.sql`
- [ ] Primeira query testada

---

**Dúvidas? Veja [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para documentação completa! 📖**

**Bom desenvolvimento! 🚀**
