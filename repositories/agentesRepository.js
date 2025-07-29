const { v4: uuidv4 } = require("uuid");

const agentes = [
  {
    id: "401bccf5-cf9e-489d-8412-446cd169a0f1",
    nome: "Rommel Carneiro",
    dataDeIncorporacao: "1992-10-04",
    cargo: "delegado",
  },
];

// LISTAR TODOS
function findAll() {
  return agentes;
}

// BUSCAR POR ID
function findById(id) {
  console.log(`Buscando agente com ID: ${id}`);
  return agentes.find((c) => c.id === id);
}

// CRIAR
function create(agente) {
  const novoAgente = { id: uuidv4(), ...agente };
  agentes.push(novoAgente);
  return novoAgente;
}

// ATUALIZAR COMPLETO
function update(id, data) {
  const index = agentes.findIndex((c) => c.id === id);
  if (index === -1) return null;
  agentes[index] = { id, ...data };
  return agentes[index];
}

// ATUALIZAR PARCIAL
function patch(id, data) {
  const agente = findById(id);
  if (!agente) return null;
  Object.assign(agente, data);
  return agente;
}

// DELETAR
function remove(id) {
  const index = agentes.findIndex((c) => c.id === id);
  if (index === -1) return false;
  agentes.splice(index, 1);
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
