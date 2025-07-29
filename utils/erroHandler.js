const agentesRepository = require("../repositories/agentesRepository");

function verifyStatus(status) {
  const validStatuses = ["aberto", "solucionado"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }
}

function verifyDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) return false; // Data inválida
  if (date > now) return false; // Data no futuro
  return true;
}

function validadeAgent(agentID) {
  const agenteExiste = agentesRepository.findById(agentID);
  if (!agenteExiste) {
    return false;
  }
  return true;
}

module.exports = {
  verifyStatus,
  verifyDate,
  validadeAgent,
};
