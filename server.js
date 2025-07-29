const express = require("express");
const app = express();
const agentesRoutes = require("./routes/casosRoutes");
const casosRoutes = require("./routes/agentesRoutes");
const PORT = 3000;

app.use(express.json());
app.use(agentesRoutes);
app.use(casosRoutes);

app.listen(PORT, () => {
  console.log(
    `Servidor do Departamento de Polícia rodando em http://localhost:${PORT} em modo de desenvolvimento`
  );
});
