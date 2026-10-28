/* SEC-AUXILIAR - orquestracao OMR no navegador (nunca substitui validacao PHP).
   Processa SOMENTE uploads RECEBIDOS com leitura_id nulo, em lotes RECEBIDO.
   Retoma apos novo envio enquanto a operacao estiver aberta; retorna ao abrir novamente. */
(() => {
'use strict';
const API='https://apisec.secauxiliar.com.br/sec/';
const origin=location.origin;
const leaseMs=90000;
const tabId=(crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random());
const failed=new Set();
let running=false, timer=null;
const valid=c=>/^[A-Za-z0-9_-]{1,50}$/.test(String(c||''));
function notify(event){try{window.dispatchEvent(new CustomEvent('sec:omr', {detail:event})); if(window.parent===window){const f=document.getElementById('frame-lotes');if(f?.contentWindow)f.contentWindow.postMessage({source:'sec-omr',...event},origin)}}catch(_){}}
async function json(url,options={}){const r=await fetch(url,{credentials:'include',cache:'no-store',...options});let x;try{x=await r.json()}catch{throw Error('Resposta não é JSON (HTTP '+r.status+')')}if(!r.ok||!x.ok){const e=Error(x.error||'HTTP '+r.status);e.http=r.status;throw e}return x}
async function resume(c,onlyLote=null){
 if(!valid(c)||running)return;
 const key='sec-conc-omr-'+c;
 try{
   let lease;try{lease=JSON.parse(localStorage.getItem(key)||'null')}catch(_){}
   if(lease&&lease.id!==tabId&&Date.now()-lease.t<leaseMs)return;
   localStorage.setItem(key,JSON.stringify({id:tabId,t:Date.now()}));
   running=true;
   const d=await json(API+'conc_lotes_controle.php?'+new URLSearchParams({acao:'resumo',IdConcurso:c}));
   const ready=new Set((d.lotes||[]).filter(l=>l.status==='RECEBIDO').map(l=>String(l.id)));
   const files=(d.arquivos||[]).filter(a=>ready.has(String(a.lote_id))&&a.leitura_id==null&&a.descarte_id==null&&a.upload_status==='RECEBIDO'&&(!onlyLote||String(a.lote_id)===String(onlyLote))&&!failed.has(String(a.upload_id)));
   if(files.length)notify({type:'start',total:files.length,lote:onlyLote});
   let count=0;
   for(const a of files){
      const lk=localStorage.getItem(key);let l;try{l=JSON.parse(lk||'null')}catch(_){}
      if(l&&l.id!==tabId)break;
      localStorage.setItem(key,JSON.stringify({id:tabId,t:Date.now()}));
      try {
        const body=new URLSearchParams({acao:'gravar',lote_id:String(a.lote_id),upload_id:String(a.upload_id)});
        const result=await json(API+'conc_folhas_gravar_omr.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
        notify({type:'item',upload:a.upload_id,lote:a.lote_id,status:result.status||'GRAVADO',count:++count,total:files.length});
      } catch(e) {
        failed.add(String(a.upload_id));
        notify({type:'error',upload:a.upload_id,lote:a.lote_id,message:e.message,count:++count,total:files.length});
      }
   }
   if(files.length)notify({type:'finish',total:files.length});
 } catch(e){notify({type:'error',message:e.message});}
 finally {running=false;try{const o=JSON.parse(localStorage.getItem(key)||'null');if(o?.id===tabId)localStorage.removeItem(key)}catch(_){}}
}
window.SECConcAuto={resume,resetErrors:()=>failed.clear(),isRunning:()=>running};
})();