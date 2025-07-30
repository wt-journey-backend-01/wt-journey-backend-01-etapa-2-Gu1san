const casosRepository = require("../repositories/casosRepository");
const {
  verifyStatus,
  validadeAgent,
  invalidPayloadResponse,
} = require("../utils/erroHandler");

// GET /casos
function getAllCasos(req, res) {
  const casos = casosRepository.findAll();
  res.json(casos);
}

// GET /casos/:id
function getCasoById(req, res) {
  const caso = casosRepository.findById(req.params.id);
  if (!caso)
    return invalidPayloadResponse(
      res,
      { case: "Caso não encontrado" },
      "Caso não encontrado"
    );
  res.json(caso);
}

// POST /casos
function createCaso(req, res) {
  const { titulo, descricao, status, agente_id } = req.body;
  const errors = [];

  if (!titulo || !descricao || !status || !agente_id) {
    errors.push({ fields: "Campos obrigatórios ausentes" });
  }

  if (!validadeAgent(agente_id)) {
    errors.push({ agent: "Agente informado não existe" });
  }

  if (!verifyStatus(status))
    errors.push({
      status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'",
    });

  if (errors.length > 0) {
    return invalidPayloadResponse(res, errors);
  }

  const novoCaso = casosRepository.create({
    titulo,
    descricao,
    status,
    agente_id,
  });

  res.status(201).json(novoCaso);
}

// PUT /casos/:id
function updateCaso(req, res) {
  const errors = [];
  const { id, titulo, descricao, status, agente_id } = req.body;

  if (id && id !== req.params.id) {
    errors.push({
      id: "Não é permitido alterar o ID do caso",
    });
  }

  if (!titulo || !descricao || !status || !agente_id) {
    errors.push({
      fields: "Campos obrigatórios ausentes",
    });
  }

  if (!verifyStatus(status))
    errors.push({
      status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'",
    });

  if (!validadeAgent(agente_id)) {
    errors.push({
      agent: "Agente informado não existe",
    });
  }

  if (errors.length > 0) {
    return invalidPayloadResponse(res, errors);
  }

  const atualizado = casosRepository.update(req.params.id, {
    titulo,
    descricao,
    status,
    agente_id,
  });

  if (!atualizado)
    return invalidPayloadResponse(
      res,
      { case: "Caso não encontrado" },
      "Caso não encontrado"
    );

  res.json(atualizado);
}

// PATCH /casos/:id
function patchCaso(req, res) {
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
      id: "Não é permitido alterar o ID do caso",
    });
  }

  if (data.status) {
    verifyStatus(data.status)
      ? null
      : errors.push({
          status: "O campo 'status' pode ser somente 'aberto' ou 'solucionado'",
        });
  }

  if (data.agente_id && !validadeAgent(data.agente_id)) {
    errors.push({
      agent: "Agente informado não existe",
    });
  }

  if (errors.length > 0) return invalidPayloadResponse(res, errors);

  const atualizado = casosRepository.patch(req.params.id, data);

  if (!atualizado)
    return invalidPayloadResponse(
      res,
      { case: "Caso não encontrado" },
      "Caso não encontrado"
    );

  res.json(atualizado);
}

// DELETE /casos/:id
function deleteCaso(req, res) {
  const sucesso = casosRepository.remove(req.params.id);

  if (!sucesso)
    return invalidPayloadResponse(
      res,
      { case: "Caso não encontrado" },
      "Caso não encontrado"
    );

  res.status(204).send();
}

module.exports = {
  getAllCasos,
  getCasoById,
  createCaso,
  updateCaso,
  patchCaso,
  deleteCaso,
};
