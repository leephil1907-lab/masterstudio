import './style.css';

const modules = [
  {name:'TikTokLive', group:'LIVE & SOCIAL', icon:'◉', desc:'Livestream event monitoring and creator interaction workflows.', status:'Reference', tags:['Livestream','Events'], url:'https://github.com/leephil1907-lab/TikTokLive'},
  {name:'AutoSocial', group:'LIVE & SOCIAL', icon:'↗', desc:'Plan and review social publishing workflows using authorized APIs.', status:'Reference', tags:['Publishing','Planning'], url:'https://github.com/Katzca/AutoSocial'},
  {name:'Tiktok', group:'LIVE & SOCIAL', icon:'♪', desc:'TikTok-related source project; pending technical and license review.', status:'Review needed', tags:['TikTok','Research'], url:'https://github.com/running-libo/Tiktok'},
  {name:'VidBee', group:'VIDEO & DISCOVERY', icon:'▶', desc:'Video discovery workflow reference with source-rights checks.', status:'Reference', tags:['Video','Discovery'], url:'https://github.com/nexmoe/VidBee'},
  {name:'Cloud Phone', group:'DEVICE STUDIO', icon:'▯', desc:'Launch a managed or self-hosted Android device session through a configured provider adapter.', status:'Provider required', tags:['Android','Remote device'], url:'https://docs.appetize.io/' , deviceType:'cloud-phone'},
  {name:'Android Emulator', group:'DEVICE STUDIO', icon:'▣', desc:'Start a virtual Android device with a shared setup flow and explicit session controls.', status:'Provider required', tags:['Android','Virtual device'], url:'https://github.com/remote-android/redroid-doc', deviceType:'android-emulator'},
  {name:'OBS Studio', group:'CREATOR TOOLS', icon:'▣', desc:'Professional live production and recording. Adapter not yet connected.', status:'Not connected', tags:['Production','Streaming'], url:'https://github.com/obsproject/obs-studio'},
  {name:'OBS Virtual Camera', group:'CREATOR TOOLS', icon:'◫', desc:'Virtual camera reference; OS compatibility must be verified.', status:'Not connected', tags:['Camera','Desktop'], url:'https://github.com/CatxFish/obs-virtual-cam'},
  {name:'LibreTube', group:'VIDEO & DISCOVERY', icon:'▷', desc:'Alternative video client reference and upstream project details.', status:'Reference', tags:['Video','Open source'], url:'https://github.com/LiberTube/libertube'},
  {name:'Local AI Multiplatform', group:'AI WORKSPACE', icon:'✳', desc:'Local inference integration concept using an endpoint you control.', status:'Not connected', tags:['Local AI','Models'], url:'https://github.com/techjarves/Uncensored-Local-AI-Multiplatform'},
  {name:'UniFace', group:'PRIVACY & RESEARCH', icon:'◎', desc:'Face-analysis research reference. Any use must be transparent and consent-based.', status:'Review needed', tags:['Computer vision','Research'], url:'https://github.com/yakhyo/uniface'},
  {name:'Android Face Recognition', group:'PRIVACY & RESEARCH', icon:'▤', desc:'Android computer-vision research reference; not a live identity service.', status:'Review needed', tags:['Android','Computer vision'], url:'https://github.com/leephil1907-lab/Android-FaceRecognition'},
  {name:'eSpoofer', group:'PRIVACY & RESEARCH', icon:'⌁', desc:'Security review only. No identity spoofing or access-control bypass is provided.', status:'Review needed', tags:['Security','Review'], url:'https://github.com/leephil1907-lab/espoofer'},
  {name:'SNI Spoofing', group:'PRIVACY & RESEARCH', icon:'⌘', desc:'Network research reference for isolated, authorized testing only.', status:'Review needed', tags:['Networking','Lab'], url:'https://github.com/leephil1907-lab/SNI-Spoofing'},
  {name:'Android Keylogger with Email', group:'PRIVACY & RESEARCH', icon:'⌑', desc:'High-risk source reference. No key capture, email exfiltration, or covert monitoring is implemented.', status:'Restricted review', tags:['Android','Security'], url:'https://github.com/leephil1907-lab/Android-keylogger-with-email'},
  {name:'BeeLogger', group:'PRIVACY & RESEARCH', icon:'⌑', desc:'High-risk source reference; review only, with no credential collection or covert tracking.', status:'Restricted review', tags:['Security','Review'], url:'https://github.com/leephil1907-lab/BeeLogger'},
  {name:'Hez_code', group:'DEVELOPER TOOLS', icon:'⌘', desc:'Developer source reference awaiting repository and dependency review.', status:'Review needed', tags:['Code','Research'], url:'https://github.com/hezxss1/Hez_code'},
  {name:'XX-Net', group:'NETWORK & PRIVACY', icon:'⇄', desc:'Network/privacy project reference; verify source, configuration, and legal usage.', status:'Review needed', tags:['Networking','Privacy'], url:'https://github.com/XX-net/XX-Net'}
];

const state = {query:'', group:'All modules', theme:'dark', deviceAccessKey:'', activeDeviceSession:null};
const icon = (name) => ({dashboard:'▦',modules:'▧',live:'◉',video:'▷',ai:'✳',security:'⌘',settings:'⚙',devices:'▯'}[name] || '•');
const nav = [
  ['dashboard','Overview'],['modules','Module library'],['devices','Cloud phone & emulator'],['live','Live & social'],['video','Video studio'],['ai','Local AI'],['security','Privacy & research'],['settings','Settings']
];

function render() {
  document.documentElement.dataset.theme = state.theme;
  const filtered = modules.filter(m => (state.group === 'All modules' || m.group === state.group.toUpperCase()) && (m.name+' '+m.desc+' '+m.tags.join(' ')).toLowerCase().includes(state.query.toLowerCase()));
  document.querySelector('#app').innerHTML = `
    <aside class="sidebar">
      <a class="brand" href="#" aria-label="Master Studio home"><span class="brand-mark">M<span>.</span></span><span>master<span class="muted">studio</span><small>CREATOR OPERATING SYSTEM</small></span></a>
      <div class="workspace"><span class="workspace-avatar">MS</span><span><b>Master workspace</b><small>Personal environment</small></span><span class="chevron">⌄</span></div>
      <div class="nav-label">WORKSPACE</div>
      <nav>${nav.map(([key,label])=>`<button class="nav-item ${(state.group==='All modules'&&key==='dashboard')||(state.group===label)?'active':''}" data-nav="${key}"><span class="nav-icon">${icon(key)}</span>${label}${key==='modules'?'<span class="nav-count">18</span>':''}</button>`).join('')}</nav>
      <div class="sidebar-bottom"><div class="status-line"><span class="pulse"></span><span>Workspace operational</span></div><div class="profile"><div class="profile-avatar">C</div><div><b>Creator workspace</b><small>Local-first setup</small></div><button class="icon-btn" data-theme aria-label="Toggle theme">◐</button></div></div>
    </aside>
    <main class="main">
      <header class="topbar"><div class="breadcrumbs">Workspace <span>/</span> <b>${state.group==='All modules'?'Overview':state.group}</b></div><div class="top-actions"><span class="sync"><span class="pulse"></span> Ready for configuration</span><button class="icon-btn" data-theme aria-label="Toggle theme">◐</button><a class="github-link" href="https://github.com/leephil1907-lab/masterstudio" target="_blank" rel="noreferrer">GitHub ↗</a></div></header>
      <section class="content">
        <div class="eyebrow"><span class="eyebrow-dot"></span> YOUR CREATOR COMMAND CENTER</div>
        <div class="hero-row"><div><h1>Make your workflow<br><span>work as one.</span></h1><p class="hero-copy">A modular home for livestreams, Android device sessions, video, creator tools, local AI, and privacy-first research.</p></div><div class="hero-art" aria-hidden="true"><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><span class="hero-glyph">M<span>+</span></span><span class="art-label">SYSTEM / 001</span></div></div>
        <div class="metric-grid">
          <article class="metric"><div class="metric-head"><span>CATALOGUED MODULES</span><span class="metric-icon">▧</span></div><div class="metric-value">18 <small>modules</small></div><div class="metric-foot"><span class="mini-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span> Curated in one workspace</div></article>
          <article class="metric"><div class="metric-head"><span>CONNECTED SERVICES</span><span class="metric-icon">⌁</span></div><div class="metric-value">0 <small>live adapters</small></div><div class="metric-foot">Connect and test each integration</div></article>
          <article class="metric"><div class="metric-head"><span>WORKSPACE MODE</span><span class="metric-icon">✳</span></div><div class="metric-value">Local <small>first</small></div><div class="metric-foot"><span class="green-dot"></span> You choose endpoints and access</div></article>
        </div>
        <div class="section-heading"><div><div class="eyebrow">CONTROL DECK</div><h2>Workspace modules</h2><p>Browse your toolkit and open the upstream source for each module.</p></div><button class="outline-btn" data-view-all>View all modules <span>↗</span></button></div>
        <div class="toolbar"><div class="searchbox"><span>⌕</span><input id="search" placeholder="Search modules, tools, capabilities..." value="${state.query}" /><kbd>⌘ K</kbd></div><div class="filter-wrap"><span>FILTER</span><select id="group"><option>All modules</option><option>LIVE & SOCIAL</option><option>VIDEO & DISCOVERY</option><option>DEVICE STUDIO</option><option>CREATOR TOOLS</option><option>AI WORKSPACE</option><option>PRIVACY & RESEARCH</option><option>NETWORK & PRIVACY</option><option>DEVELOPER TOOLS</option></select></div></div>
        <div class="module-grid" id="module-grid">${filtered.slice(0,6).map(card).join('')}</div>
        <div class="all-modules-row"><span>Showing <b>${Math.min(filtered.length,6)}</b> of <b>${filtered.length}</b> matching modules</span><button class="text-btn" data-view-all>Explore module library →</button></div>
        <div class="bottom-grid"><article class="integration-panel"><div class="panel-top"><div><div class="eyebrow">INTEGRATION CENTER</div><h3>Bring your tools together.</h3></div><span class="panel-symbol">⌘</span></div><p>Each connector needs a verified adapter, secure configuration, and a real end-to-end test before it can be marked connected.</p><div class="integration-steps"><div><span>01</span><b>Review upstream</b><small>License, dependencies, permissions</small></div><div><span>02</span><b>Configure securely</b><small>Keep secrets off the frontend</small></div><div><span>03</span><b>Test & activate</b><small>Health checks and rollback plan</small></div></div><a href="https://github.com/leephil1907-lab/masterstudio/blob/main/docs/INTEGRATIONS.md" target="_blank" rel="noreferrer" class="panel-link">Read integration plan ↗</a></article>
        <article class="ai-panel"><div class="ai-badge">✳</div><div class="eyebrow">LOCAL AI WORKSPACE</div><h3>Your models.<br>Your environment.</h3><p>Configure a local inference endpoint you control. Credentials stay out of client-side code.</p><button class="primary-btn" data-nav="ai">Configure AI workspace <span>→</span></button><div class="ai-decoration">LOCAL / PRIVATE / MODULAR</div></article></div>
        <footer><span>MASTER STUDIO <span class="footer-dot">●</span> BUILD 0.1.0</span><span>Modular by design. Honest about what is connected.</span><a href="https://github.com/leephil1907-lab/masterstudio">SOURCE ↗</a></footer>
      </section>
    </main>
    <div class="toast" id="toast" role="status"></div>
    <dialog id="module-dialog"><button class="dialog-close" data-close aria-label="Close">×</button><div id="dialog-content"></div></dialog>
  `;
  bind();
}

function card(m) {
  return `<article class="module-card"><div class="module-card-top"><span class="module-icon">${m.icon}</span><span class="status status-${m.status.toLowerCase().replaceAll(' ','-')}"><i></i>${m.status}</span></div><div class="module-group">${m.group}</div><h3>${m.name}</h3><p>${m.desc}</p><div class="tag-row">${m.tags.map(t=>`<span>${t}</span>`).join('')}</div><div class="module-card-bottom"><button class="details-btn" data-detail="${m.name}">View details <span>→</span></button><a href="${m.url}" target="_blank" rel="noreferrer" aria-label="Open ${m.name} source">↗</a></div></article>`;
}

function toast(msg) { const t=document.querySelector('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2600); }
function bind() {
  document.querySelector('#search').addEventListener('input', e=>{state.query=e.target.value; const pos=e.target.selectionStart; render(); const el=document.querySelector('#search');el.focus();el.setSelectionRange(pos,pos);});
  document.querySelector('#group').value=state.group;
  document.querySelector('#group').addEventListener('change',e=>{state.group=e.target.value;render();});
  document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';render();}));
  document.querySelectorAll('[data-view-all]').forEach(b=>b.addEventListener('click',()=>{state.group='All modules';state.query='';render();document.querySelector('#group').value='All modules';document.querySelector('#search').focus();document.querySelector('#module-grid').innerHTML=modules.map(card).join('');document.querySelector('.all-modules-row span').innerHTML='Showing <b>18</b> catalogued modules';}));
  document.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.nav;const map={dashboard:'All modules',modules:'All modules',devices:'DEVICE STUDIO',live:'LIVE & SOCIAL',video:'VIDEO & DISCOVERY',ai:'AI WORKSPACE',security:'PRIVACY & RESEARCH',settings:'All modules'};state.group=map[key]||'All modules';state.query='';render();if(key==='ai')showAI();if(key==='settings')showSettings();}));
  document.querySelectorAll('[data-detail]').forEach(b=>b.addEventListener('click',()=>{const m=modules.find(x=>x.name===b.dataset.detail);if(m.deviceType){showDeviceSetup(m.deviceType);return;}document.querySelector('#dialog-content').innerHTML=`<div class="eyebrow">${m.group}</div><div class="dialog-icon">${m.icon}</div><h2>${m.name}</h2><p>${m.desc}</p><div class="dialog-status">STATUS <b>${m.status}</b></div><p class="dialog-note">This is an upstream reference, not a claim that its original functionality is already integrated into Master Studio.</p><a class="primary-btn dialog-link" href="${m.url}" target="_blank" rel="noreferrer">Open upstream repository ↗</a>`;document.querySelector('#module-dialog').showModal();}));
  document.querySelector('[data-close]').addEventListener('click',()=>document.querySelector('#module-dialog').close());
  document.querySelector('#module-dialog').addEventListener('click',e=>{if(e.target.id==='module-dialog')e.target.close();});
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();document.querySelector('#search')?.focus();}});
}

async function showDeviceSetup(initialType='cloud-phone') {
  const dialog=document.querySelector('#module-dialog');
  document.querySelector('#dialog-content').innerHTML=`
    <div class="eyebrow">DEVICE STUDIO / SHARED SETUP</div>
    <h2>Start an Android session</h2>
    <p>One setup flow for Cloud Phone and Android Emulator. Sessions start only when a real provider is configured; this screen will never create a simulated device.</p>
    <label class="field-label" for="device-type">Device workspace</label>
    <select id="device-type" class="dialog-input">
      <option value="cloud-phone" ${initialType==='cloud-phone'?'selected':''}>Cloud Phone · managed Android device</option>
      <option value="android-emulator" ${initialType==='android-emulator'?'selected':''}>Android Emulator · virtual Android</option>
    </select>
    <label class="field-label" for="device-provider">Hosting route</label>
    <select id="device-provider" class="dialog-input">
      <option value="managed">Managed provider (recommended first)</option>
      <option value="self-hosted">Self-hosted bridge (future / your infrastructure)</option>
    </select>
    <label class="field-label" for="device-profile">Device profile</label>
    <select id="device-profile" class="dialog-input">
      <option value="pixel-8">Pixel-class · portrait</option>
      <option value="pixel-tablet">Tablet · landscape-ready</option>
      <option value="custom">Provider default</option>
    </select>
    <label class="field-label" for="device-app">App package or launch target (optional)</label>
    <input id="device-app" class="dialog-input" placeholder="com.example.app" autocomplete="off" />
    <label class="field-label" for="device-key">Master Studio device access key</label>
    <input id="device-key" class="dialog-input" type="password" placeholder="Provided by your deployment administrator" autocomplete="off" />
    <p class="dialog-note">The access key is held in this page's memory only. Provider credentials stay on the server. Do not paste your provider API token here.</p>
    <div class="device-provider-status" id="device-provider-status">Checking configured providers…</div>
    <button class="primary-btn" id="start-device-session">Check setup & start session <span>→</span></button>
    <div id="device-result" aria-live="polite"></div>`;
  dialog.showModal();
  const status=document.querySelector('#device-provider-status');
  try {
    const r=await fetch('/api/devices/providers');
    if(!r.ok) throw new Error('API returned '+r.status);
    const data=await r.json();
    status.innerHTML='<b>Managed provider:</b> '+(data.managed?.configured?'Configured':'Not configured')+'<br><b>Self-hosted bridge:</b> '+(data.selfHosted?.configured?'Configured':'Not configured');
  } catch {
    status.innerHTML='<b>Device API unavailable.</b> The frontend is not connected to the Master Studio device backend yet. No session can be started until the server is deployed and configured.';
  }
  document.querySelector('#start-device-session').addEventListener('click',async()=>{
    const out=document.querySelector('#device-result');
    const key=document.querySelector('#device-key').value.trim();
    const provider=document.querySelector('#device-provider').value;
    const type=document.querySelector('#device-type').value;
    const profile=document.querySelector('#device-profile').value;
    const appTarget=document.querySelector('#device-app').value.trim();
    state.deviceAccessKey=key;
    out.innerHTML='<p class="dialog-note">Requesting a real session from the configured '+(provider==='managed'?'managed provider':'self-hosted bridge')+'…</p>';
    try {
      const r=await fetch('/api/devices/sessions',{method:'POST',headers:{'content-type':'application/json','x-device-access-key':key},body:JSON.stringify({type,provider,profile,appTarget})});
      const data=await r.json().catch(()=>({error:'Invalid response from device backend'}));
      if(!r.ok) throw new Error(data.error||('Device backend returned '+r.status));
      if(!data.sessionId) throw new Error('Provider response did not include a session ID. No session was marked active.');
      state.activeDeviceSession={...data,provider,type};
      out.innerHTML='<div class="device-session-card"><div class="device-session-head"><span class="pulse"></span><b>Provider session created</b></div><p>Session: <code>'+escapeHTML(data.sessionId)+'</code></p><p>Status: '+escapeHTML(data.status||'created')+'</p>'+(data.launchUrl?'<a class="primary-btn" href="'+safeURL(data.launchUrl)+'" target="_blank" rel="noopener noreferrer">Open device session ↗</a>':'<p class="dialog-note">The provider did not return a launch URL. Use its documented session viewer.</p>')+'<button class="outline-btn" id="stop-device-session">End session</button></div>';
      document.querySelector('#stop-device-session')?.addEventListener('click',endDeviceSession);
    } catch(err) {
      out.innerHTML='<p class="validation-error">'+escapeHTML(err.message||'Unable to start session')+'</p><p class="dialog-note">No local demo session was created. Check provider configuration, API key, and server logs.</p>';
    }
  });
}
function escapeHTML(value) {
  return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function safeURL(value) {
  try { const u=new URL(value); if(!['https:'].includes(u.protocol)) return '#'; return u.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;'); } catch { return '#'; }
}
async function endDeviceSession() {
  const out=document.querySelector('#device-result');
  const s=state.activeDeviceSession;
  if(!s) return;
  if(!confirm('End this device session?')) return;
  out.innerHTML='<p class="dialog-note">Ending provider session…</p>';
  try {
    const r=await fetch('/api/devices/sessions/'+encodeURIComponent(s.sessionId),{method:'DELETE',headers:{'x-device-access-key':state.deviceAccessKey,'content-type':'application/json'},body:JSON.stringify({provider:s.provider})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok) throw new Error(data.error||('Device backend returned '+r.status));
    state.activeDeviceSession=null;
    out.innerHTML='<p class="validation-ok">Provider confirmed the session was ended.</p>';
  } catch(err) {
    out.innerHTML='<p class="validation-error">'+escapeHTML(err.message||'Could not end session')+'</p>';
  }
}

function showAI() {
  const dialog=document.querySelector('#module-dialog');
  document.querySelector('#dialog-content').innerHTML='<div class="eyebrow">LOCAL AI WORKSPACE</div><div class="dialog-icon">✳</div><h2>Configure your model endpoint</h2><p>Enter a local endpoint for your own inference server. This demo stores nothing and sends no requests.</p><label class="field-label" for="endpoint">Endpoint URL</label><input id="endpoint" class="dialog-input" placeholder="http://localhost:11434" /><label class="field-label" for="model">Model name (optional)</label><input id="model" class="dialog-input" placeholder="e.g. your-local-model" /><p class="dialog-note">Do not enter API secrets here. A production adapter should proxy requests server-side and validate destinations.</p><button class="primary-btn" id="save-endpoint">Validate format <span>→</span></button><div id="endpoint-result"></div>';
  dialog.showModal();
  document.querySelector('#save-endpoint').addEventListener('click',()=>{const v=document.querySelector('#endpoint').value.trim();const out=document.querySelector('#endpoint-result');try{const u=new URL(v);if(!['http:','https:'].includes(u.protocol))throw Error();out.innerHTML='<p class="validation-ok">URL format looks valid. No connection test was performed.</p>';}catch{out.innerHTML='<p class="validation-error">Enter a valid http:// or https:// endpoint URL.</p>';}});
}
function showSettings() {
 const d=document.querySelector('#module-dialog');document.querySelector('#dialog-content').innerHTML='<div class="eyebrow">WORKSPACE PREFERENCES</div><div class="dialog-icon">⚙</div><h2>Workspace settings</h2><p>Change the appearance or inspect current project setup.</p><div class="settings-row"><span>Appearance</span><button class="outline-btn" id="theme-setting">Toggle light / dark</button></div><div class="settings-row"><span>Build</span><b>0.1.0 · Vite</b></div><div class="settings-row"><span>Integration status</span><b>References only</b></div><p class="dialog-note">Upstream modules are not cloned or running inside this site yet. See the integration plan before enabling connectors.</p>';d.showModal();document.querySelector('#theme-setting').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';render();showSettings();});
}
render();
