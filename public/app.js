const app = document.querySelector('#app');
const logo = (large = false) => `<span class="logo${large ? ' large' : ''}"><img src="/assets/logo.png" alt="African Libraries logo"></span>`;
const brand = () => `<a href="#/" class="brand" aria-label="African Libraries home">${logo()}<span>African Libraries</span></a>`;
const header = (home = false) => `<header class="header shell">${brand()}${home ? '<a class="questions-link" href="#questions">A few questions ↗</a>' : ''}</header>`;
const faqs = [
  ['What is African Libraries all about?', 'African Libraries is a platform for authors, the author economy, and digital publishing. African authors and authors worldwide can self-publish, sell eBooks, connect with readers, promote their books, track sales, and receive earnings. Paperback and other formats are planned.'],
  ['Why should I join the waitlist?', 'Join as an author to become one of our founding authors, with book advertising credits, a verified blue tick badge, early book listings, and priority placement on the platform. Readers can join to receive launch updates.'],
  ['Do I need to pay to publish my books?', 'No. You don’t have to pay to get your books listed. African Libraries is a free self-publishing platform—easy to use and easy to read.'],
  ['What should I prepare before the launch?', 'Format your books neatly as EPUB or PDF files and design appealing book covers. Use A5 pages for fixed-layout PDFs; EPUB layouts adapt to the reader’s screen.'],
  ['Will African Libraries accept paperback books?', 'Yes. Paperback support is in progress. We’ll share more details as it becomes available.'],
  ['When is the full launch?', 'We’ll announce the launch date through your registered email. Join the waitlist and keep an eye on your inbox.']
];
const titles = ['When Truth Takes a Backseat — blue cover', 'Gapculogy', 'When Truth Takes a Backseat — white cover', 'The Protection Manual'];
function home() {
  app.innerHTML = `${header(true)}<main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="headline"><h1 id="headline">AFRICAN LIBRARIES</h1><p class="subtitle">African Books Publishing Platform</p><p class="intro">Home for every Author and readers</p><a class="button" href="#/join">Join waitlist</a><p class="support">Join the waitlist. Be here for the first chapter.</p><p class="free">Free to join. Free to list your books.</p></section>
    <section class="carousel" aria-label="Books by our authors"><div class="carousel-angle"><div class="book-track">${Array.from({length:12},(_,i)=>`<div class="book"${i>3?' aria-hidden="true"':''}><img src="/assets/books.png" alt="${i>3?'':titles[i%4]}" draggable="false"></div>`).join('')}</div></div><button class="carousel-toggle" type="button" aria-pressed="false">Pause books</button></section>
    <section class="benefits"><div class="shell"><p class="eyebrow">FOR OUR FOUNDING AUTHORS</p><h2>Your first chapter comes with more.</h2><ul class="benefit-list">${['Book advertising credits','Verified blue tick badge','Early book listings','Priority book placement'].map(x=>`<li><span aria-hidden="true">✓</span>${x}</li>`).join('')}</ul></div></section>
    <section class="faq shell" id="questions" aria-labelledby="faq-title"><div><p class="eyebrow">GOOD TO KNOW</p><h2 id="faq-title">A few questions.<br> Answered.</h2><p class="faq-intro">Everything you need to know<br>before the first chapter.</p></div><div class="faq-list">${faqs.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>
  </main><footer class="footer shell">${logo(true)}<p>Rooted in Africa. Open to the world.</p></footer>`;
  const toggle = app.querySelector('.carousel-toggle');
  toggle.addEventListener('click', () => {
    const paused = app.querySelector('.carousel').classList.toggle('paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play books' : 'Pause books';
  });
}
function chooseRole() {
  app.innerHTML = `<div class="flow">${header()}<div class="shell"><a class="back" href="#/">← Back</a></div><main class="role" id="main" tabindex="-1"><h1>Join as</h1><p class="intro">Choose how you want to use African libraries</p><div class="role-actions"><a class="button" href="#/join/author">Join as author</a><a class="button secondary" href="#/join/reader">Join as reader</a></div><p class="role-note">Free to join. Be here for the first chapter.</p></main></div>`;
}
const drafts = {author: {}, reader: {}};
const fields = [
  {name:'firstName',label:'First name',placeholder:'First name',required:true,autocomplete:'given-name',icon:'person'},
  {name:'lastName',label:'Last name',placeholder:'Last name',autocomplete:'family-name',icon:'person'},
  {name:'phone',label:'Phone Number',placeholder:'Enter phone number',required:true,type:'tel',autocomplete:'tel'},
  {name:'email',label:'Email',placeholder:'Enter email address',required:true,type:'email',autocomplete:'email',icon:'mail'},
  {name:'referral',label:'Referral Code (Optional)',placeholder:'Enter code or referrer’s email',icon:'person'}
];
function join(role) {
  app.innerHTML = `<div class="flow">${header()}<div class="shell"><a class="back" href="#/join">← Back</a></div><main class="join" id="main" tabindex="-1"><h1>Join as ${role==='author'?'an author':'a reader'}</h1><p class="intro">Enter your details to join the waitlist.</p><form novalidate>${fields.map(f=>`<div class="field"><label for="${f.name}">${f.label}${f.required?' <span class="required" aria-hidden="true">*</span>':''}</label><div class="input-wrap${f.icon?' with-icon':''}">${f.icon?`<img src="/assets/${f.icon}.svg" alt="">`:''}<input id="${f.name}" name="${f.name}" type="${f.type||'text'}" placeholder="${f.placeholder}" maxlength="${f.name==='email'?254:150}" ${f.required?'required':''} ${f.autocomplete?`autocomplete="${f.autocomplete}"`:''} aria-describedby="${f.name}-error"></div><p class="field-error" id="${f.name}-error"></p></div>`).join('')}<p class="form-error" role="alert"></p><button class="button" type="submit">Join waitlist</button><p class="consent">By joining, you agree to receive African Libraries launch updates by email.</p></form></main></div>`;
  const form = app.querySelector('form');
  for (const f of fields) {
    form.elements[f.name].value = drafts[role][f.name] || '';
    form.elements[f.name].addEventListener('input', e=>{
      drafts[role][f.name] = e.target.value;
      e.target.removeAttribute('aria-invalid');
      document.getElementById(`${f.name}-error`).textContent='';
    });
  }
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.role = role;
    const errors = {};
    if (!data.firstName.trim()) errors.firstName='Enter your first name.';
    if (!/^\+?[\d\s().-]{7,25}$/.test(data.phone.trim()) || data.phone.replace(/\D/g,'').length < 7) errors.phone='Enter a valid phone number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email='Enter a valid email address.';
    const showErrors = errors => {
      for (const f of fields) {
        document.getElementById(`${f.name}-error`).textContent=errors[f.name]||'';
        form.elements[f.name].setAttribute('aria-invalid', String(Boolean(errors[f.name])));
      }
      const first = fields.find(f=>errors[f.name]);
      if(first) form.elements[first.name].focus();
    };
    showErrors(errors);
    if(Object.keys(errors).length) return;
    const button = form.querySelector('button');
    button.disabled=true;button.textContent='Joining…';
    form.querySelector('.form-error').textContent='';
    try {
      const response = await fetch('/api/waitlist', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok) {
        if(result.errors) showErrors(result.errors);
        throw new Error(result.message || 'We couldn’t save your place. Please try again.');
      }
      drafts[role]={};
      sessionStorage.setItem('waitlist-joined','true');
      location.hash='/success';
    } catch(error) {
      form.querySelector('.form-error').textContent=error instanceof TypeError?'Unable to connect. Check your connection and try again.':error.message;
    } finally {button.disabled=false;button.textContent='Join waitlist';}
  });
}
function success() {
  if(!sessionStorage.getItem('waitlist-joined')) {location.replace('#/join');return;}
  app.innerHTML=`<div class="flow"><a class="success-logo" href="#/" aria-label="African Libraries home">${logo(true)}</a><main id="main" class="success" tabindex="-1"><div class="success-mark" aria-hidden="true">✓</div><h1>You’re on the list.</h1><p>Your place is saved. Keep an eye on your inbox for African Libraries launch updates.</p><a class="button" href="#/">Back to the waitlist ↗</a></main></div>`;
}
let previousRoute;
function render() {
  const route=location.hash.slice(1)||'/';
  if(route==='questions') {
    if(previousRoute!=='/') home();
    previousRoute='/';
    document.querySelector('#questions').scrollIntoView();
    return;
  }
  if(route==='/join') chooseRole();
  else if(route==='/join/author') join('author');
  else if(route==='/join/reader') join('reader');
  else if(route==='/success') success();
  else home();
  document.title = `${route==='/join'?'Choose your role':route==='/join/author'?'Join as an author':route==='/join/reader'?'Join as a reader':route==='/success'?'You’re on the list':'Join the waitlist'} — African Libraries`;
  window.scrollTo(0,0);
  if(previousRoute!==undefined) document.querySelector('#main')?.focus({preventScroll:true});
  previousRoute=route;
}
window.addEventListener('hashchange',render);
render();
