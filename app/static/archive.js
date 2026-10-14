/* Admin archiving: copy and verify first; cleanup is a separate opt-in operation. */
const adminBeforeArchive=$('#navAdmin').onclick;
$('#navAdmin').onclick=async function(){
 await adminBeforeArchive();
 if(me.role!=='admin'||!$('#settingsForm'))return;
 try{
  const data=await api('/archive/status');const panel=document.createElement('section');panel.className='panel';panel.style.marginTop='24px';
  panel.innerHTML=`<h2>One-year Archive</h2><p>Completed records older than one year: <strong>${data.eligible}</strong>. Archived records retain Portal report information and become read-only.</p><p>${data.available?'Archive storage is connected.':'Archive storage is unavailable. Connect and configure the archive target first.'}</p><div class="toolbar"><button id="copyArchive" ${data.available?'':'disabled'}>Generate verified archives</button><button id="purgeArchive" class="secondary" ${data.available&&data.purge_enabled?'':'disabled'}>Clean online attachments</button></div><p>Generate complete offline records first. Move the whole MOMCC_Archive folder to external storage and reconnect that target before enabling online cleanup.</p><p id="archiveProgress" role="status"></p><div>${data.records.slice(0,50).map(r=>`<p><strong>${escape(r.number)}</strong> — ${escape(r.state)}<br><small>${escape(r.path)}</small></p>`).join('')||'No archives yet.'}</div>`;
  $('#otherView').append(panel);
  const run=async mode=>{if(mode==='purge'&&!confirm('Confirm the archive is on external storage with another backup copy. Each archive will be verified before online attachment cleanup. Continue?'))return;$('#copyArchive').disabled=true;$('#purgeArchive').disabled=true;let count=0;try{while(true){const result=await api('/archive/'+mode,{});if(!result.item)break;count++;$('#archiveProgress').textContent=count+' completed — '+result.item.number}toast(count+' archive operations completed');await $('#navAdmin').onclick()}catch(x){$('#archiveProgress').textContent=x.message;toast(x.message);$('#copyArchive').disabled=!data.available;$('#purgeArchive').disabled=!data.available||!data.purge_enabled}};
  $('#copyArchive').onclick=()=>run('run');$('#purgeArchive').onclick=()=>run('purge');
 }catch(x){toast(x.message)}
};
