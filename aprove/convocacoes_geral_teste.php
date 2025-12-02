<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <link rel="icon" type="image/x-icon" href="https://www.curso-objetivo.br/assets/img/favicon.ico" />
  <title>Aprovações • Aprove — Conferência de Aprovados</title>

  <!-- Materialize -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">


  <script defer src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>

  <style>
    :root {
      --bg:#f7f8fb; --card:#ffffff; --line:#e9edf3;
      --ink:#0f172a; --muted:#6b7280;
      --primary:#0b3b78; --accent:#2563eb;
      --aside-w:260px; --topbar-h:64px;
    }

    html, body {height:100%; margin:0; font-family:'Roboto', sans-serif; background:var(--bg);}
    body {color:var(--ink);}
    .app {display:grid; grid-template-columns: var(--aside-w) 1fr; min-height:100vh;}

    header.topbar {
      position:fixed; top:0; left:0; right:0; height:var(--topbar-h); z-index:20;
      background:var(--primary); color:#fff; display:flex; align-items:center;
      padding:0 24px; box-shadow:0 2px 10px rgba(16,24,40,.12);
    }

    aside {
      background:#fff; border-right:1px solid var(--line);
      position:sticky; top:var(--topbar-h);
      height:calc(100vh - var(--topbar-h)); overflow:auto; z-index:6;
      padding-bottom:20px;
    }

    .menu {list-style:none; margin:0; padding:0 0 12px;}
    .menu a {display:block; padding:10px 22px; color:#111827; text-decoration:none; font-size:15px; transition:0.25s;}
    .menu a:hover {background:#f4f6fb; color:var(--primary);}
    .menu .active > a {background:#eef3ff; font-weight:600; color:var(--primary);}
    .menu-group {margin-bottom:12px;}
    .group-title {
      font-weight:700; color:#0b3b78; text-transform:uppercase;
      font-size:13px; letter-spacing:0.5px;
      padding:10px 20px 6px; border-top:1px solid #eef2f8;
    }

    main {display:flex; flex-direction:column; padding-top:calc(var(--topbar-h) + 8px);}
    .page {padding:24px;}
    footer {text-align:center; font-size:13px; color:var(--muted); padding:16px 0 10px;}

    #unitLabel {font-size:14px; font-weight:500; color:#fff; opacity:0.9;}

    table.striped th {background:#f2f5ff; color:#0b3b78; font-weight:600;}

    /* Campo de busca ocupa a linha inteira */
    .search-box {
      margin-bottom: 8px;
    }
    .search-box input {
      width: 100%;
    }

    /* Linha de filtros centralizada */
    .filters-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .filters-row button {
      flex: 0 0 auto;
    }

    /* Força os selects da linha de filtros a ficarem lado a lado */
    .filters-row .browser-default {
      display: inline-block;  /* em vez de block */
      width: auto;            /* tira o 100% do Materialize */
      min-width: 200px;       /* mantém uma largura legal */
    }

    .chip-aut {
      display: inline-block;
      margin-left: 4px;
      padding: 0 6px;
      font-size: 10px;
      border-radius: 999px;
      background: #0b3b78;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: .05em;
      cursor: pointer;
    }
    .chip-aut:hover {
      opacity: .85;
    }

    /* Remove a borda da lista de arquivos dentro da modal */
    #modal-autorizacao .collection {
    border: none;
    box-shadow: none;
    }

    #modal-autorizacao .collection .collection-item {
    border-bottom: 1px solid #e0e0e0;
    }



    @media (max-width:992px){
      .app{grid-template-columns:1fr;}
      aside{display:none;}
    }
  </style>
</head>

<body>
<div class="app">
  <!-- ===== SIDEBAR ===== -->
  <aside>
    <div class="center" style="padding:18px 0 8px;">
      <span class="title" style="font-weight:700; color:#0b3b78">Aprove</span>
    </div>

    <ul class="menu">
      <li><a href="/aprove/painel.html">Início</a></li>

      <li class="menu-group">
        <div class="group-title">Atualizações</div>
        <ul>
          <li class="active"><a href="/aprove/aprovacoes.html">Aprovações</a></li>
          <li><a href="/aprove/alunos.html">Alunos</a></li>
          <li><a href="/aprove/instituicoes.html">Instituições</a></li>
          <li><a href="/aprove/cursos.html">Cursos</a></li>
          <li><a href="/aprove/unidades.html">Unidades</a></li>
          <li><a href="/aprove/autorizacoes.html">Autorização de Imagem</a></li>
          <li><a href="/aprove/vestibulares.html">Listas de Aprovados</a></li>
        </ul>
      </li>

      <li class="menu-group">
        <div class="group-title">Ferramentas</div>
        <ul>
          <li><a href="/aprove/conferir_listas.html">Conferir Listas</a></li>
          <li><a href="/aprove/importar_aprovacoes.html">Importar Aprovações</a></li>
        </ul>
      </li>

      <li class="menu-group">
        <div class="group-title">Relatórios</div>
        <ul>
          <li><a href="/aprove/convocacoes_geral.html">Convocados 2ª Fase</a></li>
          <li><a href="/aprove/aprovacoes_geral.html">Aprovados</a></li>
          <li><a href="/aprove/porcentagem_lista.html">Porcentagem Lista</a></li>
          <li><a href="/aprove/totais_curso.html">Totais por Curso</a></li>
          <li><a href="/aprove/totais_instituicao.html">Totais por Instituição</a></li>
        </ul>
      </li>
    </ul>
  </aside>

  <!-- ===== MAIN ===== -->
  <main>
    <header class="topbar">
      <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="/aprove/logo-mini.png" alt="Logo" style="height:28px; width:auto;">
          <h5 style="margin:0; font-weight:600;">
            Aprove — Conferência de Aprovados — <span id="unitLabel">—</span>
          </h5>
        </div>
        <div style="display:flex; align-items:center;">
          <a class="btn-flat waves-effect white-text" href="#!" onclick="logout()">Sair</a>
        </div>
      </div>
    </header>

    <section class="page">
      <h4 style="color:#0b3b78; font-weight:600;">Convocações para Segunda Fase cadastradas</h4>
      <p class="grey-text text-darken-1">
        Visualize todas as convocações cadastradas, com filtros por aluno e por usuário que lançou.
      </p>

      <div class="card z-depth-0" style="padding:20px; margin-top:20px;">

        <div class="search-box">
          <input id="search" type="text" placeholder="Filtrar por nome do aluno..." oninput="filtrarAprovacoes()">
        </div>

        <!-- TODOS OS FILTROS NA MESMA LINHA -->
        <div class="filters-row">
          <select id="filtro-usuario" class="browser-default filtro-usuario" onchange="filtrarAprovacoes()">
            <option value="">Todos os usuários</option>
          </select>

          <select id="filtro-instituicao" class="browser-default filtro-usuario" onchange="filtrarAprovacoes()">
            <option value="">Todas as instituições</option>
          </select>

          <select id="filtro-cadastro" class="browser-default filtro-usuario" onchange="filtrarAprovacoes()">
            <option value="">Todos os anos</option>
          </select>

          <select id="filtro-unidade" class="browser-default filtro-usuario" onchange="filtrarAprovacoes()">
            <option value="">Todas as unidades</option>
          </select>

          <button class="btn blue darken-2" onclick="resetFiltros()">LIMPAR FILTROS</button>
        </div>

        <table class="striped highlight responsive-table" id="tabela-aprovacoes">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Serie</th>
              <th>Unidade</th>              
              <th>Cadastro</th>
              <th>Curso</th>
              <th>Instituição</th>
              <th>Listagem</th>
              <th>Cls</th>
              <th>Chamada</th>
              <th>Usuário</th>     
            </tr>
          </thead>
          <tbody></tbody>
        </table>

        <p class="center grey-text" id="msg-status">Carregando aprovações...</p>
      </div>

    </section>

    <footer>Desenvolvido por 3A Sistemas — Adilson Alves © 2025</footer>
  </main>
</div>

<script>
const API = 'https://apisec.secauxiliar.com.br/aprove/';
const LOGIN_URL = '/aprove/index.html';

let listaAprov = [];   // cache com TODAS as aprovações

async function logout(){
  try { await fetch(API + 'auth_login_out.php', { credentials:'include' }); }
  catch(_) {}
  location.replace(LOGIN_URL);
}

async function carregarUsuario() {
  try {
    const res = await fetch(API + 'auth_me.php', { credentials:'include' });
    const data = await res.json();
    if (data.ok && data.user) {
      const nome  = data.user.nome  ?? 'Usuário';
      const login = data.user.login ?? '';
      document.getElementById('unitLabel').textContent = `${login} — ${nome}`;
    }
  } catch (e) {
    document.getElementById('unitLabel').textContent = '— Erro de conexão';
  }
}

/* ===== CARREGA LISTA GERAL DE APROVAÇÕES ===== */
async function carregarAprovacoes(){
  const tbody = document.querySelector('#tabela-aprovacoes tbody');
  const msg   = document.getElementById('msg-status');
  tbody.innerHTML = '';
  msg.textContent = 'Carregando aprovações...';

  try {
    const res = await fetch(API + 'aprovacoes_list_convoc_geral.php', { credentials:'include' });
    const data = await res.json();

    if (data.ok && data.rows && data.rows.length){
      listaAprov = data.rows;
      popularFiltroUsuarios();
      popularFiltroInstituicoes(); // <--- NOVO
      popularFiltroCadastro();      // <--- NOVO
      popularFiltroUnidades(listaAprov);   // agora precisa da base
      renderTabela(listaAprov);
      msg.textContent = `Total: ${listaAprov.length} aprovações encontradas.`;
    } else {
      msg.textContent = 'Nenhuma convocação cadastrada.';
    }
  } catch (e){
    console.error(e);
    msg.textContent = 'Erro ao carregar convocação.';
  }
}

/* ===== MONTA A TABELA NA TELA ===== */
function renderTabela(rows) {
  const tbody = document.querySelector('#tabela-aprovacoes tbody');
  tbody.innerHTML = '';

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s] || s));
  }

  rows.forEach(r => {
    const tagAut = (r.tem_autorizacao == 1 || r.tem_autorizacao === '1')
      ? `<span class="chip-aut" data-cpf="${r.cpf}">Aut. Imagem</span>`
      : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `    
      <td>${escapeHtml(r.nome_aluno)} ${tagAut}</td>
      <td>${r.serie ?? ''}</td>
      <td>${r.unidade ?? ''}</td>
      <td>${r.cadastro ?? ''}</td>
      <td>${r.curso ?? ''}</td>
      <td>${r.instituicao ?? ''}</td>
      <td>${r.listagem ?? ''}</td>
      <td>${r.colocacao ?? ''}</td>
      <td>${r.chamada ?? ''}</td>
      <td>${r.usuario_nome ?? ''}</td>    
    `;
    tbody.appendChild(tr);
  });
}


/* ===== POPULA O SELECT DE USUÁRIOS ===== */
function popularFiltroUsuarios(){
  const select = document.getElementById('filtro-usuario');
  select.innerHTML = '<option value="">Todos os usuários</option>';

  const mapa = new Map(); // login -> nome

  listaAprov.forEach(r => {
    if (!mapa.has(r.usuario_login)) {
      mapa.set(r.usuario_login, r.usuario_nome);
    }
  });

  mapa.forEach((nome, login) => {
    const opt = document.createElement('option');
    opt.value = login;
    opt.textContent = `${nome} (${login})`;
    select.appendChild(opt);
  });
}

/* ===== POPULA O SELECT DE INSTITUIÇÕES (ORDENADO) ===== */
function popularFiltroInstituicoes(){
  const select = document.getElementById('filtro-instituicao');
  select.innerHTML = '<option value="">Todas as instituições</option>';

  const instSet = new Set();

  listaAprov.forEach(r => {
    const inst = (r.instituicao || '').trim();
    if (inst) {
      instSet.add(inst);
    }
  });

  // transforma em array e ordena em ordem alfabética (pt-BR)
  const instsOrdenadas = Array.from(instSet).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );

  instsOrdenadas.forEach(inst => {
    const opt = document.createElement('option');
    opt.value = inst;
    opt.textContent = inst;
    select.appendChild(opt);
  });
}

/* ===== POPULA O SELECT DE ANO DE CADASTRO ===== */
function popularFiltroCadastro(){
  const select = document.getElementById('filtro-cadastro');
  select.innerHTML = '<option value="">Todos os anos</option>';

  const anosSet = new Set();

  listaAprov.forEach(r => {
    const ano = (r.cadastro || '').toString().trim();
    if (ano && !anosSet.has(ano)) {
      anosSet.add(ano);
    }
  });

  // ordenar anos
  Array.from(anosSet).sort().forEach(ano => {
    const opt = document.createElement('option');
    opt.value = ano;
    opt.textContent = ano;
    select.appendChild(opt);
  });
}

/* ===== POPULA O SELECT DE UNIDADES (DINÂMICO + ORDENADO) ===== */
function popularFiltroUnidades(baseRows, unidadeSelecionada = '') {
  const select = document.getElementById('filtro-unidade');
  const valorAtual = unidadeSelecionada || select.value || '';

  select.innerHTML = '<option value="">Todas as unidades</option>';

  const uniSet = new Set();

  // junta todas as unidades existentes nesse conjunto de linhas
  baseRows.forEach(r => {
    const uni = (r.unidade || '').trim();
    if (uni) {
      uniSet.add(uni);
    }
  });

  // ordena alfabeticamente (pt-BR)
  const unidadesOrdenadas = Array.from(uniSet).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );

  // cria as <option> na ordem certa
  unidadesOrdenadas.forEach(uni => {
    const opt = document.createElement('option');
    opt.value = uni;
    opt.textContent = uni;
    select.appendChild(opt);
  });

  // se a unidade selecionada ainda existir na lista, mantém
  if (valorAtual && uniSet.has(valorAtual)) {
    select.value = valorAtual;
  } else {
    select.value = '';
  }
}






/* ===== FILTROS (NOME + USUÁRIO) ===== */
function filtrarAprovacoes(){
  const termo       = document.getElementById('search').value.trim().toLowerCase();
  const usuario     = document.getElementById('filtro-usuario').value;
  const instituicao = document.getElementById('filtro-instituicao').value;
  const unidadeSel  = document.getElementById('filtro-unidade').value;
  const anoCad      = document.getElementById('filtro-cadastro').value;

  // 1) Base para atualizar o combo de UNIDADES (sem considerar nome, nem unidade)
  let baseUnidade = listaAprov;

  if (usuario){
    baseUnidade = baseUnidade.filter(r => r.usuario_login === usuario);
  }

  if (instituicao){
    baseUnidade = baseUnidade.filter(r => (r.instituicao || '') === instituicao);
  }

  if (anoCad){
    baseUnidade = baseUnidade.filter(r => String(r.cadastro) === anoCad);
  }

  // Atualiza o select de unidades com essa base
  popularFiltroUnidades(baseUnidade, unidadeSel);

  // 2) Agora monta a lista FINAL pra tabela, com todos os filtros
  let filtrados = baseUnidade;

  if (unidadeSel){
    filtrados = filtrados.filter(r => (r.unidade || '') === unidadeSel);
  }

  if (termo){
    filtrados = filtrados.filter(r =>
      (r.nome_aluno || '').toLowerCase().includes(termo)
    );
  }

  renderTabela(filtrados);

  const msg = document.getElementById('msg-status');
  if (filtrados.length){
    msg.textContent = `Mostrando ${filtrados.length} de ${listaAprov.length} aprovações.`;
  } else {
    msg.textContent = 'Nenhuma aprovação encontrada com esses filtros.';
  }
}




/* ===== LIMPAR FILTROS ===== */
function resetFiltros(){
  document.getElementById('search').value = '';
  document.getElementById('filtro-usuario').value = '';
  document.getElementById('filtro-instituicao').value = '';
  document.getElementById('filtro-unidade').value = '';     // <--- NOVO
  document.getElementById('filtro-cadastro').value = '';
  renderTabela(listaAprov);
  document.getElementById('msg-status').textContent =
    `Total: ${listaAprov.length} aprovações encontradas.`;
}

/* ===== INICIALIZAÇÃO ===== */
document.addEventListener('DOMContentLoaded', () => {
  carregarUsuario();
  carregarAprovacoes();

  // inicializa todas as modais
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);

  // clique no "Aut" dentro da tabela
  const tabela = document.getElementById('tabela-aprovacoes');
  tabela.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip-aut');
    if (!chip) return;

    const cpf = chip.dataset.cpf;
    abrirModalAutorizacao(cpf);
  });
});




/* ==== script para modal - autoriações === */
function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s] || s));
}

function formatCpf(cpf) {
  const digits = (cpf || '').replace(/\D+/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

async function abrirModalAutorizacao(cpf) {
  const modalElem = document.getElementById('modal-autorizacao');
  const modal = M.Modal.getInstance(modalElem);
  const ul = document.getElementById('aut-arquivos');

  // estado inicial
  document.getElementById('aut-nome').textContent = 'Carregando...';
  document.getElementById('aut-cpf').textContent = formatCpf(cpf);
  document.getElementById('aut-data').textContent = '';
  document.getElementById('aut-obs').textContent = '';
  document.getElementById('aut-foto').textContent = '';
  document.getElementById('aut-entrevista').textContent = '';
  document.getElementById('aut-publicidade').textContent = '';
  ul.innerHTML = '<li class="collection-item">Buscando arquivos...</li>';

  modal.open();

  try {
    const resp = await fetch(API + 'autorizacao_detalhe.php?cpf=' + encodeURIComponent(cpf), {
      credentials: 'include'  // igual aos outros endpoints do Aprove
    });
    const data = await resp.json();

    if (!data.ok) {
      document.getElementById('aut-nome').textContent = 'Nenhuma autorização encontrada';
      ul.innerHTML = '';
      return;
    }

    const cab = data.cabecalho;
    const arquivos = data.arquivos || [];

    // cabeçalho
    document.getElementById('aut-nome').textContent = cab.nome_aluno || '';
    document.getElementById('aut-cpf').textContent = formatCpf(cab.cpf_aluno || cpf);
    document.getElementById('aut-data').textContent = cab.data_cadastro || '';
    document.getElementById('aut-obs').textContent = cab.observacao || '';

    // flags 0/1 -> Sim / Não
    document.getElementById('aut-foto').textContent =
      cab.foto == 1 ? 'Sim' : 'Não';

    document.getElementById('aut-entrevista').textContent =
      cab.entrevista == 1 ? 'Sim' : 'Não';

    document.getElementById('aut-publicidade').textContent =
      cab.publicidade == 1 ? 'Sim' : 'Não';

    // arquivos
    if (!arquivos.length) {
      ul.innerHTML = '<li class="collection-item">Nenhum arquivo cadastrado.</li>';
      return;
    }

    ul.innerHTML = '';
    arquivos.forEach(arq => {
      const li = document.createElement('li');
      li.className = 'collection-item';

      arquivos.forEach(arq => {
        const li = document.createElement('li');
        li.className = 'collection-item';

        const url = API + 'download_file.php?id=' + encodeURIComponent(arq.id);

        li.innerHTML = `
          <div>
            <a href="${url}" target="_blank">
              ${escapeHtml(arq.nome_original || '')}
            </a>
            <span class="grey-text text-darken-1" style="display:block; font-size:12px;">
              ${escapeHtml(arq.mime_type || '')} · ${arq.tamanho_kb || 0} KB
              ${arq.uploaded_em ? ' · enviado em ' + escapeHtml(arq.uploaded_em) : ''}
            </span>
            <a href="${url}" target="_blank" class="secondary-content" title="Abrir">
              <i class="material-icons">open_in_new</i>
            </a>
          </div>
        `;
        ul.appendChild(li);
      });

      ul.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    document.getElementById('aut-nome').textContent = 'Erro ao carregar autorização';
    ul.innerHTML = '';
  }
}

</script>


<div id="modal-autorizacao" class="modal modal-fixed-footer">
  <div class="modal-content">
    <h5>Arquivos da autorização</h5>

    <p><strong>Aluno:</strong> <span id="aut-nome"></span></p>
    <p><strong>CPF:</strong> <span id="aut-cpf"></span></p>
    <p><strong>Data de cadastro:</strong> <span id="aut-data"></span></p>
    <p><strong>Observações:</strong> <span id="aut-obs"></span></p>
    <p><strong>Foto:</strong> <span id="aut-foto"></span></p>
    <p><strong>Entrevista:</strong> <span id="aut-entrevista"></span></p>
    <p><strong>Publicidade:</strong> <span id="aut-publicidade"></span></p>

    <h6 style="margin-top:16px;">Arquivos</h6>
    <ul id="aut-arquivos" class="collection" style="margin-top:8px;"></ul>
  </div>

  <div class="modal-footer">
    <a href="#!" class="modal-close btn-flat">Fechar</a>
  </div>
</div>




</body>
</html>
