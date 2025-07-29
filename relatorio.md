<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 7 créditos restantes para usar o sistema de feedback AI.

# Feedback para Gu1san:

Nota final: **78.1/100**

# Feedback do seu Desafio API REST com Express.js 🚓✨

Olá, Gu1san! Tudo bem? 😊 Primeiro, parabéns pelo esforço e pela dedicação em construir essa API para o Departamento de Polícia! Você conseguiu implementar a maior parte dos requisitos obrigatórios, o que já é uma baita conquista! 🎉

---

## 🎯 Pontos Fortes que Merecem Destaque

- Você organizou seu projeto respeitando a arquitetura modular com **rotas**, **controllers** e **repositories**. Isso é fundamental para manter o código limpo e escalável!  
- Todos os endpoints básicos dos recursos `/agentes` e `/casos` estão implementados, incluindo os métodos HTTP: GET, POST, PUT, PATCH e DELETE.  
- O uso do `uuid` para gerar IDs únicos está correto e bem aplicado.  
- Você já implementou validações para campos obrigatórios no payload, retornando status 400 quando necessário.  
- O tratamento de erros 404 para recursos não encontrados está presente, o que melhora muito a experiência da API.  
- Conseguiu implementar os testes básicos de criação, leitura, atualização e exclusão para ambos os recursos, o que mostra que sua API está funcional na maior parte.  
- Além disso, parabéns por ter tentado implementar os filtros e mensagens de erro customizadas! Isso mostra que você está buscando ir além do básico, mesmo que ainda haja ajustes a fazer. 👏

---

## 🔍 Análise Detalhada e Oportunidades de Melhoria

Agora, vamos conversar sobre alguns pontos que precisam de atenção para que sua API fique ainda mais sólida e confiável:

### 1. Atenção à Importação das Rotas no `server.js`

No seu `server.js`, notei que você importou as rotas de forma invertida:

```js
const agentesRoutes = require("./routes/casosRoutes");
const casosRoutes = require("./routes/agentesRoutes");
```

Aqui, você está atribuindo o arquivo de rotas de casos à variável `agentesRoutes` e vice-versa. Isso pode gerar confusão e até erros na hora de registrar as rotas no Express. O correto seria:

```js
const agentesRoutes = require("./routes/agentesRoutes");
const casosRoutes = require("./routes/casosRoutes");
```

Depois, você faz:

```js
app.use(agentesRoutes);
app.use(casosRoutes);
```

Com a correção acima, suas rotas vão apontar para os controladores corretos, evitando problemas na resolução dos endpoints.

---

### 2. Validação do Formato e Valor das Datas (`dataDeIncorporacao`)

Percebi que o campo `dataDeIncorporacao` aceita qualquer valor, inclusive formatos inválidos e datas futuras, o que não deveria acontecer. Isso pode causar inconsistências nos dados e problemas futuros.

No seu `agentesController.js`, você faz apenas uma verificação superficial:

```js
if (!nome || !dataDeIncorporacao || !cargo) {
  return res.status(400).json({ error: "Campos obrigatórios ausentes" });
}
```

Mas não valida se `dataDeIncorporacao` está no formato correto `YYYY-MM-DD` nem se a data não é futura.

**Sugestão:** você pode usar uma função utilitária para validar o formato da data e também comparar se ela não é maior que a data atual. Exemplo simples usando regex e `Date`:

```js
function isValidDate(dateString) {
  // Verifica formato YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return false; // Data inválida
  if (date > now) return false; // Data no futuro
  return true;
}
```

No seu controller, antes de criar ou atualizar, chame essa função e retorne 400 caso não seja válida:

```js
if (!isValidDate(dataDeIncorporacao)) {
  return res.status(400).json({ error: "dataDeIncorporacao inválida ou no futuro" });
}
```

Isso vai garantir que apenas datas coerentes sejam aceitas!

**Recomendo fortemente este vídeo para aprender sobre validação de dados em APIs:**  
[yNDCRAz7CM8 - Validação de dados em Node.js/Express](https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_)

---

### 3. Impedir Alteração do Campo `id` nos Updates

Notei que, tanto no `PUT` quanto no `PATCH` para agentes e casos, você não impede que o campo `id` seja alterado via payload. Isso é um problema de integridade dos dados, pois o `id` deve ser imutável.

Por exemplo, no seu `agentesController.js`:

```js
// updateAgente
const atualizado = agentesRepository.update(req.params.id, {
  nome,
  dataDeIncorporacao,
  cargo,
});
```

Aqui tudo bem, mas no `patchAgente`:

```js
function patchAgente(req, res) {
  const atualizado = agentesRepository.patch(req.params.id, req.body);
  if (!atualizado)
    return res.status(404).json({ error: "Agente não encontrado" });
  res.json(atualizado);
}
```

Se o `req.body` contiver um campo `id`, ele será mesclado e alterado no objeto, porque o `patch` do repository usa `Object.assign(agente, data)`. O mesmo vale para casos.

**Como corrigir?** Remova o campo `id` do payload antes de aplicar a atualização parcial:

```js
function patchAgente(req, res) {
  const data = { ...req.body };
  delete data.id; // Impede alteração do ID
  const atualizado = agentesRepository.patch(req.params.id, data);
  if (!atualizado)
    return res.status(404).json({ error: "Agente não encontrado" });
  res.json(atualizado);
}
```

Faça o mesmo para `patchCaso` e para o método `update` (PUT), garantindo que o `id` do recurso nunca seja modificado.

---

### 4. Validação da Existência do `agente_id` ao Criar ou Atualizar Casos

Um ponto importante que está faltando é a validação se o `agente_id` informado no payload de criação ou atualização de um caso realmente existe no repositório de agentes.

No seu `casosController.js`, você faz:

```js
if (!titulo || !descricao || !status || !agente_id) {
  return res.status(400).json({ error: "Campos obrigatórios ausentes" });
}
verifyStatus(status);
const novoCaso = casosRepository.create({
  titulo,
  descricao,
  status,
  agente_id,
});
```

Mas não verifica se `agente_id` corresponde a um agente válido. Isso permite criar casos com agentes inexistentes, o que quebra a integridade da API.

**Sugestão:** importe o `agentesRepository` e faça uma checagem:

```js
const agentesRepository = require("../repositories/agentesRepository");

// Dentro do createCaso
const agenteExiste = agentesRepository.findById(agente_id);
if (!agenteExiste) {
  return res.status(404).json({ error: "Agente informado não existe" });
}
```

Faça essa validação também nas atualizações (PUT e PATCH) de casos. Assim, evita inconsistências.

---

### 5. Melhoria na Validação do Status do Caso

Você usa a função `verifyStatus(status)` para validar o status do caso, mas no `patchCaso` você chama essa função **depois** de atualizar o recurso:

```js
const atualizado = casosRepository.patch(req.params.id, req.body);
if (!atualizado)
  return res.status(404).json({ error: "Caso não encontrado" });
verifyStatus(atualizado.status);
res.json(atualizado);
```

Se o status for inválido, o dado já foi atualizado antes da validação, o que pode deixar o sistema inconsistente.

**Sugestão:** valide o status **antes** de aplicar a atualização:

```js
if (req.body.status) {
  verifyStatus(req.body.status);
}
const atualizado = casosRepository.patch(req.params.id, req.body);
if (!atualizado)
  return res.status(404).json({ error: "Caso não encontrado" });
res.json(atualizado);
```

---

### 6. Organização e Nomenclatura dos Arquivos e Pastas

Sua estrutura de diretórios está muito próxima do esperado, parabéns! Só reforçando, a organização correta é essencial para projetos escaláveis. O arquivo `server.js` deve importar as rotas corretamente (como comentei no item 1), e você já tem as pastas:

```
routes/
controllers/
repositories/
utils/
docs/
```

Mantenha esse padrão e evite misturar arquivos para garantir clareza.

Para entender melhor a arquitetura MVC aplicada a Node.js, recomendo este vídeo super didático:  
[bGN_xNc4A1k - Arquitetura MVC em Node.js](https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH)

---

### 7. Filtros e Mensagens de Erro Customizadas (Bônus)

Você tentou implementar os filtros e mensagens customizadas, o que é ótimo! Porém, vi que esses recursos ainda não estão funcionando 100%.

Minha dica é focar primeiro em consolidar os endpoints básicos com validações sólidas e depois voltar para esses extras. Assim, você constrói uma base forte para depois incrementar.

---

## 📚 Recursos para Você Explorar e Aprimorar

- **Validação de dados e tratamento de erros:**  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/400  
  https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status/404  
  https://youtu.be/yNDCRAz7CM8?si=Lh5u3j27j_a4w3A_

- **Express.js e arquitetura modular:**  
  https://expressjs.com/pt-br/guide/routing.html  
  https://youtu.be/bGN_xNc4A1k?si=Nj38J_8RpgsdQ-QH

- **Manipulação de arrays e dados em memória:**  
  https://youtu.be/glSgUKA5LjE?si=t9G2NsC8InYAU9cI

- **HTTP status codes e métodos:**  
  https://youtu.be/RSZHvQomeKE

---

## 📝 Resumo Rápido do Que Focar Agora

- Corrigir a importação invertida das rotas no `server.js`.  
- Validar corretamente o formato e valor de `dataDeIncorporacao` para agentes (não aceitar datas inválidas ou futuras).  
- Impedir alteração do campo `id` nos métodos PUT e PATCH para agentes e casos.  
- Validar se o `agente_id` informado em casos realmente existe antes de criar ou atualizar.  
- Validar o status do caso antes de atualizar no método PATCH para evitar dados inconsistentes.  
- Consolidar a arquitetura modular e manter a organização clara das pastas e arquivos.  
- Priorizar o funcionamento completo dos endpoints básicos antes de avançar nos filtros e mensagens customizadas.

---

Gu1san, você está no caminho certo! 🚀 Com esses ajustes, sua API vai ficar muito mais robusta, confiável e profissional. Continue praticando, revisando seu código e buscando entender profundamente cada requisito. Você tem muito potencial para se tornar um mestre em Node.js e Express! 💪🔥

Se precisar de ajuda para implementar alguma dessas sugestões, me chama aqui que a gente resolve junto! 😉

Abraço forte e bons códigos! 👨‍💻👩‍💻✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>