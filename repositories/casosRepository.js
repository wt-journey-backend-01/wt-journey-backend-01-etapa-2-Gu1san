const { v4: uuidv4 } = require("uuid");

const casos = [
  {
    id: "f5fb2ad5-22a8-4cb4-90f2-8733517a0d46",
    titulo: "homicidio",
    descricao:
      "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
    status: "aberto",
    agente_id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
  },
];

// LISTAR TODOS
function findAll() {
  return casos;
}

// BUSCAR POR ID
function findById(id) {
  console.log(`Buscando caso com ID: ${id}`);
  return casos.find((c) => c.id === id);
}

// CRIAR
function create(caso) {
  const novoCaso = { id: uuidv4(), ...caso };
  casos.push(novoCaso);
  return novoCaso;
}

// ATUALIZAR COMPLETO
function update(id, data) {
  const index = casos.findIndex((c) => c.id === id);
  if (index === -1) return null;
  casos[index] = { id, ...data };
  return casos[index];
}

// ATUALIZAR PARCIAL
function patch(id, data) {
  const caso = findById(id);
  if (!caso) return null;
  Object.assign(caso, data);
  return caso;
}

// DELETAR
function remove(id) {
  const index = casos.findIndex((c) => c.id === id);
  if (index === -1) return false;
  casos.splice(index, 1);
  return true;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  patch,
  remove,
};
