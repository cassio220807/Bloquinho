import express from "express";
import cors from "cors";
import knexdb from "./knexfile.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname))); // Serve index.html

// Registro
app.post("/registrar", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).send("Campos obrigatórios.");

  const existente = await knexdb("usuarios").where({ username }).first();
  if (existente) {
    return res.send("Usuário já existe.");
  }

  await knexdb("usuarios").insert({ username, password });
  res.send("Usuário registrado com sucesso!");
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await knexdb("usuarios").where({ username, password }).first();
  if (!user) {
    return res.json({ success: false, message: "Login inválido." });
  }

  res.json({ success: true, user: username });
});

// Salvar conversa
app.post("/salvar-conversa", async (req, res) => {
  const { username, texto } = req.body;

  if (!username || !texto) return res.status(400).send("Dados incompletos.");

  await knexdb("conversas").insert({ username, texto });
  res.send("Conversa salva com sucesso!");
});

// Listar conversas do usuário
app.get("/conversas", async (req, res) => {
  const { username } = req.query;

  if (!username) return res.status(400).send("Usuário não informado.");

  const conversas = await knexdb("conversas")
    .where({ username })
    .orderBy("criado_em", "desc");

  res.json(conversas);
});

// Atualizar conversa por ID
app.put("/atualizar-conversa", async (req, res) => {
  const { id, texto } = req.body;

  if (!id || !texto) return res.status(400).send("ID ou texto faltando.");

  const atualizado = await knexdb("conversas").where({ id }).update({ texto });

  if (atualizado) {
    res.send("Conversa atualizada com sucesso!");
  } else {
    res.status(404).send("Conversa não encontrada.");
  }
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Exporta o app para uso com Electron
export default app;
