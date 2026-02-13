(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function n(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=n(a);fetch(a.href,o)}})();function qe(){const e=localStorage.getItem("zuno_theme")||"system";re(e),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{(localStorage.getItem("zuno_theme")||"system")==="system"&&re("system")})}function re(e){localStorage.setItem("zuno_theme",e);const t=e==="dark"||e==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",t)}function Ke(){return localStorage.getItem("zuno_theme")||"system"}window.applyTheme=re;const Ae=typeof import.meta<"u"&&"https://orpdwhqgcthwjnbirizx.supabase.co"||typeof import.meta<"u"&&!1||"",Je=typeof import.meta<"u"&&"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycGR3aHFnY3Rod2puYmlyaXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjUxMjAsImV4cCI6MjA4NjMwMTEyMH0.4RMhxpB6tTSDEKQfubST_TzPhsvx2Z1HT2juHZDD7qM"||typeof import.meta<"u"&&!1||"",Ze="com.zuno.app",Ve=`${Ze}://callback`;function Y(){return!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())}function Ie(){var n,s,a,o;const e=typeof window<"u"&&((n=window.location)==null?void 0:n.hostname);return(e==="localhost"||e==="127.0.0.1")&&typeof window<"u"&&((s=window.location)!=null&&s.origin)?window.location.origin:e==="localhost"&&!((a=window.location)!=null&&a.port)?"http://10.0.2.2:8000":typeof import.meta<"u"&&"https://zunoapp.onrender.com"||typeof window<"u"&&window.ZUNO_API_BASE||typeof window<"u"&&((o=window.location)==null?void 0:o.origin)||""}function Ye(){return Y()?Ve:window.location.origin+window.location.pathname}function Be(){var s,a,o;if(typeof window>"u"||!((s=window.Capacitor)!=null&&s.getPlatform)||window.Capacitor.getPlatform()!=="ios")return;const e=localStorage.getItem("zuno_token");if(!e)return;const t=Ie(),n=(o=(a=window.Capacitor)==null?void 0:a.Plugins)==null?void 0:o.ZunoAuthSync;n!=null&&n.syncToken&&n.syncToken({token:e,apiBase:t}).catch(()=>{})}function b(e){window.location.hash=e}const Qe=new Set(["auth","connect-extension","home","library","content-detail","collection","goals","goal-detail","search","knowledge","profile","admin"]);function Xe(){const t=(window.location.hash||"").replace(/^#/,"").split("/"),n=(t[0]||"").trim().toLowerCase(),s=(t[1]||"").trim()||null;return{page:n&&Qe.has(n)?n:"",id:s}}window.navigate=b;const et="modulepreload",tt=function(e){return"/app/"+e},ke={},Q=function(t,n,s){let a=Promise.resolve();if(n&&n.length>0){let r=function(m){return Promise.all(m.map(x=>Promise.resolve(x).then(c=>({status:"fulfilled",value:c}),c=>({status:"rejected",reason:c}))))};document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),u=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));a=r(n.map(m=>{if(m=tt(m),m in ke)return;ke[m]=!0;const x=m.endsWith(".css"),c=x?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${c}`))return;const f=document.createElement("link");if(f.rel=x?"stylesheet":et,x||(f.as="script"),f.crossOrigin="",f.href=m,u&&f.setAttribute("nonce",u),document.head.appendChild(f),x)return new Promise((y,h)=>{f.addEventListener("load",y),f.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${m}`)))})}))}function o(r){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=r,window.dispatchEvent(i),!i.defaultPrevented)throw r}return a.then(r=>{for(const i of r||[])i.status==="rejected"&&o(i.reason);return t().catch(o)})};let R=null;function nt(e){return e.startsWith("/api/")&&!e.startsWith("/api/v1/")?"/api/v1"+e.slice(4):e}async function $e(e,t,n,s){const a=localStorage.getItem("zuno_token"),o={};a&&(o.Authorization=`Bearer ${a}`);const r=nt(t);let u=`${Ie()}${r}`;if(s){const y=new URLSearchParams;Object.entries(s).forEach(([_,g])=>{g!==""&&g!=null&&y.append(_,g)});const h=y.toString();h&&(u+="?"+h)}const m={method:e,headers:o};n&&["POST","PATCH","PUT","DELETE"].includes(e)&&(o["Content-Type"]="application/json",m.body=JSON.stringify(n));const x=await fetch(u,m),c=await x.text();let f;try{f=JSON.parse(c)}catch{f=c}return{ok:x.ok,status:x.status,data:f}}async function d(e,t,n=null,s=null){try{let a=await $e(e,t,n,s);if(a.status===401&&(!!localStorage.getItem("zuno_refresh_token")&&await st()&&(a=await $e(e,t,n,s)),a.status===401)){const i=window.location.hash||"#";if(i!=="#auth"&&i!=="#")try{sessionStorage.setItem("zuno_intended_route",i)}catch{}localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),window.location.hash!=="#auth"&&(window.location.hash="#auth")}return a}catch(a){return{ok:!1,status:0,data:{error:a.message}}}}async function st(){return R||(R=(async()=>{try{const{refreshAccessToken:e}=await Q(async()=>{const{refreshAccessToken:t}=await Promise.resolve().then(()=>gt);return{refreshAccessToken:t}},void 0);return await e()}catch{return!1}finally{R=null}})(),R)}let O=null;function me(e){O=e}async function at(e=!1){if(O&&!e)return O;const t=await d("GET","/api/profile");return t.ok&&(O=t.data),O||{}}let le="saved";function Me(e){le=e}let Z="summary";function je(e){Z=e}let L="active";function ot(e){L=e}let A=!1;function it(e){A=e}let V=!1;function rt(e){V=e}let M="fts";function lt(e){M=e}let D=[];function _e(e){D.push(e)}function ct(){D=[]}const dt=["What topics appear most in my saved content?","Summarize my most recent saves","What are the key takeaways from my articles?","How are my saved items connected?"];let K=null;function ut(e){K=e}function J(e=3){return Array(e).fill(0).map(()=>`
    <div class="bg-surface rounded-2xl p-4 shadow-card">
      <div class="flex gap-3">
        <div class="w-20 h-20 rounded-xl skeleton-line flex-shrink-0"></div>
        <div class="flex-1 space-y-2.5 py-1">
          <div class="h-4 skeleton-line w-3/4"></div>
          <div class="h-3 skeleton-line w-full"></div>
          <div class="h-3 skeleton-line w-1/3"></div>
        </div>
      </div>
    </div>`).join("")}function oe(){return`
    <div class="space-y-4">
      <div class="h-48 rounded-2xl skeleton-line"></div>
      <div class="h-6 skeleton-line w-2/3"></div>
      <div class="h-4 skeleton-line w-full"></div>
      <div class="h-4 skeleton-line w-5/6"></div>
      <div class="flex gap-2"><div class="h-6 w-16 rounded-full skeleton-line"></div><div class="h-6 w-20 rounded-full skeleton-line"></div></div>
    </div>`}function Ce(){return'<div class="flex justify-center py-12"><div class="spinner"></div></div>'}function l(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function fe(e,t=100){return e&&e.length>t?e.slice(0,t)+"...":e||""}function pt(){const e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"}function mt(){return new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}function p(e,t=!1){const n=document.getElementById("toast");n.querySelector(".toast-msg").textContent=e;const s=n.querySelector(".toast-icon");s.textContent=t?"error_outline":"check_circle",s.className=`toast-icon material-icons-round text-lg ${t?"text-danger":"text-success"}`,n.classList.remove("hidden"),clearTimeout(n._t),n._t=setTimeout(()=>n.classList.add("hidden"),3e3)}window.toast=p;function P(e){if(e.ok)return;const t=e.data;let n="Something went wrong";t&&typeof t=="object"?typeof t.error=="string"?n=t.error:t.detail!=null&&(typeof t.detail=="string"?n=t.detail:Array.isArray(t.detail)&&(n=t.detail.map(s=>s.msg||s.message||JSON.stringify(s)).join("; ")||n)):typeof t=="string"&&t&&(n=t),p(n,!0)}function He(e){e.innerHTML=`
    <div class="flex flex-col items-center justify-center min-h-[80vh] fade-in">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/15 mb-5">
            <span class="material-icons-round text-4xl text-accent">auto_awesome</span>
          </div>
          <h1 class="text-2xl font-bold text-heading">Welcome to Zuno</h1>
          <p class="text-muted text-sm mt-2">Your AI-powered content companion</p>
        </div>
        <div class="space-y-4">

          <!-- Google Sign-In Button -->
          <button id="google-btn" onclick="doGoogleLogin()" class="w-full flex items-center justify-center gap-3 bg-white dark:bg-surface border border-border hover:bg-slate-50 dark:hover:bg-surface-hover font-semibold py-3.5 rounded-xl transition-all active:scale-[0.97] text-slate-700 dark:text-slate-200 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 48 48" class="flex-shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div id="auth-error" class="hidden text-danger text-sm text-center bg-danger/10 rounded-xl px-4 py-2.5"></div>

          <p class="text-muted text-xs text-center leading-relaxed mt-4">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>`}async function ft(){const e=Ye(),t=`${Ae}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(e)}`;if(Y())try{const{Browser:n}=await Q(async()=>{const{Browser:s}=await import("./index-DGEPusoi.js");return{Browser:s}},[]);await n.open({url:t,windowName:"_system"})}catch{window.open(t,"_system")}else window.location.href=t}async function xe(e){let t;if(e){const i=e.indexOf("#");t=i>=0?e.substring(i+1):""}else{const i=window.location.hash;t=i?i.substring(1):""}if(!t||!t.includes("access_token="))return!1;const n=new URLSearchParams(t),s=n.get("access_token"),a=n.get("refresh_token");if(!s)return!1;if(localStorage.setItem("zuno_token",s),a&&localStorage.setItem("zuno_refresh_token",a),Y())try{const{Browser:i}=await Q(async()=>{const{Browser:u}=await import("./index-DGEPusoi.js");return{Browser:u}},[]);await i.close()}catch{}let o="#home";try{const i=sessionStorage.getItem("zuno_intended_route");i&&i.startsWith("#")&&(o=i,sessionStorage.removeItem("zuno_intended_route"))}catch{}history.replaceState(null,"",window.location.pathname+o);const r=await d("GET","/api/profile");return r.ok?(me(r.data),Be(),p("Signed in as "+(r.data.display_name||r.data.email||"user")),!0):(localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),history.replaceState(null,"",window.location.pathname+"#auth"),P(r),!1)}async function xt(){const e=localStorage.getItem("zuno_refresh_token");if(!e)return!1;try{const t=await fetch(`${Ae}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{"Content-Type":"application/json",apikey:Je},body:JSON.stringify({refresh_token:e})});if(!t.ok)return!1;const n=await t.json();return n.access_token?(localStorage.setItem("zuno_token",n.access_token),n.refresh_token&&localStorage.setItem("zuno_refresh_token",n.refresh_token),!0):!1}catch{return!1}}function Ge(){localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),me(null),b("#auth"),p("Signed out")}window.doLogout=Ge;window.doGoogleLogin=ft;const gt=Object.freeze(Object.defineProperty({__proto__:null,doLogout:Ge,handleOAuthCallback:xe,refreshAccessToken:xt,renderAuth:He},Symbol.toStringTag,{value:"Module"}));function I(e,t="indigo"){return e?`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-${t}-500/15 text-${t}-600 dark:text-${t}-400">${l(e)}</span>`:""}function ce(e){return{youtube:"play_circle",instagram:"camera_alt",x:"tag",reddit:"forum",tiktok:"music_note",spotify:"headphones",web:"language"}[e]||"link"}function X(e,t={}){const n=e.content_id||e.id,s=e.title||e.url||"Untitled",a=e.description||e.ai_summary||"",o=e.image_url||e.thumbnail_url,r=e.category||e.ai_category,i=e.platform,u=t.showBookmark||!1,m=t.isBookmarked||!1,x=t.showAiStatus||!1,c=e.ai_processed;return`
    <article class="bg-surface rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer active:scale-[0.97] group"
      onclick="if(!event.target.closest('.card-action'))navigate('#content-detail/${n}')">
      <div class="flex gap-3">
        ${o?`<img src="${l(o)}" alt="" class="w-20 h-20 rounded-xl object-cover flex-shrink-0" onerror="this.style.display='none'" loading="lazy"/>`:`<div class="w-20 h-20 rounded-xl bg-surface-hover flex items-center justify-center flex-shrink-0"><span class="material-icons-round text-2xl text-muted">${ce(i)}</span></div>`}
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${l(s)}</h3>
            ${u?`
              <button class="card-action flex-shrink-0 p-1 rounded-lg hover:bg-surface-hover transition-colors" onclick="toggleBookmark('${e.id}', this)" aria-label="${m?"Remove bookmark":"Add bookmark"}">
                <span class="material-icons-round text-lg ${m?"text-accent bookmark-pop":"text-muted"}">${m?"bookmark":"bookmark_border"}</span>
              </button>`:""}
          </div>
          <p class="text-muted text-xs mt-1 line-clamp-2">${l(fe(a,120))}</p>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            ${I(r)}
            ${i?`<span class="text-muted text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">${ce(i)}</span>${l(i)}</span>`:""}
            ${x?c?'<span class="text-success text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">check_circle</span>AI</span>':'<span class="text-muted text-[10px]">Pending</span>':""}
          </div>
        </div>
      </div>
    </article>`}function Re(e,t=48,n=4,s="var(--c-accent)"){const a=(t-n)/2,o=2*Math.PI*a,r=o-o*e/100;return`<svg width="${t}" height="${t}" viewBox="0 0 ${t} ${t}" class="transform -rotate-90">
    <circle cx="${t/2}" cy="${t/2}" r="${a}" fill="none" stroke="var(--c-border)" stroke-width="${n}"/>
    <circle cx="${t/2}" cy="${t/2}" r="${a}" fill="none" stroke="${s}" stroke-width="${n}" stroke-dasharray="${o}" stroke-dashoffset="${r}" stroke-linecap="round" class="progress-ring-circle"/>
  </svg>`}async function bt(e){const t=await at(),n=await d("GET","/api/user-preferences");n.ok||P(n);const s=n.ok?n.data.feed_type:"usersaved",a=s==="suggestedcontent"?"/api/suggested-feed":"/api/feed",[o,r]=await Promise.all([d("GET",a,null,{limit:30}),d("GET","/api/feed/bookmarks")]);o.ok||P(o),r.ok||P(r);const i=o.ok?Array.isArray(o.data)?o.data:o.data.items||[]:[],u=r.ok?Array.isArray(r.data)?r.data:[]:[],m=new Set(u),x=t.display_name||"there";e.innerHTML=`
    <div class="fade-in">
      <!-- Greeting -->
      <section class="mb-6" aria-label="Greeting">
        <h1 class="text-2xl font-bold text-heading">${pt()}, ${l(x)}</h1>
        <p class="text-muted text-sm mt-0.5">${mt()}</p>
      </section>

      <!-- Feed Toggle -->
      <div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Feed type">
        <button onclick="switchFeedType('usersaved')" role="tab" aria-selected="${s==="usersaved"}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${s==="usersaved"?"bg-accent text-white shadow-sm":"text-muted hover:text-heading"}">My Feed</button>
        <button onclick="switchFeedType('suggestedcontent')" role="tab" aria-selected="${s==="suggestedcontent"}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${s==="suggestedcontent"?"bg-accent text-white shadow-sm":"text-muted hover:text-heading"}">Suggested</button>
      </div>

      <!-- Feed Items -->
      ${i.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">dynamic_feed</span>
          </div>
          <p class="text-heading font-semibold mb-1">Your feed is empty</p>
          <p class="text-muted text-sm mb-4">Save some content to start building your feed</p>
          <button onclick="navigate('#library')" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Go to Library</button>
        </div>`:`
        <div class="space-y-3" id="feed-list" role="feed" aria-label="Feed items">
          ${i.map(c=>X(c,{showBookmark:!0,isBookmarked:m.has(c.id)})).join("")}
        </div>`}
    </div>`}async function ht(e){await d("PATCH","/api/user-preferences",{feed_type:e}),await U()}async function vt(e,t){var s;const n=await d("POST",`/api/feed/bookmarks/${e}/toggle`);if(n.ok){const a=t.querySelector("span"),o=((s=n.data)==null?void 0:s.bookmarked)??!a.textContent.includes("border");a.textContent=o?"bookmark":"bookmark_border",a.classList.toggle("text-accent",o),a.classList.toggle("text-muted",!o),o?a.classList.add("bookmark-pop"):a.classList.remove("bookmark-pop")}}window.switchFeedType=ht;window.toggleBookmark=vt;function S(e){document.getElementById("modal-content").innerHTML=e,document.getElementById("modal-overlay").classList.remove("hidden")}function H(){document.getElementById("modal-overlay").classList.add("hidden")}window.openModal=S;window.closeModal=H;async function wt(e,t){(t==="saved"||t==="collections"||t==="bookmarks")&&Me(t),le==="saved"?await yt(e):le==="bookmarks"?await kt(e):await $t(e)}function ge(e){const t=(n,s)=>{const a=e===s;return`<button onclick="switchLibraryTab('${s}')" role="tab" aria-selected="${a}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${a?"bg-accent text-white shadow-sm":"text-muted hover:text-heading"}">${n}</button>`};return`<div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Library view">
    ${t("Saved","saved")}
    ${t("Collections","collections")}
    ${t("Bookmarks","bookmarks")}
  </div>`}async function yt(e){const t=await d("GET","/api/content",null,{limit:50});t.ok||P(t);const n=t.ok?t.data:null,s=Array.isArray(n)?n:(n==null?void 0:n.items)??[];e.innerHTML=`
    <div class="fade-in">
      <h1 class="text-xl font-bold text-heading mb-4">Library</h1>
      ${ge("saved")}

      ${s.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">bookmark_border</span>
          </div>
          <p class="text-heading font-semibold mb-1">No saved content yet</p>
          <p class="text-muted text-sm mb-4">Tap the + button to save your first item</p>
        </div>`:`
        <div class="space-y-3" id="content-list">
          ${s.map(a=>X(a,{showAiStatus:!0})).join("")}
        </div>`}
    </div>`}async function kt(e){const t=await d("GET","/api/feed/bookmarks/items");t.ok||P(t);const n=t.ok?Array.isArray(t.data)?t.data:[]:[];e.innerHTML=`
    <div class="fade-in">
      <h1 class="text-xl font-bold text-heading mb-4">Library</h1>
      ${ge("bookmarks")}

      ${n.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">bookmark</span>
          </div>
          <p class="text-heading font-semibold mb-1">No bookmarks yet</p>
          <p class="text-muted text-sm mb-4">Bookmark items from Home (My Feed or Suggested) to see them here</p>
          <button onclick="navigate('#home')" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Go to Home</button>
        </div>`:`
        <div class="space-y-3" id="bookmarks-list">
          ${n.map(s=>X(s,{showBookmark:!0,isBookmarked:!0})).join("")}
        </div>`}
    </div>`}async function $t(e){const[t,n]=await Promise.all([d("GET","/api/collections"),d("GET","/api/collections/categories")]);t.ok||P(t),n.ok||P(n);const s=t.ok?Array.isArray(t.data)?t.data:[]:[],a=n.ok?Array.isArray(n.data)?n.data:[]:[],o={blue:"from-blue-500/20 to-blue-600/5 border-blue-500/20",green:"from-green-500/20 to-green-600/5 border-green-500/20",purple:"from-purple-500/20 to-purple-600/5 border-purple-500/20",amber:"from-amber-500/20 to-amber-600/5 border-amber-500/20",rose:"from-rose-500/20 to-rose-600/5 border-rose-500/20",indigo:"from-indigo-500/20 to-indigo-600/5 border-indigo-500/20"};e.innerHTML=`
    <div class="fade-in">
      <h1 class="text-xl font-bold text-heading mb-4">Library</h1>
      ${ge("collections")}

      ${a.length>0?`
        <div class="mb-5">
          <h2 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">AI Categories</h2>
          <div class="flex flex-wrap gap-1.5">
            ${a.map(r=>`<span class="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-body">${l(typeof r=="string"?r:r.name||r.category||"")}</span>`).join("")}
          </div>
        </div>`:""}

      ${s.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">folder_open</span>
          </div>
          <p class="text-heading font-semibold mb-1">No collections yet</p>
          <p class="text-muted text-sm mb-4">Create your first collection to organize content</p>
          <button onclick="openCreateCollectionModal()" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Create Collection</button>
        </div>`:`
        <div class="grid grid-cols-2 gap-3">
          ${s.map(r=>{const i=o[r.theme]||o.blue;return`
            <article onclick="navigate('#collection/${r.id}')" class="bg-gradient-to-br ${i} border rounded-2xl p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-36 flex flex-col justify-between">
              <span class="material-icons-round text-2xl text-heading/80">${l(r.icon||"folder")}</span>
              <div>
                <h3 class="text-heading font-semibold text-sm leading-snug line-clamp-1">${l(r.title)}</h3>
                <p class="text-muted text-xs mt-0.5">${r.item_count} item${r.item_count!==1?"s":""}</p>
                ${r.is_shared?'<span class="text-[10px] text-accent font-medium">Shared</span>':""}
              </div>
            </article>`}).join("")}
          <!-- Add Collection Card -->
          <button onclick="openCreateCollectionModal()" class="border-2 border-dashed border-border rounded-2xl h-36 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all duration-200 active:scale-[0.97]" aria-label="Create new collection">
            <span class="material-icons-round text-2xl text-muted">add</span>
            <span class="text-muted text-xs font-medium">New Collection</span>
          </button>
        </div>`}
    </div>`}function _t(e){Me(e),b("#library/"+e)}function Ct(e=""){S(`
    <h2 class="text-lg font-bold text-heading mb-4">Save Content</h2>
    <div class="space-y-4">
      <div>
        <label for="m-url" class="text-xs text-muted font-medium mb-1.5 block">URL</label>
        <input id="m-url" type="url" placeholder="Paste a link..." value="${l(e)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" autofocus />
        <p class="text-[11px] text-muted mt-1.5">Title, description, platform &amp; type are auto-detected</p>
      </div>
      <button onclick="doSaveContent()" id="save-content-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Content</button>
    </div>
  `)}async function St(){var n,s;const e=document.getElementById("m-url").value.trim();if(!e){p("URL is required",!0);return}const t=document.getElementById("save-content-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0,typeof showProgress=="function"&&showProgress();try{const a=await d("POST","/api/content",{url:e});a.ok?(H(),p("Content saved!"),(n=a.data)!=null&&n.id&&await d("POST","/api/ai/process-content",{content_id:a.data.id}),b("#content-detail/"+a.data.id)):(p(((s=a.data)==null?void 0:s.detail)||"Failed to save",!0),t.textContent="Save Content",t.disabled=!1)}catch{p("Failed to save",!0),t.textContent="Save Content",t.disabled=!1}finally{typeof hideProgress=="function"&&hideProgress()}}function Tt(){S(`
    <h2 class="text-lg font-bold text-heading mb-4">New Collection</h2>
    <div class="space-y-4">
      <div>
        <label for="c-title" class="text-xs text-muted font-medium mb-1.5 block">Title *</label>
        <input id="c-title" placeholder="Collection name" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="c-desc" class="text-xs text-muted font-medium mb-1.5 block">Description</label>
        <textarea id="c-desc" rows="2" placeholder="Optional description" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none"></textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="c-icon" class="text-xs text-muted font-medium mb-1.5 block">Icon</label>
          <input id="c-icon" value="folder" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
        </div>
        <div>
          <label for="c-theme" class="text-xs text-muted font-medium mb-1.5 block">Theme</label>
          <select id="c-theme" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent">
            <option value="blue">Blue</option><option value="green">Green</option><option value="purple">Purple</option>
            <option value="amber">Amber</option><option value="rose">Rose</option><option value="indigo">Indigo</option>
          </select>
        </div>
      </div>
      <button onclick="doCreateCollection()" id="create-col-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Create Collection</button>
    </div>
  `)}async function Et(){var a;const e=document.getElementById("c-title").value.trim();if(!e){p("Title is required",!0);return}const t=document.getElementById("create-col-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:e,description:document.getElementById("c-desc").value.trim()||null,icon:document.getElementById("c-icon").value.trim()||"folder",theme:document.getElementById("c-theme").value},s=await d("POST","/api/collections",n);s.ok?(H(),p("Collection created!"),b("#collection/"+s.data.id)):(p(((a=s.data)==null?void 0:a.detail)||"Failed to create",!0),t.textContent="Create Collection",t.disabled=!1)}window.switchLibraryTab=_t;window.openSaveContentModal=Ct;window.doSaveContent=St;window.openCreateCollectionModal=Tt;window.doCreateCollection=Et;function be(e,t,n="Confirm",s=!1){return new Promise(a=>{const o=document.getElementById("confirm-overlay");document.getElementById("confirm-content").innerHTML=`
      <h3 class="text-lg font-bold text-heading mb-2">${e}</h3>
      <p class="text-muted text-sm mb-6">${t}</p>
      <div class="flex gap-3">
        <button id="confirm-cancel" class="flex-1 py-3 rounded-xl text-sm font-semibold bg-surface-hover text-heading hover:bg-border transition-colors active:scale-[0.97]">Cancel</button>
        <button id="confirm-ok" class="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors active:scale-[0.97] ${s?"bg-danger hover:bg-red-600":"bg-accent hover:bg-accent-hover"}">${n}</button>
      </div>`,o.classList.remove("hidden"),document.getElementById("confirm-cancel").onclick=()=>{o.classList.add("hidden"),a(!1)},document.getElementById("confirm-ok").onclick=()=>{o.classList.add("hidden"),a(!0)}})}async function ee(e,t){if(!t){b("#library");return}const[n,s]=await Promise.all([d("GET",`/api/content/${t}`),d("GET",`/api/content/${t}/tags`)]);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted/30 mb-3">error</span><p class="text-muted">Content not found</p></div>';return}const a=n.data,o=s.ok&&s.data.content_tags?s.data.content_tags.map(i=>i.tags||i):[],r=i=>Z===i?"bg-accent text-white shadow-sm":"text-muted hover:text-heading";e.innerHTML=`
    <div class="slide-in-right">
      <!-- Sticky Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('#library')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to library">
          <span class="material-icons-round text-xl text-muted">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${l(a.title||"Untitled")}</h1>
        <button onclick="openContentActions('${a.id}')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="More actions">
          <span class="material-icons-round text-xl text-muted">more_vert</span>
        </button>
      </div>

      <!-- Hero Image -->
      ${a.thumbnail_url?`<img src="${l(a.thumbnail_url)}" alt="" class="w-full h-48 object-cover rounded-2xl mb-4 shadow-card" onerror="this.style.display='none'" />`:""}

      <!-- Title & URL -->
      <div class="mb-4">
        <h2 class="text-xl font-bold text-heading leading-snug">${l(a.title||"Untitled")}</h2>
        <a href="${l(a.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all mt-1 inline-block">${l(fe(a.url,60))}</a>
      </div>

      <!-- Badges -->
      <div class="flex items-center gap-2 flex-wrap mb-5">
        ${I(a.platform,"blue")}
        ${I(a.content_type,"purple")}
        ${I(a.ai_category,"emerald")}
        ${a.ai_processed?'<span class="text-success text-xs flex items-center gap-0.5"><span class="material-icons-round text-sm">check_circle</span>AI Processed</span>':'<span class="text-muted text-xs">Not AI processed</span>'}
      </div>

      <!-- Content Tabs -->
      <div class="flex bg-surface rounded-xl p-1 gap-1 mb-4 shadow-card" role="tablist">
        <button onclick="switchContentTab('summary','${a.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${r("summary")}">Summary</button>
        <button onclick="switchContentTab('tags','${a.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${r("tags")}">Tags</button>
        <button onclick="switchContentTab('info','${a.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${r("info")}">Info</button>
      </div>

      <div id="content-tab-body" class="mb-6">
        ${Pt(a,o)}
      </div>

      <!-- Primary Action -->
      ${a.ai_processed?"":`
        <button onclick="processWithAI('${a.id}')" id="ai-btn" class="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97] mb-3 shadow-card">
          <span class="material-icons-round text-lg">auto_awesome</span> Process with AI
        </button>`}

      <button onclick="openAddToCollectionModal('${a.id}')" class="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover border border-border text-heading font-semibold py-3 rounded-xl transition-colors active:scale-[0.97] shadow-card">
        <span class="material-icons-round text-lg">folder</span> Add to Collection
      </button>
    </div>`}function Pt(e,t){return Z==="summary"?e.ai_summary?`<div class="bg-surface rounded-2xl p-5 shadow-card border border-border">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Summary</h3>
          </div>
          <p class="text-body text-sm leading-relaxed">${l(e.ai_summary)}</p>
        </div>`:`<div class="text-center py-8"><p class="text-muted text-sm">No AI summary available yet</p>${e.ai_processed?"":'<p class="text-muted text-xs mt-1">Process with AI to generate a summary</p>'}</div>`:Z==="tags"?t.length>0?`<div class="flex flex-wrap gap-2">${t.map(n=>`<button onclick="navigate('#search');setTimeout(()=>{document.getElementById('search-input').value='${l(n.name||n.slug||"")}';setSearchType('tag');doSearch()},100)" class="px-3 py-1.5 rounded-xl bg-surface border border-border text-sm text-body hover:border-accent hover:text-accent transition-colors">${l(n.name||n.slug||"")}</button>`).join("")}</div>`:'<div class="text-center py-8"><p class="text-muted text-sm">No tags yet</p></div>':`
    <div class="bg-surface rounded-2xl p-5 shadow-card border border-border space-y-3">
      ${e.description?`<div><label class="text-xs text-muted font-medium block mb-1">Description</label><p class="text-body text-sm">${l(e.description)}</p></div>`:""}
      <div><label class="text-xs text-muted font-medium block mb-1">URL</label><a href="${l(e.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all">${l(e.url)}</a></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-muted font-medium block mb-1">Platform</label><p class="text-body text-sm flex items-center gap-1"><span class="material-icons-round text-base">${ce(e.platform)}</span>${l(e.platform||"Unknown")}</p></div>
        <div><label class="text-xs text-muted font-medium block mb-1">Type</label><p class="text-body text-sm">${l(e.content_type||"Unknown")}</p></div>
      </div>
      <div><label class="text-xs text-muted font-medium block mb-1">Status</label><p class="text-sm ${e.ai_processed?"text-success":"text-muted"}">${e.ai_processed?"AI Processed":"Not processed"}</p></div>
    </div>`}function Lt(e,t){je(e),ee(document.getElementById("page"),t)}function At(e){S(`
    <h2 class="text-lg font-bold text-heading mb-4">Actions</h2>
    <div class="space-y-2">
      <button onclick="closeModal();openEditContentModal('${e}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted">edit</span>
        <span class="text-heading text-sm font-medium">Edit Content</span>
      </button>
      <button onclick="closeModal();openAddToCollectionModal('${e}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted">folder</span>
        <span class="text-heading text-sm font-medium">Add to Collection</span>
      </button>
      <button onclick="closeModal();deleteContent('${e}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-danger/10 transition-colors text-left">
        <span class="material-icons-round text-xl text-danger">delete</span>
        <span class="text-danger text-sm font-medium">Delete</span>
      </button>
    </div>
  `)}async function It(e){var n;const t=document.getElementById("ai-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div> Processing...',t.disabled=!0,typeof showProgress=="function"&&showProgress();try{const s=await d("POST","/api/ai/process-content",{content_id:e});s.ok?(p("AI processing complete!"),je("summary"),await ee(document.getElementById("page"),e)):(p(((n=s.data)==null?void 0:n.detail)||"AI processing failed",!0),t.innerHTML='<span class="material-icons-round text-lg">auto_awesome</span> Process with AI',t.disabled=!1)}catch{p("AI processing failed",!0),t.innerHTML='<span class="material-icons-round text-lg">auto_awesome</span> Process with AI',t.disabled=!1}finally{typeof hideProgress=="function"&&hideProgress()}}async function Bt(e){const t=await d("GET","/api/collections"),n=t.ok?Array.isArray(t.data)?t.data:[]:[];S(`
    <h2 class="text-lg font-bold text-heading mb-4">Add to Collection</h2>
    ${n.length===0?'<p class="text-muted text-sm">No collections yet. Create one first.</p>':`
      <div class="space-y-2">
        ${n.map(s=>`
          <button onclick="addToCollection('${s.id}','${e}')" class="w-full text-left bg-bg hover:bg-surface-hover border border-border rounded-xl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <span class="material-icons-round text-xl text-accent">${l(s.icon||"folder")}</span>
              <div><p class="text-heading text-sm font-medium">${l(s.title)}</p><p class="text-muted text-xs">${s.item_count} items</p></div>
            </div>
          </button>`).join("")}
      </div>`}
  `)}async function Mt(e,t){var s;const n=await d("POST",`/api/collections/${e}/items`,{content_id:t});n.ok?(H(),p("Added to collection!")):p(((s=n.data)==null?void 0:s.detail)||"Failed to add",!0)}async function jt(e){const t=await d("GET",`/api/content/${e}`);if(!t.ok)return;const n=t.data;S(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Content</h2>
    <div class="space-y-4">
      <div>
        <label for="e-title" class="text-xs text-muted font-medium mb-1.5 block">Title</label>
        <input id="e-title" value="${l(n.title||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="e-desc" class="text-xs text-muted font-medium mb-1.5 block">Description</label>
        <textarea id="e-desc" rows="3" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${l(n.description||"")}</textarea>
      </div>
      <div>
        <label for="e-url" class="text-xs text-muted font-medium mb-1.5 block">URL</label>
        <input id="e-url" value="${l(n.url||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <button onclick="doEditContent('${e}')" id="edit-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `)}async function Ht(e){var a;const t=document.getElementById("edit-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:document.getElementById("e-title").value.trim()||null,description:document.getElementById("e-desc").value.trim()||null,url:document.getElementById("e-url").value.trim()||null},s=await d("PATCH",`/api/content/${e}`,n);s.ok?(H(),p("Content updated!"),await ee(document.getElementById("page"),e)):(p(((a=s.data)==null?void 0:a.detail)||"Failed to update",!0),t.textContent="Save Changes",t.disabled=!1)}async function Gt(e){var s;if(!await be("Delete Content","This action cannot be undone. Are you sure?","Delete",!0))return;const n=await d("DELETE",`/api/content/${e}`);n.ok?(p("Deleted!"),b("#library")):p(((s=n.data)==null?void 0:s.detail)||"Failed to delete",!0)}window.switchContentTab=Lt;window.openContentActions=At;window.processWithAI=It;window.openAddToCollectionModal=Bt;window.addToCollection=Mt;window.openEditContentModal=jt;window.doEditContent=Ht;window.deleteContent=Gt;async function he(e,t){if(!t){b("#library/collections");return}const[n,s]=await Promise.all([d("GET",`/api/collections/${t}`),d("GET",`/api/collections/${t}/items`)]);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted/30 mb-3">error</span><p class="text-muted">Collection not found</p></div>';return}const a=n.data,o=s.ok?Array.isArray(s.data)?s.data:[]:[];e.innerHTML=`
    <div class="slide-in-right">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-5">
        <button onclick="navigate('#library/collections')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to collections">
          <span class="material-icons-round text-xl text-muted">arrow_back</span>
        </button>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons-round text-2xl text-accent">${l(a.icon||"folder")}</span>
            <h1 class="text-lg font-bold text-heading truncate">${l(a.title)}</h1>
          </div>
          <p class="text-muted text-xs mt-0.5">${a.item_count} items ${a.is_shared?"&middot; Shared":""}</p>
        </div>
        <div class="flex gap-1">
          <button onclick="openEditCollectionModal('${a.id}')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Edit collection">
            <span class="material-icons-round text-lg text-muted">edit</span>
          </button>
          <button onclick="deleteCollection('${a.id}')" class="p-2 rounded-xl hover:bg-danger/10 transition-colors" aria-label="Delete collection">
            <span class="material-icons-round text-lg text-danger">delete</span>
          </button>
        </div>
      </div>

      ${a.description?`<p class="text-muted text-sm mb-4">${l(a.description)}</p>`:""}

      <button onclick="openAddContentToCollectionModal('${a.id}')" class="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover border border-border text-heading text-sm font-medium py-3 rounded-xl transition-colors mb-4 shadow-card active:scale-[0.97]">
        <span class="material-icons-round text-base">add</span> Add Content
      </button>

      ${o.length===0?'<div class="text-center py-12"><p class="text-muted text-sm">No items in this collection</p></div>':`
        <div class="space-y-2">
          ${o.map(r=>{const i=r.content||r;return`
            <div class="bg-surface rounded-xl p-3.5 flex items-center gap-3 hover:bg-surface-hover transition-colors shadow-card">
              <div class="flex-1 min-w-0 cursor-pointer" onclick="navigate('#content-detail/${i.id||r.content_id}')">
                <p class="text-heading text-sm font-medium truncate">${l(i.title||i.url||"Untitled")}</p>
                <p class="text-muted text-xs truncate">${l(i.url||"")}</p>
              </div>
              <button onclick="removeFromCollection('${a.id}','${i.id||r.content_id}')" class="p-1.5 rounded-lg hover:bg-danger/10 transition-colors" aria-label="Remove from collection">
                <span class="material-icons-round text-base text-danger">close</span>
              </button>
            </div>`}).join("")}
        </div>`}
    </div>`}async function Rt(e){const t=await d("GET","/api/content",null,{limit:50}),n=t.ok?Array.isArray(t.data)?t.data:[]:[];S(`
    <h2 class="text-lg font-bold text-heading mb-4">Add Content</h2>
    ${n.length===0?'<p class="text-muted text-sm">No content to add. Save some content first.</p>':`
      <div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
        ${n.map(s=>`
          <button onclick="addToCollection('${e}','${s.id}')" class="w-full text-left bg-bg hover:bg-surface-hover border border-border rounded-xl px-4 py-3 transition-colors">
            <p class="text-heading text-sm font-medium truncate">${l(s.title||s.url)}</p>
            <p class="text-muted text-xs truncate">${l(s.url)}</p>
          </button>`).join("")}
      </div>`}
  `)}async function Ot(e,t){var s;const n=await d("DELETE",`/api/collections/${e}/items/${t}`);n.ok?(p("Removed from collection"),await he(document.getElementById("page"),e)):p(((s=n.data)==null?void 0:s.detail)||"Failed to remove",!0)}async function Dt(e){const t=await d("GET",`/api/collections/${e}`);if(!t.ok)return;const n=t.data;S(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Collection</h2>
    <div class="space-y-4">
      <div>
        <label for="ec-title" class="text-xs text-muted font-medium mb-1.5 block">Title</label>
        <input id="ec-title" value="${l(n.title)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="ec-desc" class="text-xs text-muted font-medium mb-1.5 block">Description</label>
        <textarea id="ec-desc" rows="2" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${l(n.description||"")}</textarea>
      </div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input id="ec-shared" type="checkbox" ${n.is_shared?"checked":""} class="w-5 h-5 rounded-lg border-border text-accent focus:ring-accent" />
        <span class="text-sm text-heading font-medium">Share collection</span>
      </label>
      <button onclick="doEditCollection('${e}')" id="edit-col-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `)}async function Ft(e){var a;const t=document.getElementById("edit-col-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:document.getElementById("ec-title").value.trim()||null,description:document.getElementById("ec-desc").value.trim()||null,is_shared:document.getElementById("ec-shared").checked},s=await d("PATCH",`/api/collections/${e}`,n);s.ok?(H(),p("Collection updated!"),await he(document.getElementById("page"),e)):(p(((a=s.data)==null?void 0:a.detail)||"Failed to update",!0),t.textContent="Save Changes",t.disabled=!1)}async function Ut(e){var s;if(!await be("Delete Collection","This will remove the collection but not its content. Continue?","Delete",!0))return;const n=await d("DELETE",`/api/collections/${e}`);n.ok?(p("Deleted!"),b("#library/collections")):p(((s=n.data)==null?void 0:s.detail)||"Failed to delete",!0)}window.openAddContentToCollectionModal=Rt;window.removeFromCollection=Ot;window.openEditCollectionModal=Dt;window.doEditCollection=Ft;window.deleteCollection=Ut;async function F(e){const[t,n]=await Promise.all([d("GET","/api/goals",null,{status:L}),L==="active"?d("GET","/api/goals/suggestions",null,{status:"pending"}):Promise.resolve({ok:!0,data:[]})]),s=t.ok?Array.isArray(t.data)?t.data:[]:[],a=n.ok?Array.isArray(n.data)?n.data:[]:[],o=s.filter(c=>!c.parent_goal_id),r={};s.filter(c=>c.parent_goal_id).forEach(c=>{r[c.parent_goal_id]||(r[c.parent_goal_id]=[]),r[c.parent_goal_id].push(c)});const i=s.flatMap(c=>c.steps||[]),u=i.length,m=i.filter(c=>c.is_completed).length,x=u>0?Math.round(m/u*100):0;e.innerHTML=`
    <div class="fade-in">
      <!-- Header with Progress Ring -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-4">
          <div class="relative">
            ${Re(x,52,4)}
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-heading">${x}%</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">Goals</h1>
            <p class="text-muted text-xs">${s.length} goal${s.length!==1?"s":""} &middot; ${m}/${u} steps</p>
          </div>
        </div>
        <button onclick="openGoalsMenu()" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Goal actions">
          <span class="material-icons-round text-xl text-muted">more_vert</span>
        </button>
      </div>

      <!-- Filter Pills -->
      <div class="flex gap-2 mb-5" role="tablist" aria-label="Goal status filter">
        ${["active","completed","dismissed"].map(c=>`
          <button onclick="setGoalsFilterAndRender('${c}')" role="tab" aria-selected="${L===c}" class="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${L===c?"bg-accent text-white shadow-sm":"bg-surface text-muted hover:text-heading shadow-card"}">${c.charAt(0).toUpperCase()+c.slice(1)}</button>
        `).join("")}
      </div>

      <!-- Merge Suggestions Banner -->
      ${a.length>0?`
        <button onclick="toggleSuggestions()" class="w-full bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-4 flex items-center gap-3 transition-all active:scale-[0.98]" aria-expanded="${A}">
          <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span class="material-icons-round text-xl text-purple-400">merge_type</span>
          </div>
          <div class="flex-1 text-left">
            <p class="text-heading text-sm font-semibold">You have ${a.length} merge suggestion${a.length!==1?"s":""}</p>
            <p class="text-muted text-xs">Tap to ${A?"hide":"review"}</p>
          </div>
          <span class="material-icons-round text-muted transition-transform ${A?"rotate-180":""}">${A?"expand_less":"expand_more"}</span>
        </button>
        ${A?`<div class="space-y-3 mb-4">${a.map(Nt).join("")}</div>`:""}
      `:""}

      <!-- Goals List -->
      ${o.length===0&&a.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">flag</span>
          </div>
          <p class="text-heading font-semibold mb-1">${L==="active"?"No active goals yet":"No "+L+" goals"}</p>
          <p class="text-muted text-sm">Save more content and Zuno will detect your goals automatically</p>
        </div>`:`
        <div class="space-y-3">
          ${o.map(c=>zt(c,r[c.id]||[])).join("")}
        </div>`}
    </div>`}function zt(e,t=[]){const n=Math.round((e.confidence||0)*100),s=(e.evidence_content_ids||[]).length,a=t.length>0,o=e.steps||[],r=o.filter(c=>c.is_completed).length,i=o.length,u=i>0?Math.round(r/i*100):0,x={active:"border-l-accent",completed:"border-l-success",dismissed:"border-l-muted"}[e.status]||"border-l-accent";return`
    <article onclick="navigate('#goal-detail/${e.id}')" class="bg-surface rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all duration-200 cursor-pointer active:scale-[0.97] border-l-4 ${x}">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl ${a?"bg-purple-500/15":"bg-accent/15"} flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl ${a?"text-purple-500":"text-accent"}">${a?"account_tree":"flag"}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${l(e.title)}</h3>
          <p class="text-muted text-xs mt-1 line-clamp-2">${l(e.description||"")}</p>

          <!-- Mini Progress Bar -->
          ${i>0?`
          <div class="mt-2.5 flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div class="h-full ${a?"bg-purple-500":"bg-accent"} rounded-full transition-all duration-300" style="width:${u}%"></div>
            </div>
            <span class="text-muted text-[10px] flex-shrink-0">${r}/${i}</span>
          </div>`:""}

          <div class="flex items-center gap-3 mt-2">
            ${I(e.category,"emerald")}
            <span class="text-muted text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">trending_up</span>${n}%</span>
            <span class="text-muted text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">link</span>${s}</span>
            ${a?`<span class="text-purple-400 text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">account_tree</span>${t.length}</span>`:""}
          </div>
        </div>
      </div>
    </article>`}function Nt(e){const t=(e.child_goal_ids||[]).length;return`
    <div class="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl text-purple-400">merge_type</span>
        </div>
        <div class="flex-1 min-w-0">
          <span class="inline-block text-[10px] font-semibold uppercase tracking-wide text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full mb-1.5">Merge Suggestion</span>
          <h3 class="font-semibold text-heading text-sm leading-snug">${l(e.suggested_parent_title)}</h3>
          <p class="text-muted text-xs mt-1 line-clamp-3">${l(e.ai_reasoning||e.suggested_parent_description)}</p>
          <p class="text-purple-400/70 text-[10px] mt-1.5"><span class="material-icons-round text-xs align-middle">account_tree</span> Merges ${t} goal${t!==1?"s":""}</p>
          <div class="flex items-center gap-2 mt-3">
            <button onclick="event.stopPropagation();acceptSuggestion('${e.id}')" id="accept-${e.id}" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1">
              <span class="material-icons-round text-sm">check</span> Accept
            </button>
            <button onclick="event.stopPropagation();dismissSuggestion('${e.id}')" id="dismiss-${e.id}" class="flex-1 bg-surface hover:bg-surface-hover text-muted text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors active:scale-[0.97] border border-border flex items-center justify-center gap-1">
              <span class="material-icons-round text-sm">close</span> Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>`}function Wt(){it(!A),F(document.getElementById("page"))}function qt(){S(`
    <h2 class="text-lg font-bold text-heading mb-4">Goal Actions</h2>
    <div class="space-y-2">
      <button onclick="closeModal();reanalyzeGoals()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-accent">refresh</span>
        <div><p class="text-heading text-sm font-medium">Reanalyze Goals</p><p class="text-muted text-xs">Re-scan content for new goals</p></div>
      </button>
      <button onclick="closeModal();triggerConsolidate()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-purple-400">merge_type</span>
        <div><p class="text-heading text-sm font-medium">Consolidate Goals</p><p class="text-muted text-xs">Find goals to merge together</p></div>
      </button>
    </div>
  `)}async function Kt(e){var s,a;const t=document.getElementById("accept-"+e);t&&(t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0);const n=await d("POST",`/api/goals/suggestions/${e}/accept`);n.ok?(p(((s=n.data)==null?void 0:s.message)||"Goals merged!"),F(document.getElementById("page"))):(p(((a=n.data)==null?void 0:a.detail)||"Failed to merge",!0),t&&(t.textContent="Accept",t.disabled=!1))}async function Jt(e){var s;const t=document.getElementById("dismiss-"+e);t&&(t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0);const n=await d("POST",`/api/goals/suggestions/${e}/dismiss`);n.ok?(p("Suggestion dismissed"),F(document.getElementById("page"))):(p(((s=n.data)==null?void 0:s.detail)||"Failed to dismiss",!0),t&&(t.textContent="Dismiss",t.disabled=!1))}async function Zt(){var t,n;p("Starting consolidation...");const e=await d("POST","/api/goals/consolidate");e.ok?p(((t=e.data)==null?void 0:t.message)||"Consolidation started!"):p(((n=e.data)==null?void 0:n.detail)||"Consolidation failed",!0)}async function Vt(){var t,n;p("Reanalyzing goals...");const e=await d("POST","/api/goals/reanalyze");e.ok?p(((t=e.data)==null?void 0:t.message)||"Reanalysis started!"):p(((n=e.data)==null?void 0:n.detail)||"Reanalysis failed",!0)}function Yt(e){ot(e),F(document.getElementById("page"))}window.setGoalsFilterAndRender=Yt;window.toggleSuggestions=Wt;window.openGoalsMenu=qt;window.acceptSuggestion=Kt;window.dismissSuggestion=Jt;window.triggerConsolidate=Zt;window.reanalyzeGoals=Vt;async function te(e,t){if(!t){b("#goals");return}const n=await d("GET",`/api/goals/${t}`);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted/30 mb-3">error</span><p class="text-muted">Goal not found</p></div>';return}const s=n.data,a=s.steps||[],o=a.filter(g=>g.is_completed),r=a.filter(g=>!g.is_completed),i=o.length,u=a.length,m=u>0?Math.round(i/u*100):0,x=Math.round((s.confidence||0)*100),c=(s.evidence_content_ids||[]).length,f=s.children||[],y=f.length>0,h=!!s.parent_goal_id,_=y?"#a855f7":"#6366f1";e.innerHTML=`
    <div class="slide-in-right">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('${h?"#goal-detail/"+s.parent_goal_id:"#goals"}')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="${h?"Back to parent goal":"Back to goals"}">
          <span class="material-icons-round text-xl text-muted">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${h?"Sub-goal":"Goal"}</h1>
      </div>

      <!-- Progress Card -->
      <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border">
        <div class="flex items-center gap-4 mb-4">
          <div class="relative flex-shrink-0">
            ${Re(m,64,5,_)}
            <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-heading">${m}%</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-bold text-heading leading-snug">${l(s.title)}</h2>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              ${I(s.category,"emerald")}
              ${I(s.status,s.status==="active"?"indigo":s.status==="completed"?"green":"gray")}
              ${y?'<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Parent</span>':""}
              ${h?'<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Sub-goal</span>':""}
            </div>
          </div>
        </div>
        <p class="text-body text-sm leading-relaxed">${l(s.description)}</p>
        <div class="flex items-center gap-4 mt-4 text-xs text-muted">
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">trending_up</span>${x}% confidence</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">link</span>${c} sources</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">checklist</span>${i}/${u} steps</span>
        </div>
      </section>

      <!-- Sub-goals (horizontal scroll) -->
      ${y?`
      <section class="mb-4" aria-label="Sub-goals">
        <h3 class="text-sm font-semibold text-heading mb-3 flex items-center gap-1.5">
          <span class="material-icons-round text-base text-purple-400">account_tree</span> Sub-goals
        </h3>
        <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          ${f.map(g=>{const se=Math.round((g.confidence||0)*100),B=g.status||"active",G=B==="completed"?"check_circle":B==="dismissed"?"do_not_disturb_on":"flag",z=B==="completed"?"text-success":B==="dismissed"?"text-muted":"text-accent";return`
            <article onclick="navigate('#goal-detail/${g.id}')" class="flex-shrink-0 w-44 bg-surface rounded-xl p-3.5 shadow-card border border-border hover:shadow-elevated transition-all cursor-pointer active:scale-[0.97]">
              <div class="flex items-center gap-2 mb-2">
                <span class="material-icons-round text-lg ${z}">${G}</span>
                <span class="text-[10px] text-muted">${se}%</span>
              </div>
              <h4 class="font-semibold text-heading text-xs leading-snug line-clamp-2">${l(g.title)}</h4>
            </article>`}).join("")}
        </div>
      </section>`:""}

      <!-- Steps -->
      <section class="mb-4" aria-label="Goal steps">
        <h3 class="text-sm font-semibold text-heading mb-3">Steps</h3>
        ${u===0?'<p class="text-muted text-sm text-center py-4">No steps yet</p>':`
          <div class="space-y-2" id="goal-steps-list">
            ${r.map(g=>Se(g,t)).join("")}
            ${i>0?`
              <button onclick="toggleCompletedSteps('${t}')" class="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted font-medium hover:text-heading transition-colors">
                <span class="material-icons-round text-sm">${V?"expand_less":"expand_more"}</span>
                ${i} completed step${i!==1?"s":""}
              </button>
              ${V?o.map(g=>Se(g,t)).join(""):""}
            `:""}
          </div>`}
      </section>

      ${s.ai_reasoning?`
        <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Reasoning</h3>
          </div>
          <p class="text-muted text-sm leading-relaxed">${l(s.ai_reasoning)}</p>
        </section>`:""}

      <!-- Actions -->
      <div class="space-y-2">
        ${s.status==="active"?`
          <button onclick="updateGoalStatus('${s.id}','completed')" class="w-full flex items-center justify-center gap-2 bg-success/10 hover:bg-success/20 text-success font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">check_circle</span> Mark Complete
          </button>
          <button onclick="updateGoalStatus('${s.id}','dismissed')" class="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover border border-border text-muted font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">do_not_disturb_on</span> Dismiss Goal
          </button>`:`
          <button onclick="updateGoalStatus('${s.id}','active')" class="w-full flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">flag</span> Reactivate
          </button>`}
        <button onclick="deleteGoal('${s.id}')" class="w-full flex items-center justify-center gap-2 bg-surface hover:bg-danger/10 border border-border text-danger font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
          <span class="material-icons-round text-lg">delete</span> Delete Goal
        </button>
      </div>
    </div>`}function Se(e,t){const n=(e.source_content_ids||[]).length;return`
    <div class="bg-surface rounded-xl p-3.5 flex items-start gap-3 transition-all duration-200 shadow-card ${e.is_completed?"opacity-60":""}">
      <button onclick="event.stopPropagation();toggleGoalStep('${t}','${e.id}',${!e.is_completed})" class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 ${e.is_completed?"bg-accent border-accent check-bounce":"border-border hover:border-accent"} flex items-center justify-center transition-all" aria-label="${e.is_completed?"Mark incomplete":"Mark complete"}">
        ${e.is_completed?'<span class="material-icons-round text-sm text-white">check</span>':""}
      </button>
      <div class="flex-1 min-w-0">
        <p class="text-heading text-sm font-medium leading-snug ${e.is_completed?"line-through":""}">${l(e.title)}</p>
        ${e.description?`<p class="text-muted text-xs mt-1 leading-relaxed">${l(e.description)}</p>`:""}
        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-muted text-[10px]">Step ${e.step_index+1}</span>
          ${n>0?`<span class="text-muted text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-[10px]">link</span>${n}</span>`:""}
          ${e.is_completed&&e.completed_at?'<span class="text-success text-[10px]">Done</span>':""}
        </div>
      </div>
    </div>`}function Qt(e){rt(!V),te(document.getElementById("page"),e)}async function Xt(e,t,n){var a;const s=await d("PATCH",`/api/goals/${e}/steps/${t}`,{is_completed:n});s.ok?await te(document.getElementById("page"),e):p(((a=s.data)==null?void 0:a.detail)||"Failed to update step",!0)}async function en(e,t){var s;const n=await d("PATCH",`/api/goals/${e}`,{status:t});n.ok?(p(`Goal ${t==="completed"?"completed":t==="dismissed"?"dismissed":"reactivated"}!`),await te(document.getElementById("page"),e)):p(((s=n.data)==null?void 0:s.detail)||"Failed to update goal",!0)}async function tn(e){var s;if(!await be("Delete Goal","This will delete the goal and all its steps. Continue?","Delete",!0))return;const n=await d("DELETE",`/api/goals/${e}`);n.ok?(p("Goal deleted"),b("#goals")):p(((s=n.data)==null?void 0:s.detail)||"Failed to delete",!0)}window.toggleCompletedSteps=Qt;window.toggleGoalStep=Xt;window.updateGoalStatus=en;window.deleteGoal=tn;function Oe(){try{return JSON.parse(localStorage.getItem("zuno_searches")||"[]")}catch{return[]}}function nn(e){const t=Oe().filter(n=>n!==e);t.unshift(e),localStorage.setItem("zuno_searches",JSON.stringify(t.slice(0,5)))}async function sn(e){const t=await d("GET","/api/tags/popular"),n=t.ok?Array.isArray(t.data)?t.data:[]:[],s=Oe();e.innerHTML=`
    <div class="fade-in">
      <!-- Search Input -->
      <div class="flex gap-2 mb-3">
        <div class="flex-1 relative">
          <input id="search-input" type="text" placeholder="Search your content..." class="w-full bg-surface border border-border rounded-xl pl-11 pr-10 py-3.5 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 shadow-card" onkeydown="if(event.key==='Enter')doSearch()" autofocus aria-label="Search input" />
          <span class="material-icons-round text-xl text-muted absolute left-3.5 top-1/2 -translate-y-1/2">search</span>
          <button onclick="document.getElementById('search-input').value='';document.getElementById('search-results').innerHTML=''" class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-surface-hover transition-colors" aria-label="Clear search">
            <span class="material-icons-round text-lg text-muted">close</span>
          </button>
        </div>
      </div>

      <!-- Search Type Tabs -->
      <div class="flex gap-2 mb-5" role="tablist" aria-label="Search type">
        <button onclick="setSearchType('fts')" id="st-fts" role="tab" class="search-type px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${M==="fts"?"bg-accent text-white shadow-sm":"bg-surface text-muted shadow-card hover:text-heading"}">Full-text</button>
        <button onclick="setSearchType('hybrid')" id="st-hybrid" role="tab" class="search-type px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${M==="hybrid"?"bg-accent text-white shadow-sm":"bg-surface text-muted shadow-card hover:text-heading"}">Hybrid</button>
        <button onclick="setSearchType('tag')" id="st-tag" role="tab" class="search-type px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${M==="tag"?"bg-accent text-white shadow-sm":"bg-surface text-muted shadow-card hover:text-heading"}">By Tag</button>
      </div>

      ${s.length>0?`
        <section class="mb-5" aria-label="Recent searches">
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Recent</h3>
          <div class="flex flex-wrap gap-1.5">
            ${s.map(a=>`<button onclick="document.getElementById('search-input').value='${l(a)}';doSearch()" class="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-body hover:border-accent transition-colors flex items-center gap-1"><span class="material-icons-round text-xs text-muted">history</span>${l(a)}</button>`).join("")}
          </div>
        </section>`:""}

      ${n.length>0?`
        <section class="mb-5" aria-label="Popular tags">
          <h3 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Popular Tags</h3>
          <div class="flex flex-wrap gap-1.5">
            ${n.map(a=>`<button onclick="searchByTag('${l(a.slug)}')" class="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-body hover:border-accent transition-colors">${l(a.name)} <span class="text-muted">${a.count||a.usage_count||""}</span></button>`).join("")}
          </div>
        </section>`:""}

      <div id="search-results" aria-live="polite"></div>
    </div>`}function De(e){lt(e),document.querySelectorAll(".search-type").forEach(t=>{const n=t.id==="st-"+e;t.className=`search-type px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${n?"bg-accent text-white shadow-sm":"bg-surface text-muted shadow-card hover:text-heading"}`})}async function Fe(){var a;const e=document.getElementById("search-input").value.trim();if(!e)return;nn(e);const t=document.getElementById("search-results");t.innerHTML=J(2);let n;M==="hybrid"?n=await d("GET","/api/search/hybrid",null,{q:e,limit:20}):M==="tag"?n=await d("GET",`/api/search/tag/${encodeURIComponent(e)}`,null,{limit:20}):n=await d("GET","/api/search",null,{q:e,limit:20});const s=n.ok?Array.isArray(n.data)?n.data:[]:[];if(!n.ok){t.innerHTML=`<div class="bg-danger/10 rounded-xl p-4 text-center"><p class="text-danger text-sm">${l(((a=n.data)==null?void 0:a.detail)||"Search failed")}</p></div>`;return}t.innerHTML=s.length===0?'<div class="text-center py-12"><span class="material-icons-round text-4xl text-muted/30 mb-2">search_off</span><p class="text-muted text-sm">No results found</p></div>':`<p class="text-muted text-xs mb-3">${s.length} result${s.length!==1?"s":""}</p>
       <div class="space-y-3">${s.map(o=>X(o)).join("")}</div>`}function an(e){De("tag"),document.getElementById("search-input").value=e,Fe()}window.setSearchType=De;window.doSearch=Fe;window.searchByTag=an;async function Ue(e){const t=await d("GET","/api/knowledge/stats"),n=t.ok?t.data:null;e.innerHTML=`
    <div class="fade-in flex flex-col" style="height: calc(100dvh - 160px);">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-bold text-heading">Knowledge Q&A</h1>
          ${n?`<p class="text-muted text-xs mt-0.5">${n.total_chunks||n.chunks||0} chunks indexed</p>`:""}
        </div>
        <button onclick="openKnowledgeSettings()" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Knowledge settings">
          <span class="material-icons-round text-xl text-muted">settings</span>
        </button>
      </div>

      <!-- Chat Area -->
      <div id="knowledge-chat" class="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4" role="log" aria-label="Chat messages">
        ${D.length===0?`
          <div class="flex flex-col items-center justify-center h-full text-center px-4">
            <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
              <span class="material-icons-round text-4xl text-accent/60">psychology</span>
            </div>
            <p class="text-heading font-semibold mb-1">Ask anything about your content</p>
            <p class="text-muted text-sm mb-5">Powered by RAG over your knowledge base</p>
            <div class="flex flex-wrap gap-2 justify-center">
              ${dt.map(a=>`
                <button onclick="askSuggested(this.textContent)" class="px-3 py-2 rounded-xl bg-surface border border-border text-xs text-body hover:border-accent hover:text-accent transition-colors shadow-card">${a}</button>
              `).join("")}
            </div>
          </div>`:D.map(de).join("")}
      </div>

      <!-- Input -->
      <div class="flex gap-2">
        <input id="knowledge-input" type="text" placeholder="Ask a question..." class="flex-1 bg-surface border border-border rounded-xl px-4 py-3.5 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 shadow-card" onkeydown="if(event.key==='Enter')doAsk()" aria-label="Question input" />
        <button onclick="doAsk()" class="bg-accent hover:bg-accent-hover text-white px-4 rounded-xl transition-colors active:scale-95 shadow-card" aria-label="Send question">
          <span class="material-icons-round text-lg">send</span>
        </button>
      </div>
    </div>`;const s=document.getElementById("knowledge-chat");s.scrollTop=s.scrollHeight}function de(e){return e.role==="user"?`<div class="flex justify-end"><div class="bg-accent/20 text-heading rounded-2xl rounded-br-md px-4 py-3 max-w-[80%] text-sm">${l(e.text)}</div></div>`:`
    <div class="flex justify-start">
      <div class="bg-surface border border-border rounded-2xl rounded-bl-md px-4 py-3.5 max-w-[90%] shadow-card">
        <p class="text-body text-sm leading-relaxed whitespace-pre-wrap">${l(e.text)}</p>
        ${e.sources&&e.sources.length>0?`
          <div class="mt-3 pt-3 border-t border-border">
            <p class="text-muted text-[10px] uppercase tracking-wide font-semibold mb-2">Sources</p>
            <div class="space-y-1.5">
              ${e.sources.map(t=>`
                <div class="bg-bg rounded-xl px-3 py-2.5 cursor-pointer hover:bg-surface-hover transition-colors" onclick="navigate('#content-detail/${t.content_id}')">
                  <p class="text-heading text-xs font-medium line-clamp-1">${l(t.title||t.url||t.content_id)}</p>
                  ${t.chunk_text?`<p class="text-muted text-[11px] line-clamp-2 mt-0.5">${l(fe(t.chunk_text,100))}</p>`:""}
                </div>`).join("")}
            </div>
          </div>`:""}
      </div>
    </div>`}function on(e){document.getElementById("knowledge-input").value=e,ze()}async function ze(){var o,r;const e=document.getElementById("knowledge-input"),t=e.value.trim();if(!t)return;e.value="",_e({role:"user",text:t});const n=document.getElementById("knowledge-chat");D.length===1&&(n.innerHTML=""),n.innerHTML+=de({role:"user",text:t}),n.innerHTML+='<div id="typing" class="flex justify-start"><div class="bg-surface border border-border rounded-2xl rounded-bl-md px-5 py-4 shadow-card"><div class="flex gap-1.5"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div></div>',n.scrollTop=n.scrollHeight;const s=await d("POST","/api/knowledge/ask",{query:t,include_sources:!0});(o=document.getElementById("typing"))==null||o.remove();const a=s.ok?{role:"assistant",text:s.data.answer,sources:s.data.sources||[]}:{role:"assistant",text:`Error: ${((r=s.data)==null?void 0:r.detail)||"Failed to get answer"}`,sources:[]};_e(a),n.innerHTML+=de(a),n.scrollTop=n.scrollHeight}function rn(){S(`
    <h2 class="text-lg font-bold text-heading mb-4">Knowledge Settings</h2>
    <div class="space-y-2">
      <button onclick="closeModal();doReindex()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-accent">refresh</span>
        <div><p class="text-heading text-sm font-medium">Reindex Content</p><p class="text-muted text-xs">Rebuild the knowledge base index</p></div>
      </button>
      <button onclick="closeModal();clearKnowledgeAndRender()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted">delete_sweep</span>
        <div><p class="text-heading text-sm font-medium">Clear Chat</p><p class="text-muted text-xs">Remove conversation history</p></div>
      </button>
    </div>
  `)}async function ln(){var t;p("Reindexing...");const e=await d("POST","/api/knowledge/reindex",{});e.ok?p(`Reindexed: ${e.data.content_processed} items, ${e.data.chunks_created} chunks`):p(((t=e.data)==null?void 0:t.detail)||"Reindex failed",!0)}function cn(){ct(),Ue(document.getElementById("page"))}window.askSuggested=on;window.doAsk=ze;window.openKnowledgeSettings=rn;window.doReindex=ln;window.clearKnowledgeAndRender=cn;async function ve(e){var u;const[t,n,s]=await Promise.all([d("GET","/api/profile"),d("GET","/api/user-preferences"),d("GET","/api/admin/me")]),a=t.ok?t.data:{},o=n.ok?n.data:{},r=Ke(),i=s.ok&&((u=s.data)==null?void 0:u.admin)===!0;e.innerHTML=`
    <div class="fade-in">
      <!-- Avatar Hero -->
      <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border" aria-label="Account info">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center overflow-hidden flex-shrink-0">
            ${a.avatar_url?`<img src="${l(a.avatar_url)}" alt="Avatar" class="w-full h-full object-cover" onerror="this.style.display='none'"/>`:'<span class="material-icons-round text-3xl text-accent">person</span>'}
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">${l(a.display_name||"No name")}</h1>
            <p class="text-muted text-sm">${l(a.email||a.phone||"")}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label for="p-name" class="text-xs text-muted font-medium mb-1.5 block">Display Name</label>
            <input id="p-name" value="${l(a.display_name||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <div>
            <label for="p-avatar" class="text-xs text-muted font-medium mb-1.5 block">Avatar URL</label>
            <input id="p-avatar" value="${l(a.avatar_url||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <button onclick="doUpdateProfile()" id="profile-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-xl transition-colors active:scale-[0.97]">Update Profile</button>
        </div>
      </section>

      <!-- Preferences -->
      <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border" aria-label="Preferences">
        <h3 class="text-sm font-semibold text-heading mb-4">Preferences</h3>

        <div class="mb-4">
          <label class="text-xs text-muted font-medium mb-2 block">Default Feed</label>
          <div class="flex gap-2">
            <button onclick="updateFeedPref('usersaved')" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${o.feed_type==="usersaved"?"bg-accent text-white shadow-sm":"bg-bg border border-border text-muted hover:text-heading"} active:scale-[0.97]">My Saved</button>
            <button onclick="updateFeedPref('suggestedcontent')" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${o.feed_type==="suggestedcontent"?"bg-accent text-white shadow-sm":"bg-bg border border-border text-muted hover:text-heading"} active:scale-[0.97]">Suggested</button>
          </div>
        </div>

        <div>
          <label class="text-xs text-muted font-medium mb-2 block">Theme</label>
          <div class="flex gap-2">
            ${["light","dark","system"].map(m=>`
              <button onclick="applyTheme('${m}');renderProfile(document.getElementById('page'))" class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${r===m?"bg-accent text-white shadow-sm":"bg-bg border border-border text-muted hover:text-heading"} active:scale-[0.97]">
                <span class="material-icons-round text-base">${m==="light"?"light_mode":m==="dark"?"dark_mode":"brightness_auto"}</span>
                ${m.charAt(0).toUpperCase()+m.slice(1)}
              </button>`).join("")}
          </div>
        </div>
      </section>

      <!-- Chrome Extension -->
      <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border" aria-label="Chrome Extension">
        <h3 class="text-sm font-semibold text-heading mb-2">Chrome Extension</h3>
        <p class="text-xs text-muted mb-3">Connect the Share to Zuno extension to save links without opening the app.</p>
        <a href="#connect-extension" target="_blank" rel="noopener" class="block w-full text-center py-2.5 rounded-xl text-sm font-medium bg-bg hover:bg-surface-hover border border-border text-heading transition-colors">
          <span class="material-icons-round text-base align-middle mr-1">extension</span> Connect Extension
        </a>
      </section>

      ${i?`
      <!-- Admin (only for allowlisted users) -->
      <section class="bg-surface rounded-2xl p-5 mb-4 shadow-card border border-border" aria-label="Admin">
        <button onclick="navigate('#admin')" class="w-full flex items-center justify-center gap-2 bg-bg hover:bg-surface-hover border border-border text-heading font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
          <span class="material-icons-round text-xl text-muted">admin_panel_settings</span>
          Open Admin
        </button>
      </section>
      `:""}

      <!-- Sign Out -->
      <button onclick="doLogout()" class="w-full flex items-center justify-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
        <span class="material-icons-round text-lg">logout</span> Sign Out
      </button>
    </div>`}async function dn(){var s;const e=document.getElementById("profile-btn");e.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',e.disabled=!0;const t={display_name:document.getElementById("p-name").value.trim()||null,avatar_url:document.getElementById("p-avatar").value.trim()||null},n=await d("PATCH","/api/profile",t);n.ok?(me(null),p("Profile updated!")):p(((s=n.data)==null?void 0:s.detail)||"Failed to update",!0),e.textContent="Update Profile",e.disabled=!1}async function un(e){await d("PATCH","/api/user-preferences",{feed_type:e}),p("Feed preference updated!"),await ve(document.getElementById("page"))}window.renderProfile=ve;window.doUpdateProfile=dn;window.updateFeedPref=un;async function Ne(e){var n;const t=await d("GET","/api/admin/me");if(!t.ok||!((n=t.data)!=null&&n.admin)){b("#profile");return}e.innerHTML=`
    <div class="fade-in">
      <div class="flex items-center gap-3 mb-5">
        <button onclick="navigate('#profile')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to profile">
          <span class="material-icons-round text-heading">arrow_back</span>
        </button>
        <h1 class="text-xl font-bold text-heading">Admin</h1>
      </div>

      <section class="bg-surface rounded-2xl shadow-card border border-border mb-4 overflow-hidden" aria-label="Developer tools">
        <div class="p-5 space-y-4">
          <!-- Cache -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Cache</h4>
            <div class="flex gap-2">
              <input id="admin-cache-pattern" placeholder="Pattern (optional)" class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoBustCache()" id="admin-bust-btn" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Bust</button>
            </div>
            <button onclick="adminLoadCacheStats()" class="text-xs text-accent hover:text-accent-hover mt-2 font-medium">View Stats</button>
            <div id="admin-cache-stats-result" class="mt-2"></div>
          </div>

          <!-- Prompts -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Prompts</h4>
            <button onclick="adminDoReloadPrompts()" id="admin-prompts-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">refresh</span> Reload Prompts
            </button>
          </div>

          <!-- Embedding Test -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Generate Embedding</h4>
            <div class="flex gap-2">
              <input id="admin-embed-text" placeholder="Text to embed..." class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoGenerateEmbedding()" id="admin-embed-btn" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Go</button>
            </div>
            <div id="admin-embed-result" class="mt-2"></div>
          </div>

          <!-- Generate Feed -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">AI Feed</h4>
            <button onclick="adminDoGenerateFeed()" id="admin-gen-feed-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">auto_awesome</span> Generate Feed
            </button>
            <div id="admin-gen-feed-result" class="mt-2"></div>
          </div>

          <!-- Health Check -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Health</h4>
            <button onclick="adminDoHealthCheck()" id="admin-health-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">monitor_heart</span> Check Health
            </button>
            <div id="admin-health-result" class="mt-2"></div>
          </div>

          <!-- Pro waitlist -->
          <div>
            <h4 class="text-xs text-muted font-semibold uppercase tracking-wide mb-2">Pro waitlist</h4>
            <button onclick="adminLoadWaitlist()" id="admin-waitlist-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">list</span> Load waitlist
            </button>
            <div id="admin-waitlist-result" class="mt-2"></div>
          </div>
        </div>
      </section>
    </div>`}async function pn(){var n;const e=await d("GET","/api/admin/cache/stats"),t=document.getElementById("admin-cache-stats-result");e.ok?t.innerHTML=`<pre class="text-xs text-muted bg-bg rounded-xl p-3 overflow-x-auto max-h-32">${l(JSON.stringify(e.data,null,2))}</pre>`:t.innerHTML=`<p class="text-danger text-xs">${l(((n=e.data)==null?void 0:n.detail)||"Failed to load stats")}</p>`}async function mn(){var s;const e=document.getElementById("admin-bust-btn");e.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',e.disabled=!0;const t=document.getElementById("admin-cache-pattern").value.trim(),n=await d("POST","/api/admin/cache/bust",null,t?{pattern:t}:null);n.ok?p("Cache busted!"):p(((s=n.data)==null?void 0:s.detail)||"Failed",!0),e.textContent="Bust",e.disabled=!1}async function fn(){var n;const e=document.getElementById("admin-prompts-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>',e.disabled=!0;const t=await d("POST","/api/admin/prompts/reload");t.ok?p("Prompts reloaded!"):p(((n=t.data)==null?void 0:n.detail)||"Failed",!0),e.innerHTML='<span class="material-icons-round text-base">refresh</span> Reload Prompts',e.disabled=!1}async function xn(){var a,o,r;const e=document.getElementById("admin-embed-text").value.trim();if(!e){p("Enter text",!0);return}const t=document.getElementById("admin-embed-btn");t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0;const n=await d("POST","/api/ai/generate-embedding",{text:e}),s=document.getElementById("admin-embed-result");if(n.ok){const i=((a=n.data.embedding)==null?void 0:a.length)||0;s.innerHTML=`<p class="text-success text-xs">Embedding generated (${i} dimensions)</p><pre class="text-xs text-muted bg-bg rounded-lg p-2 mt-1 max-h-24 overflow-y-auto">[${(o=n.data.embedding)==null?void 0:o.slice(0,5).map(u=>u.toFixed(6)).join(", ")}... ]</pre>`}else s.innerHTML=`<p class="text-danger text-xs">${l(((r=n.data)==null?void 0:r.detail)||"Failed")}</p>`;t.textContent="Go",t.disabled=!1}async function gn(){var s,a;const e=document.getElementById("admin-gen-feed-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Generating...',e.disabled=!0;const t=await d("POST","/api/ai/generate-feed"),n=document.getElementById("admin-gen-feed-result");if(t.ok){const o=((s=t.data.items)==null?void 0:s.length)||0;n.innerHTML=`<p class="text-success text-xs">${o} feed items generated</p>`,t.data.message&&(n.innerHTML+=`<p class="text-muted text-xs mt-1">${l(t.data.message)}</p>`)}else n.innerHTML=`<p class="text-danger text-xs">${l(((a=t.data)==null?void 0:a.detail)||"Failed")}</p>`;e.innerHTML='<span class="material-icons-round text-base">auto_awesome</span> Generate Feed',e.disabled=!1}async function bn(){const e=document.getElementById("admin-health-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>',e.disabled=!0;const t=await d("GET","/health");document.getElementById("admin-health-result").innerHTML=`<pre class="text-xs ${t.ok?"text-success":"text-danger"} bg-bg rounded-lg p-2 mt-1">${l(JSON.stringify(t.data,null,2))}</pre>`,e.innerHTML='<span class="material-icons-round text-base">monitor_heart</span> Check Health',e.disabled=!1}let ue=[];async function hn(){var r,i,u;const e=document.getElementById("admin-waitlist-btn"),t=document.getElementById("admin-waitlist-result");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Loading...',e.disabled=!0;const n=await d("GET","/api/admin/waitlist");if(!n.ok){t.innerHTML=`<p class="text-danger text-xs">${l(((r=n.data)==null?void 0:r.detail)||"Failed to load waitlist")}</p>`,e.innerHTML='<span class="material-icons-round text-base">list</span> Load waitlist',e.disabled=!1;return}const s=((i=n.data)==null?void 0:i.items)||[];ue=s;const a=((u=n.data)==null?void 0:u.total)??s.length,o=s.map(m=>`<tr class="border-b border-border"><td class="py-2 pr-3 text-sm text-heading">${l(m.email)}</td><td class="py-2 pr-3 text-xs text-muted">${l(m.tier)}</td><td class="py-2 pr-3 text-xs text-muted">${l(m.discount_code||"—")}</td><td class="py-2 text-xs text-muted">${m.created_at?new Date(m.created_at).toLocaleDateString():"—"}</td></tr>`).join("");t.innerHTML=`
    <p class="text-success text-xs mb-2">${a} signup(s)</p>
    <div class="overflow-x-auto max-h-48 overflow-y-auto rounded-xl border border-border">
      <table class="w-full text-left text-sm">
        <thead><tr class="bg-surface border-b border-border"><th class="py-2 pr-3 font-semibold text-heading">Email</th><th class="py-2 pr-3 font-semibold text-heading">Tier</th><th class="py-2 pr-3 font-semibold text-heading">Code</th><th class="py-2 font-semibold text-heading">Date</th></tr></thead>
        <tbody>${o||'<tr><td colspan="4" class="py-4 text-center text-muted text-xs">No entries</td></tr>'}</tbody>
      </table>
    </div>
    ${s.length>0?'<button type="button" onclick="adminExportWaitlistCsv()" class="mt-2 text-xs text-accent hover:text-accent-hover font-medium">Export CSV</button>':""}
  `,e.innerHTML='<span class="material-icons-round text-base">list</span> Load waitlist',e.disabled=!1}function vn(){if(ue.length===0)return;const e=["email","tier","discount_code","created_at"],t=[e.join(",")].concat(ue.map(a=>e.map(o=>`"${String(a[o]||"").replace(/"/g,'""')}"`).join(","))).join(`
`),n=new Blob([t],{type:"text/csv;charset=utf-8"}),s=document.createElement("a");s.href=URL.createObjectURL(n),s.download=`zuno-waitlist-${new Date().toISOString().slice(0,10)}.csv`,s.click(),URL.revokeObjectURL(s.href)}window.renderAdmin=Ne;window.adminLoadCacheStats=pn;window.adminDoBustCache=mn;window.adminDoReloadPrompts=fn;window.adminDoGenerateEmbedding=xn;window.adminDoGenerateFeed=gn;window.adminDoHealthCheck=bn;window.adminLoadWaitlist=hn;window.adminExportWaitlistCsv=vn;const q=["content-detail","collection","goal-detail"];function wn(e){return K?q.includes(e)&&!q.includes(K)?"slide-in-right":q.includes(K)&&!q.includes(e)?"slide-in-left":"fade-in":"fade-in"}async function U(){const e=localStorage.getItem("zuno_token");let{page:t,id:n}=Xe();if(!t){b(e?"#home":"#auth");return}if(t==="collection"&&!n){b("#library/collections");return}if(!e&&t!=="auth"&&t!=="connect-extension"){b("#auth");return}if(e&&t==="auth"){b("#home");return}if(t==="connect-extension"){o.innerHTML=`<div class="flex flex-col items-center justify-center py-16 text-center fade-in">
      <p class="text-heading font-semibold mb-2">Connecting extension…</p>
      <p class="text-muted text-sm">Make sure you're logged in. If nothing happens, ensure the Share to Zuno extension is installed.</p>
    </div>`,document.getElementById("topnav").classList.add("hidden"),document.getElementById("bottomnav").classList.add("hidden");return}if(t==="feed"){b("#home");return}if(t==="content"){b("#library");return}if(t==="collections"){b("#library");return}const s=t==="auth";document.getElementById("topnav").classList.toggle("hidden",s),document.getElementById("topnav").classList.toggle("flex",!s),document.getElementById("bottomnav").classList.toggle("hidden",s),document.getElementById("fab-btn").classList.toggle("hidden",t!=="library");const a={home:"home",library:"library","content-detail":"library",collection:"library",goals:"goals","goal-detail":"goals",knowledge:"knowledge",profile:"profile",admin:"profile"};document.querySelectorAll(".nav-btn").forEach(u=>{const m=u.dataset.tab===a[t];u.classList.toggle("text-accent",m),u.classList.toggle("text-muted",!m)});const o=document.getElementById("page"),r=wn(t);ut(t);const i={home:J(3),library:J(3),goals:J(3),"content-detail":oe(),"goal-detail":oe(),collection:oe(),admin:Ce()};o.innerHTML=`<div class="${r}">${i[t]||Ce()}</div>`;try{switch(t){case"auth":He(o);break;case"home":await bt(o);break;case"library":await wt(o,n);try{const u=sessionStorage.getItem("zuno_pending_share");u&&(sessionStorage.removeItem("zuno_pending_share"),typeof openSaveContentModal=="function"&&openSaveContentModal(u))}catch{}break;case"content-detail":await ee(o,n);break;case"collection":await he(o,n);break;case"goals":await F(o);break;case"goal-detail":await te(o,n);break;case"search":await sn(o);break;case"knowledge":await Ue(o);break;case"profile":await ve(o);break;case"admin":await Ne(o);break;default:b("#home")}}catch(u){const m=typeof(u==null?void 0:u.message)=="string"?u.message:"Something went wrong";o.innerHTML=`<div class="flex flex-col items-center justify-center py-16 text-center fade-in" role="alert" aria-live="assertive">
      <span class="material-icons-round text-5xl text-danger/40 mb-3">error_outline</span>
      <p class="text-heading font-semibold mb-1">Something went wrong</p>
      <p class="text-muted text-sm mb-4">${l(m)}</p>
      <button type="button" onclick="router()" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Try again</button>
    </div>`}}window.router=U;/*! Capacitor: https://capacitorjs.com/ - MIT License */var j;(function(e){e.Unimplemented="UNIMPLEMENTED",e.Unavailable="UNAVAILABLE"})(j||(j={}));class ie extends Error{constructor(t,n,s){super(t),this.message=t,this.code=n,this.data=s}}const yn=e=>{var t,n;return e!=null&&e.androidBridge?"android":!((n=(t=e==null?void 0:e.webkit)===null||t===void 0?void 0:t.messageHandlers)===null||n===void 0)&&n.bridge?"ios":"web"},kn=e=>{const t=e.CapacitorCustomPlatform||null,n=e.Capacitor||{},s=n.Plugins=n.Plugins||{},a=()=>t!==null?t.name:yn(e),o=()=>a()!=="web",r=c=>{const f=m.get(c);return!!(f!=null&&f.platforms.has(a())||i(c))},i=c=>{var f;return(f=n.PluginHeaders)===null||f===void 0?void 0:f.find(y=>y.name===c)},u=c=>e.console.error(c),m=new Map,x=(c,f={})=>{const y=m.get(c);if(y)return console.warn(`Capacitor plugin "${c}" already registered. Cannot register plugins twice.`),y.proxy;const h=a(),_=i(c);let g;const se=async()=>(!g&&h in f?g=typeof f[h]=="function"?g=await f[h]():g=f[h]:t!==null&&!g&&"web"in f&&(g=typeof f.web=="function"?g=await f.web():g=f.web),g),B=(v,w)=>{var C,T;if(_){const E=_==null?void 0:_.methods.find(k=>w===k.name);if(E)return E.rtype==="promise"?k=>n.nativePromise(c,w.toString(),k):(k,N)=>n.nativeCallback(c,w.toString(),k,N);if(v)return(C=v[w])===null||C===void 0?void 0:C.bind(v)}else{if(v)return(T=v[w])===null||T===void 0?void 0:T.bind(v);throw new ie(`"${c}" plugin is not implemented on ${h}`,j.Unimplemented)}},G=v=>{let w;const C=(...T)=>{const E=se().then(k=>{const N=B(k,v);if(N){const W=N(...T);return w=W==null?void 0:W.remove,W}else throw new ie(`"${c}.${v}()" is not implemented on ${h}`,j.Unimplemented)});return v==="addListener"&&(E.remove=async()=>w()),E};return C.toString=()=>`${v.toString()}() { [capacitor code] }`,Object.defineProperty(C,"name",{value:v,writable:!1,configurable:!1}),C},z=G("addListener"),ye=G("removeListener"),We=(v,w)=>{const C=z({eventName:v},w),T=async()=>{const k=await C;ye({eventName:v,callbackId:k},w)},E=new Promise(k=>C.then(()=>k({remove:T})));return E.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await T()},E},ae=new Proxy({},{get(v,w){switch(w){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return _?We:z;case"removeListener":return ye;default:return G(w)}}});return s[c]=ae,m.set(c,{name:c,proxy:ae,platforms:new Set([...Object.keys(f),..._?[h]:[]])}),ae};return n.convertFileSrc||(n.convertFileSrc=c=>c),n.getPlatform=a,n.handleError=u,n.isNativePlatform=o,n.isPluginAvailable=r,n.registerPlugin=x,n.Exception=ie,n.DEBUG=!!n.DEBUG,n.isLoggingEnabled=!!n.isLoggingEnabled,n},$n=e=>e.Capacitor=kn(e),pe=$n(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),ne=pe.registerPlugin;class we{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(t,n){let s=!1;this.listeners[t]||(this.listeners[t]=[],s=!0),this.listeners[t].push(n);const o=this.windowListeners[t];o&&!o.registered&&this.addWindowListener(o),s&&this.sendRetainedArgumentsForEvent(t);const r=async()=>this.removeListener(t,n);return Promise.resolve({remove:r})}async removeAllListeners(){this.listeners={};for(const t in this.windowListeners)this.removeWindowListener(this.windowListeners[t]);this.windowListeners={}}notifyListeners(t,n,s){const a=this.listeners[t];if(!a){if(s){let o=this.retainedEventArguments[t];o||(o=[]),o.push(n),this.retainedEventArguments[t]=o}return}a.forEach(o=>o(n))}hasListeners(t){var n;return!!(!((n=this.listeners[t])===null||n===void 0)&&n.length)}registerWindowListener(t,n){this.windowListeners[n]={registered:!1,windowEventName:t,pluginEventName:n,handler:s=>{this.notifyListeners(n,s)}}}unimplemented(t="not implemented"){return new pe.Exception(t,j.Unimplemented)}unavailable(t="not available"){return new pe.Exception(t,j.Unavailable)}async removeListener(t,n){const s=this.listeners[t];if(!s)return;const a=s.indexOf(n);this.listeners[t].splice(a,1),this.listeners[t].length||this.removeWindowListener(this.windowListeners[t])}addWindowListener(t){window.addEventListener(t.windowEventName,t.handler),t.registered=!0}removeWindowListener(t){t&&(window.removeEventListener(t.windowEventName,t.handler),t.registered=!1)}sendRetainedArgumentsForEvent(t){const n=this.retainedEventArguments[t];n&&(delete this.retainedEventArguments[t],n.forEach(s=>{this.notifyListeners(t,s)}))}}const Te=e=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),Ee=e=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class _n extends we{async getCookies(){const t=document.cookie,n={};return t.split(";").forEach(s=>{if(s.length<=0)return;let[a,o]=s.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");a=Ee(a).trim(),o=Ee(o).trim(),n[a]=o}),n}async setCookie(t){try{const n=Te(t.key),s=Te(t.value),a=`; expires=${(t.expires||"").replace("expires=","")}`,o=(t.path||"/").replace("path=",""),r=t.url!=null&&t.url.length>0?`domain=${t.url}`:"";document.cookie=`${n}=${s||""}${a}; path=${o}; ${r};`}catch(n){return Promise.reject(n)}}async deleteCookie(t){try{document.cookie=`${t.key}=; Max-Age=0`}catch(n){return Promise.reject(n)}}async clearCookies(){try{const t=document.cookie.split(";")||[];for(const n of t)document.cookie=n.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(t){return Promise.reject(t)}}async clearAllCookies(){try{await this.clearCookies()}catch(t){return Promise.reject(t)}}}ne("CapacitorCookies",{web:()=>new _n});const Cn=async e=>new Promise((t,n)=>{const s=new FileReader;s.onload=()=>{const a=s.result;t(a.indexOf(",")>=0?a.split(",")[1]:a)},s.onerror=a=>n(a),s.readAsDataURL(e)}),Sn=(e={})=>{const t=Object.keys(e);return Object.keys(e).map(a=>a.toLocaleLowerCase()).reduce((a,o,r)=>(a[o]=e[t[r]],a),{})},Tn=(e,t=!0)=>e?Object.entries(e).reduce((s,a)=>{const[o,r]=a;let i,u;return Array.isArray(r)?(u="",r.forEach(m=>{i=t?encodeURIComponent(m):m,u+=`${o}=${i}&`}),u.slice(0,-1)):(i=t?encodeURIComponent(r):r,u=`${o}=${i}`),`${s}&${u}`},"").substr(1):null,En=(e,t={})=>{const n=Object.assign({method:e.method||"GET",headers:e.headers},t),a=Sn(e.headers)["content-type"]||"";if(typeof e.data=="string")n.body=e.data;else if(a.includes("application/x-www-form-urlencoded")){const o=new URLSearchParams;for(const[r,i]of Object.entries(e.data||{}))o.set(r,i);n.body=o.toString()}else if(a.includes("multipart/form-data")||e.data instanceof FormData){const o=new FormData;if(e.data instanceof FormData)e.data.forEach((i,u)=>{o.append(u,i)});else for(const i of Object.keys(e.data))o.append(i,e.data[i]);n.body=o;const r=new Headers(n.headers);r.delete("content-type"),n.headers=r}else(a.includes("application/json")||typeof e.data=="object")&&(n.body=JSON.stringify(e.data));return n};class Pn extends we{async request(t){const n=En(t,t.webFetchExtra),s=Tn(t.params,t.shouldEncodeUrlParams),a=s?`${t.url}?${s}`:t.url,o=await fetch(a,n),r=o.headers.get("content-type")||"";let{responseType:i="text"}=o.ok?t:{};r.includes("application/json")&&(i="json");let u,m;switch(i){case"arraybuffer":case"blob":m=await o.blob(),u=await Cn(m);break;case"json":u=await o.json();break;case"document":case"text":default:u=await o.text()}const x={};return o.headers.forEach((c,f)=>{x[f]=c}),{data:u,headers:x,status:o.status,url:o.url}}async get(t){return this.request(Object.assign(Object.assign({},t),{method:"GET"}))}async post(t){return this.request(Object.assign(Object.assign({},t),{method:"POST"}))}async put(t){return this.request(Object.assign(Object.assign({},t),{method:"PUT"}))}async patch(t){return this.request(Object.assign(Object.assign({},t),{method:"PATCH"}))}async delete(t){return this.request(Object.assign(Object.assign({},t),{method:"DELETE"}))}}ne("CapacitorHttp",{web:()=>new Pn});var Pe;(function(e){e.Dark="DARK",e.Light="LIGHT",e.Default="DEFAULT"})(Pe||(Pe={}));var Le;(function(e){e.StatusBar="StatusBar",e.NavigationBar="NavigationBar"})(Le||(Le={}));class Ln extends we{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}ne("SystemBars",{web:()=>new Ln});const An=ne("App",{web:()=>Q(()=>import("./web-Cllh5WUZ.js"),[]).then(e=>new e.AppWeb)});let $=null;function In(){return $||($=document.createElement("div"),$.id="global-loading-bar",$.setAttribute("aria-hidden","true"),$.className="global-loading-bar hidden",$.innerHTML='<div class="global-loading-bar-inner"></div>',document.body.appendChild($),$)}function Bn(){In().classList.remove("hidden")}function Mn(){$&&$.classList.add("hidden")}window.showProgress=Bn;window.hideProgress=Mn;const jn=/https?:\/\/[^\s)<>]+/i;async function Hn(e){if(!e||!e.content)return;if(!localStorage.getItem("zuno_token")){p("Please log in to save shared content",!0);return}try{typeof showProgress=="function"&&showProgress();try{e.type==="text"?await Gn(e.content):e.type==="image"&&await Rn(e.content,e.mimeType||"image/jpeg")}finally{typeof hideProgress=="function"&&hideProgress()}}catch(n){console.error("[ShareHandler]",n),p("Failed to save shared content",!0),typeof hideProgress=="function"&&hideProgress()}}async function Gn(e){var n,s;const t=e.match(jn);if(t){const a=t[0],o=await d("POST","/api/content",{url:a});o.ok?(p("Saved to Zuno!"),d("POST","/api/ai/process-content",{content_id:o.data.id})):p(((n=o.data)==null?void 0:n.detail)||"Failed to save link",!0)}else{const a=e.length>80?e.slice(0,77)+"...":e,o=await d("POST","/api/content/text",{title:a,source_text:e});o.ok?p("Note saved to Zuno!"):p(((s=o.data)==null?void 0:s.detail)||"Failed to save note",!0)}}async function Rn(e,t){const n=atob(e),s=new Uint8Array(n.length);for(let f=0;f<n.length;f++)s[f]=n.charCodeAt(f);const a=new Blob([s],{type:t}),o=t.split("/")[1]||"jpg",r=`shared_${Date.now()}.${o}`,i=new FormData;i.append("file",a,r);const u=window.ZUNO_API_BASE||(window.location.hostname==="localhost"&&!window.location.port?"http://10.0.2.2:8000":window.location.origin),m=localStorage.getItem("zuno_token"),x=await fetch(`${u}/api/v1/content/upload`,{method:"POST",headers:m?{Authorization:`Bearer ${m}`}:{},body:i}),c=await x.json().catch(()=>({}));x.ok?(p("Image saved to Zuno!"),c.id&&d("POST","/api/ai/process-content",{content_id:c.id})):p((c==null?void 0:c.detail)||"Failed to save image",!0)}window.handleSharedContent=Hn;qe();Y()&&An.addListener("appUrlOpen",async e=>{e.url&&e.url.includes("access_token")&&await xe(e.url)&&U()});function On(e){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}window.addEventListener("hashchange",U);On(async()=>{const t=new URLSearchParams(window.location.search).get("share");if(t){try{sessionStorage.setItem("zuno_pending_share",t)}catch{}const s=new URL(window.location.href);s.searchParams.delete("share"),window.history.replaceState({},"",s.pathname+s.search+(s.hash||""))}await xe(),await U(),Be();const n=2e3;if(typeof hideSplash=="function"){const s=typeof window._splashStart=="number"?Date.now()-window._splashStart:0,a=Math.max(0,n-s);setTimeout(hideSplash,a)}});export{we as W,Q as _,ne as r};
