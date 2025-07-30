const agentesRepository = require("../repositories/agentesRepository");
const { verifyDate, invalidPayloadResponse } = require("../utils/erroHandler");

// GET /casos
function getAllAgentes(req, res) {
  const agentes = agentesRepository.findAll();
  res.json(agentes);
}

// GET /casos/:id
function getAgenteById(req, res) {
  const agente = agentesRepository.findById(req.params.id);
  if (!agente)
    return invalidPayloadResponse(res, { agent: "Agente não encontrado" });
  res.json(agente);
}

// POST /casos
function createAgente(req, res) {
  const errors = [];
  const { nome, dataDeIncorporacao, cargo } = req.body;
  if (!nome || !dataDeIncorporacao || !cargo) {
    errors.push({ fields: "Campos obrigatórios ausentes" });
  }
  if (!verifyDate(dataDeIncorporacao)) {
    errors.push({ date: "Data inválida" });
  }
  if (errors.length > 0) {
    return invalidPayloadResponse(res, errors);
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
  const errors = [];
  const { id, nome, dataDeIncorporacao, cargo } = req.body;

  if (id && id !== req.params.id) {
    errors.push({
      id: "Não é permitido alterar o ID do agente",
    });
  }
  if (!nome || !dataDeIncorporacao || !cargo) {
    errors.push({
      fields: "Campos obrigatórios ausentes",
    });
  }
  if (!verifyDate(dataDeIncorporacao)) {
    errors.push({
      date: "Data inválida",
    });
  }
  if (errors.length > 0) {
    return invalidPayloadResponse(res, errors);
  }

  const atualizado = agentesRepository.update(req.params.id, {
    nome,
    dataDeIncorporacao,
    cargo,
  });
  if (!atualizado)
    return invalidPayloadResponse(
      res,
      { agent: "Agente não encontrado" },
      "Agente não encontrado"
    );
  res.json(atualizado);
}

// PATCH /casos/:id
function patchAgente(req, res) {
  const errors = [];
  const data = req.body;

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    Object.keys(data).length === 0
  ) {
    errors.push({ body: "Payload inválido ou vazio" });
  }

  if ("id" in data) {
    errors.push({
      id: "Não é permitido alterar o ID do agente",
    });
  }

  if (data.dataDeIncorporacao && !verifyDate(data.dataDeIncorporacao)) {
    errors.push({
      date: "Data de incorporação inválida",
    });
  }

  if (errors.length > 0) {
    return invalidPayloadResponse(res, errors);
  }

  const atualizado = agentesRepository.patch(req.params.id, data);
  if (!atualizado)
    return invalidPayloadResponse(
      res,
      { agent: "Agente não encontrado" },
      "Agente não encontrado"
    );
  res.json(atualizado);
}

// DELETE /casos/:id
function deleteAgente(req, res) {
  const sucesso = agentesRepository.remove(req.params.id);
  if (!sucesso)
    return invalidPayloadResponse(
      res,
      { agent: "Agente não encontrado" },
      "Agente não encontrado"
    );
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
