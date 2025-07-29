function verifyStatus(status) {
  const validStatuses = ["aberto", "solucionado"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }
}

module.exports = {
  verifyStatus,
};
