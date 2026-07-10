
(function(){
  const page=(document.body.dataset.page||'').toLowerCase();
  document.querySelectorAll('.sideLink').forEach(a=>{
    if((a.dataset.page||'').toLowerCase()===page) a.classList.add('active');
  });
  const btn=document.getElementById('mobileMenuBtn');
  if(btn) btn.addEventListener('click',()=>document.body.classList.toggle('menuOpen'));
  document.addEventListener('click',e=>{
    if(innerWidth>900) return;
    if(document.body.classList.contains('menuOpen') && !e.target.closest('.sidebar') && !e.target.closest('#mobileMenuBtn')) document.body.classList.remove('menuOpen');
  });
})();
