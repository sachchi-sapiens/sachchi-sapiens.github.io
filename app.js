'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const P = window.PROFILE;
const escapeHTML = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let selectedFilter = 'all', experienceFilter = 'all', chartSeries = 'sgpa', selectedSemester = 9;
let dialogReturnHash = '#work';

function visualMarkup(kind) {
  const open = '<svg viewBox="0 0 600 300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">';
  if (kind === 'agents') return open + '<defs><pattern id="grid-a" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="#e2d8ff" stroke-opacity=".08"/></pattern></defs><rect width="600" height="300" fill="url(#grid-a)"/><g fill="none" stroke="#a99bdf" stroke-width="1"><path d="M82 124H185L235 82H344L398 124H515M82 124H185L235 165H344L398 124M290 82V165"/><circle cx="82" cy="124" r="20"/><circle cx="290" cy="82" r="22"/><circle cx="290" cy="165" r="22"/><circle cx="515" cy="124" r="20"/><rect x="160" y="107" width="35" height="35" rx="5"/><rect x="380" y="106" width="36" height="36" rx="5"/></g><g fill="#e2d8ff" font-family="monospace" font-size="11" text-anchor="middle"><text x="82" y="127">IN</text><text x="290" y="85">LLM</text><text x="290" y="168">RAG</text><text x="515" y="127">OUT</text><text x="177" y="129">API</text><text x="398" y="129">EVAL</text></g><g fill="#e2d8ff"><circle cx="212" cy="101" r="3"/><circle cx="363" cy="98" r="3"/><circle cx="451" cy="124" r="3"/></g></svg>';
  if (kind === 'glaciers') {
    let lines='';for(let i=0;i<17;i++){let path='';for(let x=-30;x<=630;x+=10){const y=75+i*8+Math.sin(x/75+i*.23)*24+Math.cos(x/31+i*.1)*7;path+=(x===-30?'M':'L')+x+' '+y.toFixed(2);}lines+='<path d="'+path+'"/>';}
    return open+'<g fill="none" stroke="#487b76" stroke-opacity=".28" stroke-width=".7">'+lines+'</g><path d="M207 84L251 67L270 91L306 94L324 121L355 129L335 158L298 160L277 143L243 150L220 127Z" fill="#2a6d66" fill-opacity=".85"/><path d="M370 62L392 54L413 71L400 90L375 85Z" fill="#387c74" fill-opacity=".7"/><g fill="none" stroke="#1f655f" stroke-width=".8"><circle cx="301" cy="121" r="62" stroke-dasharray="2 5"/><path d="M301 47V195M227 121H375"/></g><g fill="#1e544d"><circle cx="232" cy="85" r="3"/><circle cx="341" cy="156" r="3"/><circle cx="391" cy="73" r="3"/></g><text x="363" y="182" fill="#255a53" font-size="10" font-family="monospace">LAKE CHANGE / OBSERVATION STUDY</text></svg>';
  }
  if (kind === 'drone') {
    let lines='';for(let j=0;j<15;j++){let d='';for(let x=70;x<=540;x+=10){const z=Math.exp(-Math.pow((x-315)/100,2))*50;const y=100+j*4+(Math.sin(x/70)*13)-z*Math.cos(j*.15);d+=(x===70?'M':'L')+x+' '+y;}lines+='<path d="'+d+'"/>';}
    return open+'<g fill="none" stroke="#527044" stroke-width=".8" stroke-opacity=".7">'+lines+'</g><path d="M115 64H480V175H115V64L205 175V64L298 175V64L388 175V64" fill="none" stroke="#526d40" stroke-width=".7" stroke-dasharray="4 5"/><g transform="translate(393 66)" stroke="#24442d" fill="none" stroke-width="1.5"><path d="M-12-12L12 12M12-12L-12 12"/><circle cx="-14" cy="-14" r="8"/><circle cx="14" cy="14" r="8"/><circle cx="14" cy="-14" r="8"/><circle cx="-14" cy="14" r="8"/><rect x="-5" y="-5" width="10" height="10"/></g><text x="90" y="194" fill="#36502d" font-size="10" font-family="monospace">FLIGHT PATH → IMAGE CAPTURE → SPATIAL MODEL</text></svg>';
  }
  if(kind === 'redmud'){
    let particles='';for(let i=0;i<100;i++){const x=90+(i*73%430),y=65+(i*47%115),r=2+(i%4);particles+='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#9d5e38" opacity="'+(.12+(i%5)*.08)+'"/>';}
    return open+'<g>'+particles+'</g><g fill="none" stroke="#784e34" stroke-width="1"><path d="M126 56V184H495"/><path d="M143 165C180 100 220 90 280 86S390 84 466 82"/><path d="M143 154C185 158 222 151 259 130S364 110 466 112" stroke-dasharray="4 4"/></g><g fill="#784e34" font-size="10" font-family="monospace"><text x="139" y="50">BEHAVIOUR OVER TIME</text><text x="409" y="199">TIME →</text></g></svg>';
  }
  if(kind==='analytics')return open+'<g stroke="#8b9e76" stroke-opacity=".35" stroke-width=".7"><path d="M110 66H500M110 102H500M110 138H500M110 174H500"/></g><g fill="#668657"><rect x="143" y="114" width="35" height="60"/><rect x="219" y="97" width="35" height="77"/><rect x="295" y="80" width="35" height="94"/><rect x="371" y="104" width="35" height="70"/></g><g fill="#a4bb8c"><rect x="181" y="102" width="20" height="72"/><rect x="257" y="81" width="20" height="93"/><rect x="333" y="91" width="20" height="83"/><rect x="409" y="75" width="20" height="99"/></g><path d="M160 91L237 78L312 63L397 79L459 54" fill="none" stroke="#294a2f" stroke-width="1.5"/><g fill="#294a2f"><circle cx="160" cy="91" r="3"/><circle cx="237" cy="78" r="3"/><circle cx="312" cy="63" r="3"/><circle cx="397" cy="79" r="3"/><circle cx="459" cy="54" r="3"/></g><text x="116" y="197" font-size="10" fill="#425537" font-family="monospace">DATA → PATTERNS → BUSINESS QUESTIONS</text></svg>';
  let dots='';for(let i=0;i<65;i++)dots+='<circle cx="'+(115+i%13*29)+'" cy="'+(69+Math.floor(i/13)*24)+'" r="'+(i%9===0?5:3)+'" fill="'+(i%9===0?'#5e6238':'#9c9c70')+'"/>';
  return open+dots+'<path d="M96 49V187H493" fill="none" stroke="#7f8355" stroke-width=".7"/><text x="114" y="206" font-size="10" fill="#676a43" font-family="monospace">65 HOUSEHOLDS / MANY PERSPECTIVES</text></svg>';
}
function renderProjects(filter='all') {
  selectedFilter=filter;
  const order=['agents','analytics','field','drone','glaciers','redmud'];
  const projects=P.projects.filter(p=>filter==='all'||p.category===filter).sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
  $('#project-grid').innerHTML=projects.map(p=>'<article class="project-card"><button class="project-open" data-project="'+p.id+'" aria-label="Read case study: '+escapeHTML(p.short)+'"><div class="project-visual visual-'+p.visual+'"><div class="visual-top"><span>'+escapeHTML(p.category.toUpperCase()+' / '+p.number)+'</span><span>CASE STUDY ↗</span></div>'+visualMarkup(p.visual)+'<div class="visual-bottom"><div><strong>'+escapeHTML(p.metric)+'</strong><small>'+escapeHTML(p.metricLabel)+'</small></div><span class="visual-open">↗</span></div></div><div class="project-info"><div><h3>'+escapeHTML(p.short)+'</h3><p>'+escapeHTML(p.context)+' · '+escapeHTML(p.date)+'</p></div><span class="project-number">/'+p.number+'</span></div></button><div class="project-tags">'+p.tags.map(t=>'<span>'+escapeHTML(t)+'</span>').join('')+'</div></article>').join('');
  $$('[data-filter]').forEach(b=>{const on=b.dataset.filter===filter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
  $('#project-count').textContent='SHOWING '+String(projects.length).padStart(2,'0')+' / 06';
}
function openProject(id, updateHash=true) {
  const p=P.projects.find(x=>x.id===id);if(!p)return;
  if(!location.hash.startsWith('#project-'))dialogReturnHash=location.hash||'#work';
  $('#dialog-kicker').textContent=p.type.toUpperCase()+' / '+p.number;
  $('#dialog-body').innerHTML='<article class="dialog-content"><h2 id="dialog-title">'+escapeHTML(p.title)+'</h2><p class="dialog-context">'+escapeHTML(p.context)+'<br>'+escapeHTML(p.date)+'</p><div class="project-tags">'+p.tags.map(t=>'<span>'+escapeHTML(t)+'</span>').join('')+'</div><p class="dialog-summary">'+escapeHTML(p.summary)+'</p><div class="dialog-metric"><strong>'+escapeHTML(p.metric)+'</strong><p>'+escapeHTML(p.metricLabel)+'</p></div><div class="pipeline" aria-label="Project workflow">'+p.pipeline.map((s,i)=>'<span><b>0'+(i+1)+'</b>'+escapeHTML(s)+'</span>').join('')+'</div><section class="dialog-section"><h3>The question</h3><p>'+escapeHTML(p.challenge)+'</p></section><section class="dialog-section"><h3>My contribution</h3><ul>'+p.work.map(t=>'<li>'+escapeHTML(t)+'</li>').join('')+'</ul></section><section class="dialog-section"><h3>Outcome & scope</h3><p>'+escapeHTML(p.result)+'</p></section><div class="dialog-takeaway"><p>'+escapeHTML(p.takeaway)+'</p></div><p class="dialog-footnote">Project visuals illustrate the ideas and workflows behind the work.</p></article>';
  const d=$('#project-dialog');if(!d.open)d.showModal();d.scrollTop=0;document.body.style.overflow='hidden';
  if(updateHash)history.replaceState(null,'','#project-'+id);
}
function closeProject(){const d=$('#project-dialog');if(d.open)d.close();}
$('#project-dialog').addEventListener('close',()=>{document.body.style.overflow='';if(location.hash.startsWith('#project-'))history.replaceState(null,'',dialogReturnHash);});
$('#dialog-close').addEventListener('click',closeProject);
$('#project-dialog').addEventListener('click',e=>{if(e.target===$('#project-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeProject();}});
function renderExperience(filter='all'){
  experienceFilter=filter;
  $('#experience-list').innerHTML=P.experience.filter(e=>filter==='all'||e.group===filter).map((e,i)=>'<article class="experience-row"><div class="experience-date">'+(e.date.includes('present')?'<i></i>':'')+escapeHTML(e.date)+'</div><div class="experience-company"><h3>'+escapeHTML(e.company)+'</h3><h4>'+escapeHTML(e.role)+'</h4><p>'+escapeHTML(e.place)+'</p></div><div class="experience-description"><p>'+escapeHTML(e.text)+'</p><div class="tags">'+e.tags.map(t=>'<span>'+escapeHTML(t)+'</span>').join('')+'</div>'+(e.note?'<p class="exp-note">'+escapeHTML(e.note)+'</p>':'')+'</div><button class="row-arrow" data-project="'+e.project+'" aria-label="Explore '+escapeHTML(e.company)+' work">↗</button></article>').join('');
  $$('[data-experience]').forEach(b=>{const on=b.dataset.experience===filter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
}
function renderChart(){
  const v=P[chartSeries],x=i=>40+i*60,y=val=>220-val*19;
  const points=v.map((n,i)=>[x(i),y(n)]),line=points.map(([xx,yy],i)=>(i?'L':'M')+xx+' '+yy).join(' ');
  let markup='<defs><linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a99bdf" stop-opacity=".2"/><stop offset="100%" stop-color="#a99bdf" stop-opacity="0"/></linearGradient></defs>';
  for(let t=0;t<=10;t+=2)markup+='<path d="M40 '+y(t)+'H580" stroke="#d9d5e3" stroke-width=".7"'+(t?' stroke-dasharray="3 5"':'')+'/><text x="16" y="'+(y(t)+3)+'" font-family="monospace" font-size="12" fill="#647068">'+t+'</text>';
  markup+='<path d="'+line+' L580 220 L40 220Z" fill="url(#chart-area)"/><path d="'+line+'" stroke="#6252a3" stroke-width="2" fill="none"/>';
  points.forEach(([xx,yy],i)=>{
    const on=i===selectedSemester;
    markup+='<text x="'+xx+'" y="242" text-anchor="middle" font-family="monospace" font-size="12" fill="#647068">S'+(i+1)+'</text>';
    if(on)markup+='<path d="M'+xx+' '+yy+'V220" stroke="#9c87cf" stroke-dasharray="3 4"/><circle cx="'+xx+'" cy="'+yy+'" r="9" fill="#e2d8ff"/>';
    markup+='<circle tabindex="0" role="button" aria-label="Semester '+(i+1)+', '+chartSeries.toUpperCase()+' '+v[i].toFixed(2)+' out of 10" aria-pressed="'+on+'" data-point="'+i+'" cx="'+xx+'" cy="'+yy+'" r="'+(on?5:4)+'" fill="'+(on?'#292335':'#f7f7f2')+'" stroke="#6252a3" stroke-width="1.5" style="cursor:pointer"><title>Semester '+(i+1)+': '+v[i].toFixed(2)+'</title></circle>';
  });
  $('#grade-chart').innerHTML=markup;
  $('#grade-chart').setAttribute('aria-label',chartSeries==='sgpa'?'Semester grade point averages across ten semesters, on a scale of zero to ten.':'Cumulative grade point averages after each of ten semesters, on a scale of zero to ten.');
  updateGradeText();
}
function updateGradeText(){
  $('#grade-value').textContent=P[chartSeries][selectedSemester].toFixed(2);
  $('#grade-semester').textContent='SEMESTER '+(selectedSemester+1);
  $('#grade-description').textContent=(chartSeries==='sgpa'?'Semester':'Cumulative')+' grade point average · /10';
  $('#chart-title').textContent=chartSeries==='sgpa'?'Semester performance':'Cumulative performance';
}
$('#grade-table').innerHTML=P.sgpa.map((n,i)=>'<tr><th scope="row">'+(i+1)+'</th><td>'+n.toFixed(2)+'</td><td>'+P.cgpa[i].toFixed(2)+'</td></tr>').join('');
document.addEventListener('click',e=>{
  const caseLink=e.target.closest('a[href^="#project-"]');if(caseLink){e.preventDefault();openProject(caseLink.getAttribute('href').slice(9));}
  const project=e.target.closest('[data-project]');if(project)openProject(project.dataset.project);
  const filter=e.target.closest('[data-filter]');if(filter)renderProjects(filter.dataset.filter);
  const go=e.target.closest('[data-go-filter]');if(go)renderProjects(go.dataset.goFilter);
  const exp=e.target.closest('[data-experience]');if(exp)renderExperience(exp.dataset.experience);
  const series=e.target.closest('[data-chart]');if(series){chartSeries=series.dataset.chart;$$('[data-chart]').forEach(b=>{const on=b===series;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});renderChart();}
  const point=e.target.closest('[data-point]');if(point){selectedSemester=Number(point.dataset.point);renderChart();}
});
$('#grade-chart').addEventListener('keydown',e=>{
  if(!e.target.matches('[data-point]'))return;
  let i=Number(e.target.dataset.point);
  if(e.key==='ArrowRight')i=(i+1)%10;else if(e.key==='ArrowLeft')i=(i+9)%10;else if(e.key==='Enter'||e.key===' '){e.preventDefault();selectedSemester=i;renderChart();$('[data-point="'+i+'"]').focus();return;}else return;
  e.preventDefault();selectedSemester=i;renderChart();$('[data-point="'+i+'"]').focus();
});
const menu=$('.menu-toggle'),mobile=$('#mobile-nav');
menu.addEventListener('click',()=>{const on=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',on);menu.setAttribute('aria-label',on?'Close navigation':'Open navigation');mobile.hidden=!on;});
$$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');mobile.hidden=true;}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobile.hidden){mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.focus();}});
let toastTimer;
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
$('#copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(P.email);toast('Email address copied.');}catch{toast('Copy this address: '+P.email);}});
let scrollPending=false;
addEventListener('scroll',()=>{if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.scroll-progress').style.width=(max>0?scrollY/max*100:0)+'%';scrollPending=false;});},{passive:true});
renderProjects();renderExperience();renderChart();
if(location.hash.startsWith('#project-'))openProject(location.hash.slice(9),false);
addEventListener('hashchange',()=>{if(location.hash.startsWith('#project-'))openProject(location.hash.slice(9),false);});

