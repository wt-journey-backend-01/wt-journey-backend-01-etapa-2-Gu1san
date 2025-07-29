<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 6 créditos restantes para usar o sistema de feedback AI.

# Feedback para Gu1san:

Nota final: **87.4/100**

# Feedback para Gu1san 🚓✨

Olá, Gu1san! Que jornada incrível você fez até aqui construindo essa API para o Departamento de Polícia! 🚀🎉 Quero começar parabenizando você por implementar toda a estrutura básica da API, com os métodos HTTP essenciais (GET, POST, PUT, PATCH, DELETE) para os recursos `/agentes` e `/casos`. A modularização em **rotas**, **controladores** e **repositories** está muito bem feita, e o uso do `express.Router()` está correto nos arquivos de rotas. Isso mostra que você entendeu bem como organizar um projeto Express.js de forma escalável. 👏👏

Também é muito legal ver que você cuidou da validação dos dados e do tratamento de erros, retornando os status HTTP adequados como 400, 404, 201 e 204. Isso é fundamental para uma API robusta e confiável. Além disso, você já conseguiu implementar alguns bônus, como filtros simples e mensagens de erro customizadas — o que é um diferencial e mostra seu esforço para ir além! 🌟

---

## Vamos analisar juntos os pontos que podem ser melhorados para deixar sua API ainda mais afiada! 🔎

### 1. Atualização parcial (PATCH) dos agentes e casos — cuidado com a validação da data e do agente!

Vi que alguns testes relacionados ao método PATCH para agentes e casos não passaram. Vamos entender o que está acontecendo.

No seu `agentesController.js`, veja este trecho do método `patchAgente`:

```js
function patchAgente(req, res) {
  const data = { ...req.body };
  if (!verifyDate(data.dataDeIncorporacao)) {
    return res.status(400).json({ error: "Data inválida" });
  }
  delete data.id; // Impede alteração do ID
  const atualizado = agentesRepository.patch(req.params.id, data);
  if (!atualizado)
    return res.status(404).json({ error: "Agente não encontrado" });
  res.json(atualizado);
}
```

Aqui, o problema está na forma como você valida a data. Se o cliente enviar um PATCH com um corpo que **não contenha** o campo `dataDeIncorporacao`, o seu código ainda chama `verifyDate(undefined)`, o que provavelmente retorna `false`, e isso gera um erro 400 mesmo quando o campo não foi enviado para alteração — o que não deveria acontecer.

Na atualização parcial, os campos são opcionais, então a validação deve ocorrer **somente se o campo estiver presente**.

**Como corrigir?**

```js
function patchAgente(req, res) {
  const data = { ...req.body };
  if (data.dataDeIncorporacao && !verifyDate(data.dataDeIncorporacao)) {
    return res.status(400).json({ error: "Data inválida" });
  }
  delete data.id; // Impede alteração do ID
  const atualizado = agentesRepository.patch(req.params.id, data);
  if (!atualizado)
    return res.status(404).json({ error: "Agente não encontrado" });
  res.json(atualizado);
}
```

Note o `if (data.dataDeIncorporacao && ...)` que só valida se o campo existir.

---

No `casosController.js`, método `patchCaso`, tem um problema parecido:

```js
function patchCaso(req, res) {
  const data = { ...req.body };
  delete data.id; // Impede alteração do ID
  if (data.status) {
    verifyStatus(data.status);
  }
  if (!validadeAgent(data.agente_id)) {
    return res.status(404).json({ error: "Agente informado não existe" });
  }
  const atualizado = casosRepository.patch(req.params.id, data);
  if (!atualizado)
    return res.status(404).json({ error: "Caso não encontrado" });
  res.json(atualizado);
}
```

Aqui, a validação do agente está sendo feita **sempre**, mesmo quando `agente_id` não está presente no PATCH. Isso pode causar erro 404 indevido.

**Ajuste a validação para só checar o agente se o campo `agente_id` estiver no corpo:**

```js
function patchCaso(req, res) {
  const data = { ...req.body };
  delete data.id; // Impede alteração do ID
  if (data.status) {
    verifyStatus(data.status);
  }
  if (data.agente_id && !validadeAgent(data.agente_id)) {
    return res.status(404).json({ error: "Agente informado não existe" });
  }
  const atualizado = casosRepository.patch(req.params.id, data);
  if (!atualizado)
    return res.status(404).json({ error: "Caso não encontrado" });
  res.json(atualizado);
}
```

---

### 2. Penalidade: Alteração do ID via PUT — precisamos proteger esse campo!

Foi detectado que seu código permite alterar o campo `id` dos agentes e casos quando usa o método PUT, o que não é permitido. O ID deve ser imutável, pois é o identificador único do recurso.

Vamos ver o que acontece no seu `agentesController.js`, método `updateAgente`:

```js
function updateAgente(req, res) {
  const { nome, dataDeIncorporacao, cargo } = req.body;
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
```

Aqui, você está enviando para o repositório um objeto que não tem o campo `id`, o que é ótimo. Mas no seu repositório, no método `update`, você faz:

```js
function update(id, data) {
  const index = agentes.findIndex((c) => c.id === id);
  if (index === -1) return null;
  agentes[index] = { id, ...data };
  return agentes[index];
}
```

Isso garante que o `id` não será alterado, pois você está sobrescrevendo o objeto com o `id` passado por parâmetro.

**Então onde está o problema?**

O problema é que, no corpo da requisição PUT, se o cliente enviar um campo `id` diferente, você não está validando para impedir isso. Isso pode gerar confusão na API e testes automatizados podem detectar isso como uma falha.

**Solução:** Antes de passar os dados para o repositório, remova ou ignore o campo `id` do corpo da requisição, e se desejar, retorne um erro 400 se o `id` estiver presente no payload, indicando que não é permitido alterar o ID.

Exemplo no controller:

```js
function updateAgente(req, res) {
  const { id, nome, dataDeIncorporacao, cargo } = req.body;
  if (id && id !== req.params.id) {
    return res.status(400).json({ error: "Não é permitido alterar o ID do agente" });
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
```

Faça o mesmo para o `updateCaso` no `casosController.js`:

```js
function updateCaso(req, res) {
  const { id, titulo, descricao, status, agente_id } = req.body;
  if (id && id !== req.params.id) {
    return res.status(400).json({ error: "Não é permitido alterar o ID do caso" });
  }
  if (!titulo || !descricao || !status || !agente_id) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }
  verifyStatus(status);
  if (!validadeAgent(agente_id)) {
    return res.status(404).json({ error: "Agente informado não existe" });
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
```

---

### 3. Sobre os testes bônus que falharam — filtros e mensagens customizadas

Percebi que você tentou implementar filtros avançados (por status, agente, palavras-chave, ordenação, etc.) e mensagens de erro personalizadas para argumentos inválidos, mas ainda não conseguiu fazer funcionar 100%.

Isso é normal, filtros e ordenações exigem um pouco mais de lógica para manipular os arrays em memória e interpretar os query params.

Dica: para implementar filtros, você pode usar o método `filter` do array, por exemplo:

```js
function getAllCasos(req, res) {
  let resultados = casosRepository.findAll();

  if (req.query.status) {
    resultados = resultados.filter(caso => caso.status === req.query.status);
  }
  if (req.query.agente_id) {
    resultados = resultados.filter(caso => caso.agente_id === req.query.agente_id);
  }
  // ... outros filtros e ordenações

  res.json(resultados);
}
```

E para mensagens de erro customizadas, você pode criar funções que geram respostas padronizadas no `utils/errorHandler.js`.

Recomendo muito dar uma olhada nesse vídeo que explica a arquitetura MVC e como organizar filtros e validações:  
▶️ https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

---

### 4. Estrutura de diretórios — está tudo no lugar certo! 🎯

Sua organização de arquivos está exatamente como esperado:

```
.
├── controllers/
│   ├── agentesController.js
│   └── casosController.js
├── repositories/
│   ├── agentesRepository.js
│   └── casosRepository.js
├── routes/
│   ├── agentesRoutes.js
│   └── casosRoutes.js
├── server.js
├── package.json
└── utils/
    └── erroHandler.js
```

Isso é ótimo! Manter essa arquitetura modular vai facilitar muito a manutenção do seu código e a escalabilidade do projeto. Continue assim! 🚀

---

## Recursos que vão te ajudar a aprimorar ainda mais sua API

- Para entender melhor a manipulação dos métodos PATCH e PUT, e como validar campos opcionais:  
https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- Para reforçar a arquitetura e organização do projeto em MVC com Express.js:  
https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

- Para aprender a proteger campos imutáveis como o ID e tratar erros 400 e 404:  
https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404

- Para manipulação de arrays e filtros em memória:  
https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI

---

## 📋 Resumo rápido para você focar:

- ⚠️ **Corrigir validação em PATCH para só validar campos quando eles existirem no corpo da requisição.**  
- ⚠️ **Impedir alteração do campo `id` nos métodos PUT, retornando erro 400 caso o cliente tente modificar.**  
- 💡 Implementar os filtros e mensagens customizadas com cuidado para manipular corretamente os arrays e query params.  
- 🎯 Manter a arquitetura modular que você já está usando, ela está excelente!  
- 📚 Revisar os vídeos recomendados para consolidar esses conceitos.

---

Gu1san, você está no caminho certo e já entregou uma base muito sólida! 💪 Com esses ajustes, sua API vai ficar muito mais robusta e alinhada com as melhores práticas. Continue firme nessa jornada, que você tem tudo para se tornar um(a) expert em APIs com Node.js e Express! 🚀✨

Se precisar, estarei por aqui para ajudar no que for preciso! 😉

Um abraço de Code Buddy! 🤖💙

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>