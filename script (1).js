// Lista de Tarefas — JavaScript puro, com salvamento no localStorage

const CHAVE = "lista-de-tarefas";

let tarefas = carregar();
let filtro = "todas";

const form = document.getElementById("form");
const entrada = document.getElementById("entrada");
const lista = document.getElementById("lista");
const vazio = document.getElementById("vazio");
const contador = document.getElementById("contador");
const btnLimpar = document.getElementById("limpar");
const elData = document.getElementById("data");

// ---------- Armazenamento ----------

function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(tarefas));
  } catch {
    /* sem armazenamento disponível: segue funcionando só na memória */
  }
}

// ---------- Ações ----------

function adicionar(texto) {
  const limpo = texto.trim();
  if (!limpo) return;
  tarefas.unshift({ id: Date.now(), texto: limpo, feita: false });
  salvar();
  renderizar();
}

function alternar(id) {
  const t = tarefas.find((x) => x.id === id);
  if (t) t.feita = !t.feita;
  salvar();
  renderizar();
}

function apagar(id) {
  tarefas = tarefas.filter((x) => x.id !== id);
  salvar();
  renderizar();
}

function editar(id, novoTexto) {
  const limpo = novoTexto.trim();
  if (!limpo) return apagar(id);
  const t = tarefas.find((x) => x.id === id);
  if (t) t.texto = limpo;
  salvar();
  renderizar();
}

function limparConcluidas() {
  tarefas = tarefas.filter((x) => !x.feita);
  salvar();
  renderizar();
}

// ---------- Interface ----------

function iniciarEdicao(li, tarefa) {
  const span = li.querySelector(".texto");
  const campo = document.createElement("input");
  campo.type = "text";
  campo.className = "editar";
  campo.value = tarefa.texto;
  campo.maxLength = 120;
  span.replaceWith(campo);
  campo.focus();
  campo.select();

  let encerrado = false;
  const concluir = (salvarMudanca) => {
    if (encerrado) return;
    encerrado = true;
    salvarMudanca ? editar(tarefa.id, campo.value) : renderizar();
  };

  campo.addEventListener("blur", () => concluir(true));
  campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") concluir(true);
    if (e.key === "Escape") concluir(false);
  });
}

function criarItem(tarefa) {
  const li = document.createElement("li");
  li.className = "item" + (tarefa.feita ? " feita" : "");

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = tarefa.feita;
  check.setAttribute("aria-label", "Concluir tarefa");
  check.addEventListener("change", () => alternar(tarefa.id));

  const texto = document.createElement("span");
  texto.className = "texto";
  texto.textContent = tarefa.texto; // textContent evita injeção de HTML
  texto.addEventListener("dblclick", () => iniciarEdicao(li, tarefa));

  const botao = document.createElement("button");
  botao.className = "apagar";
  botao.textContent = "✕";
  botao.setAttribute("aria-label", "Apagar tarefa");
  botao.addEventListener("click", () => apagar(tarefa.id));

  li.append(check, texto, botao);
  return li;
}

function renderizar() {
  const visiveis = tarefas.filter((t) =>
    filtro === "pendentes" ? !t.feita : filtro === "concluidas" ? t.feita : true
  );

  lista.replaceChildren(...visiveis.map(criarItem));
  vazio.hidden = visiveis.length > 0;

  const pendentes = tarefas.filter((t) => !t.feita).length;
  contador.textContent =
    pendentes === 1 ? "1 tarefa pendente" : `${pendentes} tarefas pendentes`;
  btnLimpar.hidden = !tarefas.some((t) => t.feita);

  document.querySelectorAll(".filtro").forEach((b) => {
    b.classList.toggle("ativo", b.dataset.filtro === filtro);
  });
}

// ---------- Eventos ----------

form.addEventListener("submit", (e) => {
  e.preventDefault();
  adicionar(entrada.value);
  entrada.value = "";
  entrada.focus();
});

document.querySelector(".filtros").addEventListener("click", (e) => {
  const btn = e.target.closest(".filtro");
  if (!btn) return;
  filtro = btn.dataset.filtro;
  renderizar();
});

btnLimpar.addEventListener("click", limparConcluidas);

// ---------- Início ----------

elData.textContent = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

renderizar();
