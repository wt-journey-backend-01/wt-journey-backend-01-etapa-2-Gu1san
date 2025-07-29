const agentesRepository = require("../repositories/agentesRepository");
const { verifyDate, validadeAgent } = require("../utils/erroHandler");

// GET /casos
function getAllAgentes(req, res) {
  const agentes = agentesRepository.findAll();
  res.json(agentes);
}

// GET /casos/:id
function getAgenteById(req, res) {
  const agente = agentesRepository.findById(req.params.id);
  if (!agente) return res.status(404).json({ error: "Agente não encontrado" });
  res.json(agente);
}

// POST /casos
function createAgente(req, res) {
  const { nome, dataDeIncorporacao, cargo } = req.body;
  if (!nome || !dataDeIncorporacao || !cargo) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }
  if (!verifyDate(dataDeIncorporacao)) {
    return res.status(400).json({ error: "Data inválida" });
  }
  const novoAgente = agentesRepository.create({
    nome,
    dataDeIncorporacao,
    cargo,
  });
  res.status(201).json(novoAgente);
}

// PUT /casos/:id
function updateAgente(req, res) {
  const { id, nome, dataDeIncorporacao, cargo } = req.body;
  if (id && id !== req.params.id) {
    return res
      .status(400)
      .json({ error: "Não é permitido alterar o ID do agente" });
  }
  if (!nome || !dataDeIncorporacao || !cargo) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }
  if (!verifyDate(dataDeIncorporacao)) {
    return res.status(400).json({ error: "Data inválida" });
  }
  const atualizado = agentesRepository.update(req.params.id, {
    nome,
    dataDeIncorporacao,
    cargo,
  });
  if (!atualizado)
    return res.status(404).json({ error: "Agente não encontrado" });
  res.json(atualizado);
}

// PATCH /casos/:id
function patchAgente(req, res) {
  if ("id" in req.body) {
    return res
      .status(400)
      .json({ error: "Não é permitido alterar o ID do agente" });
  }

  const data = { ...req.body };

  // Verificar se o body está vazio ou não é um objeto
  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "Payload inválido ou vazio" });
  }

  if (data.dataDeIncorporacao && !verifyDate(data.dataDeIncorporacao)) {
    return res.status(400).json({ error: "Data inválida" });
  }

  const atualizado = agentesRepository.patch(req.params.id, data);
  if (!atualizado)
    return res.status(404).json({ error: "Agente não encontrado" });
  res.json(atualizado);
}

// DELETE /casos/:id
function deleteAgente(req, res) {
  const sucesso = agentesRepository.remove(req.params.id);
  if (!sucesso) return res.status(404).json({ error: "Agente não encontrado" });
  res.status(204).send();
}

module.exports = {
  getAllAgentes,
  getAgenteById,
  createAgente,
  updateAgente,
  patchAgente,
  deleteAgente,
};
