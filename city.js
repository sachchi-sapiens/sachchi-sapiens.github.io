'use strict';
(() => {
  const canvas=document.querySelector('#city-canvas'),ctx=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let layer='mobility',points=false,paused=reduced.matches,angle=-.12,dragging=false,lastX=0,phase=0,visible=true,lastFrame=0;
  const insights={mobility:'How could a better understanding of movement make everyday journeys easier?',places:'A neighbourhood is more than its buildings. What makes a place useful to the people in it?',intelligence:'Useful intelligence connects a signal to a decision—and a decision to a better experience.'};
  const buildings=[];
  for(let x=0;x<7;x++)for(let y=0;y<7;y++){
    if(x===3||y===3)continue;
    const park=(x===1&&y===1)||(x===5&&y===4)||(x===0&&y===5);
    buildings.push({x:x+.18,y:y+.18,w:.63,d:.63,h:park?0:20+((x*19+y*31)%5)*13,park,type:(x*7+y)%3});
  }
  function drawCity(){
    if(!ctx)return;
    const r=canvas.getBoundingClientRect(),W=r.width,H=r.height;if(!W||!H)return;
    const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const unit=Math.min(W/12,H/7.7),heightScale=unit/42;
    const project=(x,y,z=0)=>{const dx=x-3.5,dy=y-3.5,rx=dx*Math.cos(angle)-dy*Math.sin(angle),ry=dx*Math.sin(angle)+dy*Math.cos(angle);return [W*.51+(rx-ry)*unit*.74,H*.56+(rx+ry)*unit*.39-z*heightScale];};
    const poly=(coords,fill,stroke='#b9a4cf',lw=.7)=>{ctx.beginPath();coords.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
    const line=(coords,stroke,width=1)=>{ctx.beginPath();coords.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();};
    const dot=(p,r,color)=>{ctx.beginPath();ctx.arc(p[0],p[1],r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();};
    // The model is a sketch: no real locations, populations or outcomes are encoded.
    const base=[project(-.08,-.08),project(7.08,-.08),project(7.08,7.08),project(-.08,7.08)];
    poly(base.map(p=>[p[0],p[1]+8]),'#c6b6db','#bcabd2');poly(base,'#ddd1ee','#bca8d0');
    for(let i=0;i<=7;i++){line([project(i,0),project(i,7)],'#c5b4d8',1);line([project(0,i),project(7,i)],'#c5b4d8',1);}
    line([project(3.5,0),project(3.5,7)],'#f8f5ff',unit*.55);line([project(0,3.5),project(7,3.5)],'#f8f5ff',unit*.55);
    ctx.setLineDash([3,5]);line([project(3.5,0),project(3.5,7)],'#c3b5d7',.6);line([project(0,3.5),project(7,3.5)],'#c3b5d7',.6);ctx.setLineDash([]);
    const sorted=[...buildings].sort((a,b)=>{const pa=project(a.x,a.y),pb=project(b.x,b.y);return pa[1]-pb[1];});
    for(const b of sorted){
      const a=project(b.x,b.y),d=project(b.x+b.w,b.y+b.d);
      if(b.park){
        poly([project(b.x,b.y),project(b.x+b.w,b.y),project(b.x+b.w,b.y+b.d),project(b.x,b.y+b.d)],layer==='places'?'#a8bb83':'#c5caa5','#a1ad83');
        for(let k=0;k<4;k++){const px=b.x+.15+(k%2)*.3,py=b.y+.15+Math.floor(k/2)*.3,baseTree=project(px,py),topTree=project(px,py,12);line([baseTree,topTree],'#7f855c',1.5);dot(topTree,unit*.11,layer==='places'?'#849f62':'#a3ad81');}
        continue;
      }
      const h=b.h*(layer==='places'?1.07:1),foot=[project(b.x,b.y),project(b.x+b.w,b.y),project(b.x+b.w,b.y+b.d),project(b.x,b.y+b.d)],roof=[project(b.x,b.y,h),project(b.x+b.w,b.y,h),project(b.x+b.w,b.y+b.d,h),project(b.x,b.y+b.d,h)];
      if(points){
        const faces=[[roof[0],roof[1],roof[2],roof[3]],[foot[1],foot[2],roof[2],roof[1]],[foot[2],foot[3],roof[3],roof[2]]];
        for(const f of faces)for(let u=0;u<=1;u+=.2)for(let v=0;v<=1;v+=.18){const p=[(1-u)*(1-v)*f[0][0]+u*(1-v)*f[1][0]+u*v*f[2][0]+(1-u)*v*f[3][0],(1-u)*(1-v)*f[0][1]+u*(1-v)*f[1][1]+u*v*f[2][1]+(1-u)*v*f[3][1]];dot(p,.9,'#6d558a');}
      }else{
        let colors=b.type===0?['#f2e2c3','#d1b99a','#e1cbae']:b.type===1?['#efebf7','#bcacd4','#d2c6e3']:['#d9cced','#a793c3','#c0add9'];
        if(layer==='intelligence'&&b.type===1)colors=['#e0d5fb','#bba4e4','#cdb9ed'];
        poly([foot[1],foot[2],roof[2],roof[1]],colors[1]);poly([foot[2],foot[3],roof[3],roof[2]],colors[2]);poly(roof,colors[0]);
        const levels=Math.floor(h/15);for(let n=1;n<levels;n++){const zz=n*15;line([project(b.x+b.w,b.y+.05,zz),project(b.x+b.w,b.y+b.d-.05,zz)],'#9e85b544',.6);line([project(b.x+.05,b.y+b.d,zz),project(b.x+b.w-.05,b.y+b.d,zz)],'#9e85b544',.6);}
        if(h>60){const c=project(b.x+.31,b.y+.31,h+7);line([project(b.x+.31,b.y+.31,h),c],'#9d86b5',1);dot(c,1.5,'#8c6ca9');}
      }
    }
    if(layer==='mobility'){
      for(let k=0;k<12;k++){
        const t=(phase*.18+k/12)%1,axis=k%2===0,pos=t*7,p=axis?project(3.5,pos,3):project(pos,3.5,3),trail=axis?project(3.5,Math.max(0,pos-.18),3):project(Math.max(0,pos-.18),3.5,3);
        line([trail,p],k%3===0?'#bc745c':'#7c5ead',3);dot(p,2.2,k%3===0?'#f2ba8d':'#6b4b9d');
      }
    }
    if(layer==='places'){
      for(const b of buildings.filter(b=>b.park)){const c=project(b.x+.3,b.y+.3,20),radius=unit*(.5+.1*Math.sin(phase*2));ctx.beginPath();ctx.ellipse(c[0],c[1]+7,radius,radius*.42,0,0,Math.PI*2);ctx.strokeStyle='#7f9b6880';ctx.lineWidth=1;ctx.stroke();dot(c,3,'#6b864c');}
    }
    if(layer==='intelligence'){
      const nodes=[[1.5,2.5,95],[4.5,1.5,92],[5.5,5.5,80],[1.5,5.5,95],[3.5,3.5,130]].map(c=>project(...c));
      for(let i=0;i<4;i++){ctx.setLineDash([3,5]);line([nodes[i],nodes[4]],'#8862b8',1);ctx.setLineDash([]);const t=(phase*.3+i*.23)%1;dot([nodes[i][0]*(1-t)+nodes[4][0]*t,nodes[i][1]*(1-t)+nodes[4][1]*t],2.5,'#f0be7b');}
      nodes.forEach((p,i)=>{dot(p,i===4?6:3,'#8c65bc');dot(p,i===4?3:1.5,'#f6edff');});
    }
    // A tiny compass reinforces the spatial metaphor without geographic claims.
    ctx.font='10px "IBM Plex Mono", monospace';ctx.fillStyle='#9e89b2';ctx.fillText('N ↗',W-51,24);
  }
  document.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>{layer=b.dataset.layer;document.querySelectorAll('[data-layer]').forEach(t=>{const on=t===b;t.classList.toggle('active',on);t.setAttribute('aria-pressed',on);});document.querySelector('#city-insight').textContent=insights[layer];drawCity();}));
  document.querySelector('#city-points').addEventListener('click',e=>{points=!points;e.currentTarget.setAttribute('aria-pressed',points);drawCity();});
  document.querySelector('#city-rotate').addEventListener('click',()=>{angle+=Math.PI/2;drawCity();});
  function motionState(){const b=document.querySelector('#city-pause');b.textContent=paused?'▷':'Ⅱ';b.setAttribute('aria-label',paused?'Play city animation':'Pause city animation');b.setAttribute('aria-pressed',paused);}
  document.querySelector('#city-pause').addEventListener('click',()=>{paused=!paused;motionState();});
  canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!dragging)return;angle+=(e.clientX-lastX)*.007;lastX=e.clientX;drawCity();});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
  reduced.addEventListener('change',()=>{paused=reduced.matches;motionState();drawCity();});
  new ResizeObserver(drawCity).observe(canvas);new IntersectionObserver(e=>visible=e[0].isIntersecting,{rootMargin:'50px'}).observe(canvas);
  function frame(now){requestAnimationFrame(frame);if(!visible||document.hidden||paused||now-lastFrame<45)return;const dt=lastFrame?Math.min((now-lastFrame)/1000,.1):.04;lastFrame=now;phase+=dt;drawCity();}
  motionState();drawCity();requestAnimationFrame(frame);

  const routes={
    engineer:{title:'I enjoy the work behind a useful AI experience.',description:'APIs, retrieval, agent state and evaluation: I’m building the engineering foundations that turn a model into a working system.',link:'#project-agents',label:'Explore my AI work'},
    product:{title:'The engineering is one part. The problem is the starting point.',description:'I want to grow at the intersection of AI and business: understand the user, question the assumptions and help shape products with a clear reason to exist.',link:'#about',label:'See where I’m heading'},
    person:{title:'Curiosity is the part of my background that keeps growing.',description:'I love to write and want to keep learning. Cities, intelligent systems and business all give me new ways to connect ideas—and new questions to take seriously.',link:'#writing',label:'Open my notebook'}
  };
  function showRoute(key){const route=routes[key];document.querySelectorAll('[data-route]').forEach(b=>{const on=b.dataset.route===key;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;});document.querySelector('#route-panel').setAttribute('aria-labelledby','route-'+key);document.querySelector('#route-statement').textContent=route.title;document.querySelector('#route-description').textContent=route.description;const a=document.querySelector('#route-link');a.href=route.link;a.innerHTML=route.label+' <span>↗</span>';}
  document.querySelectorAll('[data-route]').forEach(b=>{b.addEventListener('click',()=>showRoute(b.dataset.route));b.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const keys=Object.keys(routes),i=keys.indexOf(b.dataset.route),next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;showRoute(keys[next]);document.querySelector('[data-route="'+keys[next]+'"]').focus();});});
  const notebook=document.querySelector('#notebook-content'),writing=notebook.innerHTML;
  const notebooks={writing,learning:'<span class="micro">NOTES / 02</span><h3>Comfortable being a beginner.</h3><p>I want to learn more about the decisions around the code: how people use a product, how businesses create value and how we can tell whether something is actually helping.</p><ul class="notebook-list"><li><span>01</span><div><h4>Product discovery & user understanding</h4><p>Getting closer to the problem before deciding what to build, and translating real needs into a useful product direction.</p></div></li><li><span>02</span><div><h4>AI evaluation & product judgement</h4><p>Learning to connect model quality, reliability and cost to the experience and outcome a person needs.</p></div></li><li><span>03</span><div><h4>Business thinking & urban informatics</h4><p>Understanding incentives, trade-offs and the relationships between people, places and intelligent systems.</p></div></li></ul>',direction:'<span class="micro">NOTES / 03</span><h3>Technically thoughtful.<br>Useful in someone’s day.</h3><p>My direction is toward AI products: combining the craft of engineering with a clear understanding of the business and the human context.</p><ul class="notebook-list"><li><span>↗</span><div><h4>AI that fits into a real workflow</h4><p>Systems that help someone make progress on a task, with engineering and evaluation that support that purpose.</p></div></li><li><span>↗</span><div><h4>Tools that make complex systems legible</h4><p>Ways to turn complicated data into explanations and decisions people can understand—especially in connected urban settings.</p></div></li><li><span>↗</span><div><h4>A body of writing that grows with me</h4><p>Clear, curious explanations of what I’m learning at the intersection of technology, business and everyday life.</p></div></li></ul>'};
  document.querySelectorAll('[data-notebook]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-notebook]').forEach(t=>{const on=t===b;t.classList.toggle('active',on);t.setAttribute('aria-pressed',on);});notebook.innerHTML=notebooks[b.dataset.notebook];}));
})();
