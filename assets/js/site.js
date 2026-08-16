/* Shared behaviour: nav, carousel, widgets, chatbot */
(function(){
'use strict';

var WA = 'https://wa.me/27615040294';
var EMAIL = 'admin@bikitshaot.co.za';

/* =============== mobile nav =============== */
var navToggle = document.querySelector('.nav-toggle');
if(navToggle){
  var navLinks = document.querySelector('.nav-links');
  navToggle.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
}

/* =============== hero carousel =============== */
var car = document.querySelector('.carousel');
if(car){
  var slides = car.querySelector('.slides');
  var n = slides.children.length;
  var dotsHolder = car.querySelector('.car-dots');
  var idx = 0, timer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for(var i=0;i<n;i++){
    var d = document.createElement('button');
    d.className = 'car-dot' + (i===0?' active':'');
    d.setAttribute('aria-label','Go to slide '+(i+1));
    d.dataset.i = i;
    dotsHolder.appendChild(d);
  }
  var dots = dotsHolder.querySelectorAll('.car-dot');

  function go(i){
    idx = (i+n)%n;
    slides.style.transform = 'translateX(-'+(idx*100)+'%)';
    dots.forEach(function(d,j){ d.classList.toggle('active', j===idx); });
  }
  function play(){ if(!reduced){ stop(); timer = setInterval(function(){ go(idx+1); }, 6500); } }
  function stop(){ if(timer){ clearInterval(timer); timer=null; } }

  dotsHolder.addEventListener('click', function(e){
    if(e.target.classList.contains('car-dot')){ go(+e.target.dataset.i); play(); }
  });
  car.querySelector('.car-arrow.prev').addEventListener('click', function(){ go(idx-1); play(); });
  car.querySelector('.car-arrow.next').addEventListener('click', function(){ go(idx+1); play(); });
  car.addEventListener('mouseenter', stop);
  car.addEventListener('mouseleave', play);
  car.addEventListener('focusin', stop);
  car.addEventListener('focusout', play);

  var tx = null;
  car.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; stop(); }, {passive:true});
  car.addEventListener('touchend', function(e){
    if(tx===null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if(Math.abs(dx) > 45) go(idx + (dx<0?1:-1));
    tx = null; play();
  }, {passive:true});

  play();
}

/* =============== service cards + faq accordions =============== */
document.querySelectorAll('.svc-more').forEach(function(btn){
  btn.addEventListener('click', function(){
    var open = btn.closest('.svc').classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
});
document.querySelectorAll('.faq-q').forEach(function(btn){
  btn.addEventListener('click', function(){
    var open = btn.closest('.faq-item').classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
});

/* =============== life path =============== */
var lpTrack = document.getElementById('lpTrack');
if(lpTrack){
  var lpFill = document.getElementById('lpFill');
  var lpWalker = document.getElementById('lpWalker');
  var lpRange = document.getElementById('lpRange');
  var lpStage = document.getElementById('lpStage');
  var lpLen = lpTrack.getTotalLength();
  lpFill.style.strokeDasharray = lpLen;
  var STAGES = [
    [0,'Prenatal & infancy · the very beginning'],
    [15,'Childhood · ages 2–12'],
    [35,'Adolescence · ages 13–17'],
    [50,'Adulthood · working years'],
    [80,'Later adulthood'],
    [92,'Old age · staying engaged']
  ];
  var updatePath = function(){
    var v = +lpRange.value;
    lpFill.style.strokeDashoffset = lpLen * (1 - v/100);
    var pt = lpTrack.getPointAtLength(lpLen * v/100);
    lpWalker.setAttribute('transform','translate('+pt.x+' '+pt.y+')');
    var label = STAGES[0][1];
    STAGES.forEach(function(s){ if(v>=s[0]) label=s[1]; });
    lpStage.textContent = label;
    document.querySelectorAll('.svc[data-min]').forEach(function(card){
      var inRange = v >= +card.dataset.min && v <= +card.dataset.max;
      card.classList.toggle('lit', inRange);
      card.classList.toggle('dim', !inRange);
    });
  };
  lpRange.addEventListener('input', updatePath);
  updatePath();
}

/* =============== guided finder wizard =============== */
var wizBody = document.getElementById('wizBody');
if(wizBody){
  var SERVICES = {
    paeds:{name:'Paediatrics', blurb:'Play-based therapy that helps children master the developmental, learning and functional skills they need at home, at school and in the community.'},
    adults:{name:'Adolescents & Adults', blurb:'One-on-one occupational therapy building life skills, emotional regulation and day-to-day functioning through purposeful activity.'},
    group:{name:'Group-Based Intervention', blurb:'A supportive group setting for developing social skills and working through interpersonal challenges where they actually happen — with other people.'},
    work:{name:'Work-Based Intervention', blurb:'Evaluating person–job fit and supporting employee wellness — for individuals, teams and corporate clients.'},
    fce:{name:'Full Functional Capacity Evaluation', blurb:'A standardised, comprehensive assessment of how injury or illness has affected physical, psychosocial and cognitive functioning.'},
    legal:{name:'Medico-Legal Services', blurb:'Independent assessment and reporting on functional levels for clients affected by injury, accident or medical negligence — available throughout South Africa.'}
  };
  var WIZ = {
    who:{ q:'Who needs support?', opts:[
      {t:'My child', s:'Development, school, play or emotions', next:'concernChild'},
      {t:'Myself', s:'An adolescent or adult seeking support', next:'concernSelf'},
      {t:'My employees or workplace', s:'Corporate wellness or person–job fit', pick:'work', skip:true},
      {t:'A legal or medical claim', s:'Injury, accident or negligence matter', pick:'legal', skip:true}
    ]},
    concernChild:{ q:'What feels like the main concern?', opts:[
      {t:'Milestones & development', s:'Movement, coordination, everyday skills', pick:'paeds'},
      {t:'School & learning', s:'Concentration, handwriting, school readiness', pick:'paeds'},
      {t:'Friendships & social skills', s:'Connecting and getting along with others', pick:'group'},
      {t:'Big emotions', s:'Regulation, meltdowns, anxiety at home or school', pick:'paeds'}
    ]},
    concernSelf:{ q:'What feels like the main concern?', opts:[
      {t:'Stress & emotional well-being', s:'Burnout, low mood, feeling stuck', pick:'adults'},
      {t:'Recovering function', s:'After an injury, illness or hospital stay', pick:'fce'},
      {t:'People & relationships', s:'Social confidence, conflict, connection', pick:'group'},
      {t:'Coping at work', s:'Struggling to manage or return to a job', pick:'work'}
    ]},
    format:{ q:'How would you prefer to meet?', opts:[
      {t:'In person', s:'At our rooms in Life Carstenview Hospital, Midrand', fmt:'In-person (Midrand)'},
      {t:'Telehealth', s:'A video consultation from wherever you are', fmt:'Telehealth'},
      {t:'Not sure yet', s:'Happy to be advised on what fits best', fmt:'No preference'}
    ]}
  };
  var wizBack = document.getElementById('wizBack');
  var wizHistory = [], wizState = {pick:null, fmt:null};

  var setDots = function(k, done){
    document.querySelectorAll('.step-dot').forEach(function(d,i){
      d.classList.toggle('active', i===k && !done);
      d.classList.toggle('done', i<k || done);
    });
  };
  var renderWiz = function(key){
    var node = WIZ[key];
    var stepNum = wizHistory.length;
    setDots(stepNum, false);
    wizBack.classList.toggle('show', stepNum>0);
    wizBody.innerHTML = '<div class="wizard-q">'+node.q+'</div><div class="choice-grid">' +
      node.opts.map(function(o,i){ return '<button class="choice" type="button" data-i="'+i+'"><b>'+o.t+'</b><small>'+o.s+'</small></button>'; }).join('') + '</div>';
    wizBody.querySelectorAll('.choice').forEach(function(btn){
      btn.addEventListener('click', function(){
        var o = node.opts[btn.dataset.i];
        wizHistory.push(key);
        if(o.pick) wizState.pick = o.pick;
        if(o.fmt){ wizState.fmt = o.fmt; return renderResult(); }
        if(o.skip || o.pick) return renderWiz('format');
        renderWiz(o.next);
      });
    });
  };
  var renderResult = function(){
    var svc = SERVICES[wizState.pick];
    setDots(3, true);
    wizBack.classList.add('show');
    var fmtLine = wizState.pick==='legal'
      ? 'Medico-legal assessments are arranged from private hospitals in Gauteng and external locations across South Africa.'
      : 'Preference noted: <strong>'+wizState.fmt+'</strong>.';
    wizBody.innerHTML =
      '<div class="result-card">'+
        '<span class="eyebrow">Our recommendation</span>'+
        '<h3>'+svc.name+'</h3>'+
        '<p>'+svc.blurb+'</p>'+
        '<div class="result-note">'+fmtLine+' We\'ll confirm the best fit with you before anything is booked.</div>'+
        '<div class="result-actions">'+
          '<button class="btn btn-red" type="button" id="wizBook">Book '+svc.name+'</button>'+
          '<button class="btn btn-quiet" type="button" id="wizRestart">Start over</button>'+
        '</div>'+
      '</div>';
    document.getElementById('wizBook').addEventListener('click', function(){
      prefillBooking(svc.name, wizState.fmt);
      document.getElementById('book').scrollIntoView({behavior:'smooth'});
    });
    document.getElementById('wizRestart').addEventListener('click', resetWiz);
  };
  var resetWiz = function(){ wizHistory=[]; wizState={pick:null,fmt:null}; renderWiz('who'); };
  wizBack.addEventListener('click', function(){
    var prev = wizHistory.pop();
    if(prev) renderWiz(prev); else resetWiz();
  });
  resetWiz();
}

/* =============== check-in quiz =============== */
var quizEl = document.getElementById('quiz');
if(quizEl){
  var QUIZZES = {
    parent:{
      title:'Child development check-in',
      service:'Paediatrics',
      scale:[['Rarely / never',0],['Sometimes',1],['Often',2]],
      items:[
        'My child finds everyday tasks (dressing, eating, packing a bag) harder than other children their age.',
        'Teachers mention concentration, sitting still or keeping up in class.',
        'Handwriting, drawing or using scissors is a real struggle.',
        'My child avoids playground games, climbing or ball games.',
        'Big emotions — meltdowns or shutdowns — happen more days than not.',
        'Making or keeping friends is hard for my child.',
        'Certain textures, sounds or busy places upset my child more than expected.',
        'I have a nagging feeling something is being missed.'
      ],
      bands:[
        [4,'Things look broadly on track','Nothing here suggests an urgent concern. Keep playing, keep talking — and trust your instincts. If a specific worry persists, an occupational therapist can give you clarity in a single consultation.'],
        [9,'Worth a conversation','A few patterns here are the kind occupational therapists see — and help with — every day. A once-off assessment could either reassure you or give you a practical plan. Early support makes a real difference.'],
        [99,'We\'d encourage an assessment','You\'ve noticed quite a few things — and noticing is the most important step. This does not mean anything is "wrong", but a paediatric OT assessment would give you real answers instead of worry.']
      ]
    },
    adult:{
      title:'Stress & daily-functioning check-in',
      service:'Adolescents & Adults',
      scale:[['Rarely / never',0],['Some days',1],['Most days',2]],
      items:[
        'I feel drained before the day has even started.',
        'Tasks I used to manage easily now feel like mountains.',
        'My sleep is broken, short, or never feels like enough.',
        'I\'ve stopped doing activities that used to give me joy or meaning.',
        'Concentrating at work or school takes everything I have.',
        'I feel disconnected from the people around me.',
        'Small frustrations tip me into anger or tears.',
        'I can\'t remember the last time I felt genuinely well.'
      ],
      bands:[
        [4,'You\'re managing — keep tending the basics','Your load seems manageable right now. Protect the routines that keep you well: sleep, movement, connection and activities that mean something to you.'],
        [9,'Your load is worth taking seriously','Several signs of strain show up here. Occupational therapy is practical: together we rebuild the daily structures — rest, work, connection, meaning — that carry you. One conversation is a good place to start.'],
        [99,'Please don\'t carry this alone','You\'re carrying a lot, most days. That deserves proper support, not just pushing through. We\'d encourage you to book a consultation — and if you ever feel unsafe, please contact a healthcare professional or emergency service immediately.']
      ]
    }
  };
  var trackPick = document.getElementById('trackPick');
  var quiz = null;

  document.querySelectorAll('.track-card').forEach(function(card){
    card.addEventListener('click', function(){
      quiz = {def:QUIZZES[card.dataset.track], i:0, score:0};
      trackPick.style.display='none';
      quizEl.classList.add('show');
      renderQuizQ();
      quizEl.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });

  var renderQuizQ = function(){
    var def = quiz.def, i = quiz.i;
    quizEl.innerHTML =
      '<div class="quiz-progress">'+def.title+' · question '+(i+1)+' of '+def.items.length+'</div>'+
      '<div class="quiz-q">'+def.items[i]+'</div>'+
      '<div class="quiz-opts">'+
        def.scale.map(function(s){ return '<button class="choice" type="button" data-v="'+s[1]+'"><b>'+s[0]+'</b></button>'; }).join('')+
      '</div>';
    quizEl.querySelectorAll('.choice').forEach(function(btn){
      btn.addEventListener('click', function(){
        quiz.score += +btn.dataset.v;
        quiz.i++;
        quiz.i < quiz.def.items.length ? renderQuizQ() : renderQuizResult();
      });
    });
  };
  var renderQuizResult = function(){
    var def = quiz.def, score = quiz.score;
    var max = def.items.length * 2;
    var band = null;
    def.bands.forEach(function(b){ if(!band && score<=b[0]) band=b; });
    quizEl.innerHTML =
      '<div class="quiz-result">'+
        '<span class="eyebrow">Your check-in</span>'+
        '<h3>'+band[1]+'</h3>'+
        '<div class="quiz-bar"><i style="width:'+Math.max(4, score/max*100)+'%"></i></div>'+
        '<div class="quiz-bar-label">'+score+' of '+max+' — higher simply means more patterns worth discussing.</div>'+
        '<p>'+band[2]+'</p>'+
        '<div class="result-actions">'+
          '<button class="btn btn-red" type="button" id="quizBook">Request an appointment</button>'+
          '<button class="btn btn-quiet" type="button" id="quizAgain">Retake or switch</button>'+
        '</div>'+
      '</div>';
    document.getElementById('quizBook').addEventListener('click', function(){
      prefillBooking(def.service, null);
      document.getElementById('book').scrollIntoView({behavior:'smooth'});
    });
    document.getElementById('quizAgain').addEventListener('click', function(){
      quizEl.classList.remove('show');
      trackPick.style.display='';
    });
  };
}

/* =============== booking =============== */
function prefillBooking(serviceName, fmt){
  var svcSel = document.getElementById('bkService');
  if(!svcSel) return;
  for(var i=0;i<svcSel.options.length;i++){
    if(svcSel.options[i].text === serviceName){ svcSel.selectedIndex = i; break; }
  }
  if(fmt){ document.getElementById('bkType').value = fmt; }
}
function composeMessage(){
  var g = function(id){ var el=document.getElementById(id); return el?el.value.trim():''; };
  var service=g('bkService'), type=g('bkType'), date=g('bkDate'), time=g('bkTime'), name=g('bkName'), note=g('bkNote');
  var lines = ['Hello Bikitsha OT, I\'d like to request an appointment.'];
  if(name) lines.push('Name: '+name);
  if(service) lines.push('Service: '+service);
  if(type && type!=='No preference') lines.push('Consultation: '+type);
  if(date) lines.push('Preferred date: '+date+(time && time!=='Any time' ? ' ('+time.toLowerCase()+')' : ''));
  else if(time && time!=='Any time') lines.push('Preferred time of day: '+time);
  if(note) lines.push('Note: '+note);
  return lines.join('\n');
}
var bookForm = document.getElementById('bookForm');
if(bookForm){
  bookForm.addEventListener('submit', function(e){
    e.preventDefault();
    window.open(WA+'?text='+encodeURIComponent(composeMessage()),'_blank');
  });
  var bkEmail = document.getElementById('bkEmail');
  if(bkEmail){
    bkEmail.addEventListener('click', function(){
      if(!bookForm.reportValidity()) return;
      window.location.href = 'mailto:'+EMAIL+'?subject='+encodeURIComponent('Appointment request')+'&body='+encodeURIComponent(composeMessage());
    });
  }
}

/* =============== chatbot =============== */
/* Rule-based assistant answering from site content only. */
(function(){
  var root = document.getElementById('chatbot');
  if(!root) return;

  var isHome = /(?:^|\/)(index\.html)?$/.test(location.pathname);
  var pre = isHome ? '' : 'index.html';

  var ANSWERS = [
    {
      keys:['service','offer','help with','what do you do','therapy types'],
      chip:'Our services',
      a:'We offer six core services: <b>Paediatrics</b>, <b>Adolescents & Adults</b>, <b>Group-Based Intervention</b>, <b>Work-Based Intervention</b>, <b>Full Functional Capacity Evaluations</b> and <b>Medico-Legal Services</b> (nationwide). See <a href="services.html">Services</a> — or try the <a href="'+pre+'#finder">guided finder</a> to get a personal recommendation.'
    },
    {
      keys:['child','kid','son','daughter','paediatric','pediatric','school','development','delay','screening'],
      chip:'Help for my child',
      a:'Our <b>Paediatrics</b> service helps children with development, learning and functional difficulties — at home, at school and beyond. We currently offer <b>free screenings</b> for children under 7 with a developmental delay. You can also take the two-minute <a href="'+pre+'#checkin">child development check-in</a>.'
    },
    {
      keys:['adult','myself','stress','burnout','depress','anxiet','mental'],
      chip:'Support for myself',
      a:'We support adolescents and adults with life skills, emotional regulation and daily functioning — including stress, burnout and mental-health recovery. Try the <a href="'+pre+'#checkin">self check-in</a>, or <a href="'+pre+'#book">request an appointment</a> directly.'
    },
    {
      keys:['group'],
      chip:null,
      a:'Our <b>Group-Based Intervention</b> explores social skills and addresses challenges in a supportive group setting. Groups run weekly on <b>Fridays, 13:30–15:00</b>. <a href="'+pre+'#book">Request a spot</a> and we\'ll confirm details with you.'
    },
    {
      keys:['work','corporate','employee','wellness','job'],
      chip:null,
      a:'Our <b>Work-Based Intervention</b> ensures the best fit between work and person — employee wellness for individuals and corporate companies, plus return-to-work planning and workplace assessments. <a href="'+pre+'#book">Get in touch</a> to discuss your workplace\'s needs.'
    },
    {
      keys:['legal','medico','claim','accident','negligence','injury','rif','capacity evaluation','fce'],
      chip:null,
      a:'We provide <b>Medico-Legal Services</b> — assessing and reporting on functional levels of clients affected by injury, accident or medical negligence — throughout South Africa, and <b>Full Functional Capacity Evaluations</b> (comprehensive standardised assessments). <a href="'+pre+'#book">Request an appointment</a> or WhatsApp us to discuss your matter.'
    },
    {
      keys:['where','address','location','directions','midrand','office','rooms'],
      chip:'Where are you?',
      a:'Our rooms are at <b>Life Carstenview Hospital, 181 Bekker Road, Vorna Valley, Midrand, 1685</b>. We also work from private hospitals across Gauteng, offer telehealth nationwide, and our medico-legal services extend throughout South Africa.'
    },
    {
      keys:['hour','open','time','when are you'],
      chip:'Opening hours',
      a:'We\'re open <b>Monday to Friday, 9am–5pm</b>. Group sessions run on Fridays from 13:30 to 15:00.'
    },
    {
      keys:['book','appointment','schedule','consult'],
      chip:'Book an appointment',
      a:'The quickest way is the <a href="'+pre+'#book">appointment form</a> — it composes a WhatsApp message for you to review and send. Or message us directly on <a href="https://wa.me/27615040294" target="_blank" rel="noopener">WhatsApp (+27 61 504 0294)</a>.'
    },
    {
      keys:['fee','cost','price','charge','medical aid','pay'],
      chip:'Fees & medical aid',
      a:'Fees depend on the service and assessment involved. Contact us on <a href="https://wa.me/27615040294" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:admin@bikitshaot.co.za">email</a> and we\'ll gladly talk you through costs and medical-aid options before you commit to anything.'
    },
    {
      keys:['telehealth','online','video','remote','virtual'],
      chip:null,
      a:'Yes — we offer fully functional <b>telehealth services</b> nationwide. For many concerns, especially mental-health and workplace support, telehealth works well and removes travel barriers. Some assessments do need to happen in person; we\'ll advise you honestly when you book.'
    },
    {
      keys:['referral','doctor','gp'],
      chip:null,
      a:'You\'re welcome to contact us directly — no referral needed to start. We\'ll let you know if anything else is required for your situation, and we work alongside doctors, schools and employers where helpful.'
    },
    {
      keys:['who','about','nondumiso','bikitsha','practice','since','history'],
      chip:null,
      a:'Bikitsha Occupational Therapy was established by <b>Nondumiso Irene Bikitsha</b>, in private practice since 2015. The practice centres on mental health, work-practice and medico-legal services — holistic, client-centred care from in-utero to old age. More on our <a href="about-us.html">About us</a> page.'
    },
    {
      keys:['contact','email','phone','whatsapp','number','call'],
      chip:null,
      a:'You can reach us on <a href="https://wa.me/27615040294" target="_blank" rel="noopener">WhatsApp: +27 61 504 0294</a>, phone <b>011 568 9227</b>, or email <a href="mailto:admin@bikitshaot.co.za">admin@bikitshaot.co.za</a>.'
    }
  ];

  var fab = document.createElement('button');
  fab.className = 'chat-fab';
  fab.setAttribute('aria-label','Open chat assistant');
  fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.7 1.4 5.1 3.6 6.7-.1 1-.6 2.4-1.5 3.6 1.9-.2 3.6-1 4.7-1.8 1 .3 2.1.4 3.2.4 5.5 0 10-3.9 10-8.9S17.5 3 12 3z"/></svg><span>Chat with us</span>';
  var panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-label','Bikitsha OT assistant');
  panel.innerHTML =
    '<div class="chat-head"><div><b>Bikitsha OT assistant</b><small>Answers from our site · not medical advice</small></div>'+
    '<button class="chat-close" aria-label="Close chat">×</button></div>'+
    '<div class="chat-log"></div>'+
    '<form class="chat-form"><input type="text" placeholder="Type a question…" aria-label="Your question"><button class="chat-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg></button></form>';
  root.appendChild(fab); root.appendChild(panel);

  var log = panel.querySelector('.chat-log');
  var form = panel.querySelector('.chat-form');
  var input = form.querySelector('input');
  var started = false;

  function addMsg(html, who){
    var m = document.createElement('div');
    m.className = 'chat-msg '+who;
    m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function addChips(){
    var holder = document.createElement('div');
    holder.className = 'chat-chips';
    ANSWERS.filter(function(x){return x.chip;}).forEach(function(x){
      var c = document.createElement('button');
      c.className = 'chat-chip'; c.type='button'; c.textContent = x.chip;
      c.addEventListener('click', function(){ ask(x.chip); });
      holder.appendChild(c);
    });
    log.appendChild(holder);
    log.scrollTop = log.scrollHeight;
  }
  function answerFor(q){
    q = q.toLowerCase();
    var best = null, bestScore = 0;
    ANSWERS.forEach(function(x){
      var score = 0;
      x.keys.forEach(function(k){ if(q.indexOf(k)!==-1) score += k.length; });
      if(x.chip && q===x.chip.toLowerCase()) score += 100;
      if(score>bestScore){ bestScore=score; best=x; }
    });
    return best;
  }
  function ask(q){
    addMsg(q.replace(/</g,'&lt;'), 'user');
    var hit = answerFor(q);
    setTimeout(function(){
      if(hit){ addMsg(hit.a, 'bot'); }
      else{
        addMsg('I\'m not sure about that one — but a human is! Send us your question directly on <a href="https://wa.me/27615040294?text='+encodeURIComponent('Hi Bikitsha OT, I have a question: '+q)+'" target="_blank" rel="noopener">WhatsApp</a> or <a href="mailto:admin@bikitshaot.co.za?subject='+encodeURIComponent('Question from your website')+'&body='+encodeURIComponent(q)+'">email</a> and we\'ll get back to you.', 'bot');
      }
    }, 350);
  }
  function openPanel(){
    panel.classList.add('open');
    fab.style.display='none';
    if(!started){
      started = true;
      addMsg('Hi! 👋 I\'m the Bikitsha OT assistant. Ask me about our services, fees, location or booking — or tap a topic below.', 'bot');
      addChips();
    }
    input.focus();
  }
  fab.addEventListener('click', openPanel);
  panel.querySelector('.chat-close').addEventListener('click', function(){
    panel.classList.remove('open');
    fab.style.display='';
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var q = input.value.trim();
    if(!q) return;
    input.value='';
    ask(q);
  });
})();

})();
