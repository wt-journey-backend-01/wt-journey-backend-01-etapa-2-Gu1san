const casosRepository = require("../repositories/casosRepository");

// GET /casos
function getAllCasos(req, res) {
  const casos = casosRepository.findAll();
  res.json(casos);
}

// GET /casos/:id
function getCasoById(req, res) {
  const caso = casosRepository.findById(req.params.id);
  if (!caso) return res.status(404).json({ error: "Caso não encontrado" });
  res.json(caso);
}

// POST /casos
function createCaso(req, res) {
  const { titulo, descricao, status, agente_id } = req.body;
  if (!titulo || !descricao || !status || !agente_id) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }
  if (!["aberto", "solucionado"].includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
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
  const { titulo, descricao, status, agente_id } = req.body;
  if (!titulo || !descricao || !status || !agente_id) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }
  const atualizado = casosRepository.update(req.params.id, {
    titulo,
    descricao,
    status,
    agente_id,
  });
  if (!atualizado)
    return res.status(404).json({ error: "Caso não encontrado" });
  res.json(atualizado);
}

// PATCH /casos/:id
function patchCaso(req, res) {
  const atualizado = casosRepository.patch(req.params.id, req.body);
  if (!atualizado)
    return res.status(404).json({ error: "Caso não encontrado" });
  res.json(atualizado);
}

// DELETE /casos/:id
function deleteCaso(req, res) {
  const sucesso = casosRepository.remove(req.params.id);
  if (!sucesso) return res.status(404).json({ error: "Caso não encontrado" });
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
