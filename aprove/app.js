document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  loadPageFromHash();
  window.addEventListener('hashchange', loadPageFromHash);
});

/* === Carrega topbar e sidebar === */
async function loadLayout(){
  const app = document.querySelector('.app');
  app.innerHTML = `
    <div id="sidebar-container"></div>
    <main>
      <div id="topbar-container"></div>
      <section class="page" id="page-container">
        <div class="center" style="margin-top:80px;">Carregando...</div>
      </section>
    </main>
  `;
  const [topbar, sidebar] = await Promise.all([
    fetch('/aprove/layout/topbar.html').then(r=>r.text()),
    fetch('/aprove/layout/sidebar.html').then(r=>r.text())
  ]);
  document.getElementById('topbar-container').innerHTML = topbar;
  document.getElementById('sidebar-container').innerHTML = sidebar;
}

/* === Roteamento baseado no hash (#/pagina) === */
async function loadPageFromHash(){
  const page = location.hash.replace('#/','') || 'painel';
  const container = document.getElementById('page-container');
  try {
    const html = await fetch(`/aprove/pages/${page}.html`).then(r => {
      if(!r.ok) throw new Error('404');
      return r.text();
    });
    container.innerHTML = html;
    markActiveMenu(page);
  } catch {
    container.innerHTML = `<div class="center" style="margin-top:80px;">Página não encontrada (${page})</div>`;
  }
}

/* === Marca o item ativo === */
function markActiveMenu(page){
  document.querySelectorAll('.menu a').forEach(a=>{
    const href = a.getAttribute('href');
    a.parentElement.classList.remove('active');
    if(href && href.includes(page)) a.parentElement.classList.add('active');
  });
}

/* === Logout global === */
async function logout(){
  await fetch('https://apisec.secauxiliar.com.br/aprove/auth_login_out.php', {credentials:'include'});
  location.replace('/aprove/index.html');
}
