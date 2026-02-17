(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();function vt(){const e=localStorage.getItem("zuno_theme")||"system";ye(e),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{(localStorage.getItem("zuno_theme")||"system")==="system"&&ye("system")})}function ye(e){localStorage.setItem("zuno_theme",e);const t=e==="dark"||e==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",t)}function yt(){return localStorage.getItem("zuno_theme")||"system"}window.applyTheme=ye;const Ce=typeof import.meta<"u"&&"https://orpdwhqgcthwjnbirizx.supabase.co"||typeof import.meta<"u"&&!1||"",Je=typeof import.meta<"u"&&"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycGR3aHFnY3Rod2puYmlyaXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjUxMjAsImV4cCI6MjA4NjMwMTEyMH0.4RMhxpB6tTSDEKQfubST_TzPhsvx2Z1HT2juHZDD7qM"||typeof import.meta<"u"&&!1||"",Ye="com.zuno.app",Qe=`${Ye}://callback`;function K(){return!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())}function X(){var n,a,o;const e=typeof window<"u"&&((n=window.location)==null?void 0:n.hostname),t=e==="localhost"||e==="127.0.0.1";if(K()){const s=typeof import.meta<"u"&&"https://zunoapp.onrender.com";return s||(typeof window<"u"&&window.ZUNO_API_BASE?window.ZUNO_API_BASE:e==="localhost"?"http://10.0.2.2:8000":"")}return t&&typeof window<"u"&&((a=window.location)!=null&&a.origin)?window.location.origin:typeof import.meta<"u"&&"https://zunoapp.onrender.com"||typeof window<"u"&&window.ZUNO_API_BASE||typeof window<"u"&&((o=window.location)==null?void 0:o.origin)||""}function Xe(){return!1}function et(){return K()?Qe:window.location.origin+window.location.pathname}const wt=Object.freeze(Object.defineProperty({__proto__:null,APP_SCHEME:Ye,OAUTH_CALLBACK_URL:Qe,SUPABASE_ANON_KEY:Je,SUPABASE_URL:Ce,getApiBase:X,getOAuthRedirectUrl:et,isCapacitor:K,showFeed:Xe},Symbol.toStringTag,{value:"Module"}));function tt(){var a,o,s;if(typeof window>"u"||!((a=window.Capacitor)!=null&&a.getPlatform)||window.Capacitor.getPlatform()!=="ios")return;const e=localStorage.getItem("zuno_token");if(!e)return;const t=X(),n=(s=(o=window.Capacitor)==null?void 0:o.Plugins)==null?void 0:s.ZunoAuthSync;n!=null&&n.syncToken&&n.syncToken({token:e,apiBase:t}).catch(()=>{})}function E(e){window.location.hash=e}function C(e){const t=e.startsWith("#")?e:"#"+e,n=new URL(window.location.href);n.hash=t,history.replaceState(null,"",n)}const kt=new Set(["auth","connect-extension","home","library","feed","collections","content-detail","collection","goals","goal-detail","search","knowledge","profile","admin"]);function $t(){const t=(window.location.hash||"").replace(/^#/,"").split("/"),n=(t[0]||"").trim().toLowerCase(),a=(t[1]||"").trim()||null;return{page:n&&kt.has(n)?n:"",id:a}}window.navigate=E;const _t="modulepreload",St=function(e){return"/app/"+e},Ge={},ee=function(t,n,a){let o=Promise.resolve();if(n&&n.length>0){let i=function(p){return Promise.all(p.map(g=>Promise.resolve(g).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),c=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));o=i(n.map(p=>{if(p=St(p),p in Ge)return;Ge[p]=!0;const g=p.endsWith(".css"),l=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${l}`))return;const f=document.createElement("link");if(f.rel=g?"stylesheet":_t,g||(f.as="script"),f.crossOrigin="",f.href=p,c&&f.setAttribute("nonce",c),document.head.appendChild(f),g)return new Promise((b,x)=>{f.addEventListener("load",b),f.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${p}`)))})}))}function s(i){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=i,window.dispatchEvent(r),!r.defaultPrevented)throw i}return o.then(i=>{for(const r of i||[])r.status==="rejected"&&s(r.reason);return t().catch(s)})};let Z=null;function nt(e){return e.startsWith("/api/")&&!e.startsWith("/api/v1/")?"/api/v1"+e.slice(4):e}async function Re(e,t,n,a){const o=localStorage.getItem("zuno_token"),s={};o&&(s.Authorization=`Bearer ${o}`);const i=nt(t);let c=`${X()}${i}`;if(a){const b=new URLSearchParams;Object.entries(a).forEach(([_,v])=>{v!==""&&v!=null&&b.append(_,v)});const x=b.toString();x&&(c+="?"+x)}const p={method:e,headers:s};n&&["POST","PATCH","PUT","DELETE"].includes(e)&&(s["Content-Type"]="application/json",p.body=JSON.stringify(n));const g=await fetch(c,p),l=await g.text();let f;try{f=JSON.parse(l)}catch{f=l}return{ok:g.ok,status:g.status,data:f}}async function u(e,t,n=null,a=null){typeof window.showProgress=="function"&&window.showProgress();try{let o=await Re(e,t,n,a);if(o.status===401&&(!!localStorage.getItem("zuno_refresh_token")&&await Ct()&&(o=await Re(e,t,n,a)),o.status===401)){const r=window.location.hash||"#";if(r!=="#auth"&&r!=="#")try{sessionStorage.setItem("zuno_intended_route",r)}catch{}localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),window.location.hash!=="#auth"&&(window.location.hash="#auth")}return o}catch(o){const s=`${X()}${nt(t)}`;return console.error("[API]",e,s,o.message),{ok:!1,status:0,data:{error:o.message}}}finally{typeof window.hideProgress=="function"&&window.hideProgress()}}async function Ct(){return Z||(Z=(async()=>{try{const{refreshAccessToken:e}=await ee(async()=>{const{refreshAccessToken:t}=await Promise.resolve().then(()=>Ot);return{refreshAccessToken:t}},void 0);return await e()}catch{return!1}finally{Z=null}})(),Z)}let A=null;function Te(e){A=e}function Oe(e){const t=document.querySelector("#topnav .header-profile-btn"),n=document.getElementById("header-profile-avatar");!t||!n||(e?(n.style.backgroundImage=`url(${encodeURI(e)})`,n.classList.remove("hidden"),t.classList.add("has-avatar")):(n.style.backgroundImage="",n.classList.add("hidden"),t.classList.remove("has-avatar")))}async function Tt(e=!1){if(A&&!e)return Oe(A.avatar_url||null),A;const t=await u("GET","/api/profile");return t.ok&&(A=t.data),Oe((A==null?void 0:A.avatar_url)||null),A||{}}let me="saved";function ot(e){me=e}let ce="summary";function Ee(e){ce=e}let R="active";function Et(e){R=e}let O=!1;function Pt(e){O=e}let ue=!1;function Lt(e){ue=e}let U="fts";function At(e){U=e}let Q=[];function De(e){Q.push(e)}function It(){Q=[]}const Mt=["What topics appear most in my saved content?","Summarize my most recent saves","What are the key takeaways from my articles?","How are my saved items connected?"];let le=null;function Bt(e){le=e}const pe=new Set;function at(e){pe.add(e)}function I(e){pe.delete(e)}function q(){return pe}function Ht(e){return pe.has(e)}function J(e=3){return Array(e).fill(0).map(()=>`
    <div class="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div class="flex gap-3">
        <div class="w-20 h-20 rounded-xl skeleton-line flex-shrink-0"></div>
        <div class="flex-1 space-y-2.5 py-1">
          <div class="h-4 skeleton-line w-3/4"></div>
          <div class="h-3 skeleton-line w-full"></div>
          <div class="h-3 skeleton-line w-1/3"></div>
        </div>
      </div>
    </div>`).join("")}function he(){return`
    <div class="space-y-4">
      <div class="h-48 rounded-2xl skeleton-line"></div>
      <div class="h-6 skeleton-line w-2/3"></div>
      <div class="h-4 skeleton-line w-full"></div>
      <div class="h-4 skeleton-line w-5/6"></div>
      <div class="flex gap-2"><div class="h-6 w-16 rounded-full skeleton-line"></div><div class="h-6 w-20 rounded-full skeleton-line"></div></div>
    </div>`}function Fe(){return'<div class="flex justify-center py-12"><div class="spinner"></div></div>'}function d(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Pe(e,t=100){return e&&e.length>t?e.slice(0,t)+"...":e||""}function jt(){const e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"}function m(e,t=!1){const n=document.getElementById("toast");n.querySelector(".toast-msg").textContent=e;const a=n.querySelector(".toast-icon");a.textContent=t?"error_outline":"check_circle",a.className=`toast-icon material-icons-round text-lg ${t?"text-danger":"text-success"}`,n.classList.remove("hidden"),clearTimeout(n._t),n._t=setTimeout(()=>n.classList.add("hidden"),3e3)}window.toast=m;function F(e){if(e.ok)return;const t=e.data;let n="Something went wrong";t&&typeof t=="object"?typeof t.error=="string"?n=t.error:t.detail!=null&&(typeof t.detail=="string"?n=t.detail:Array.isArray(t.detail)&&(n=t.detail.map(a=>a.msg||a.message||JSON.stringify(a)).join("; ")||n)):typeof t=="string"&&t&&(n=t),m(n,!0)}function st(e){e.innerHTML=`
    <div class="flex flex-col items-center justify-center min-h-[80vh] fade-in">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-neutral-200/80 dark:bg-foreground/10 mb-5">
            <span class="material-icons-round text-4xl text-neutral-900 dark:text-white">auto_awesome</span>
          </div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-white">Welcome to Zuno</h1>
          <p class="text-neutral-600 dark:text-neutral-300 text-sm mt-2">Your AI-powered content companion</p>
        </div>
        <div class="space-y-4">

          <!-- Google Sign-In Button -->
          <button id="google-btn" onclick="doGoogleLogin()" class="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] border border-neutral-700 font-semibold py-3.5 rounded-xl transition-transform active:scale-[0.97] text-white shadow-sm">
            <svg width="20" height="20" viewBox="0 0 48 48" class="flex-shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div id="auth-error" class="hidden text-danger text-sm text-center bg-danger/10 rounded-xl px-4 py-2.5"></div>

          <p class="text-neutral-600 dark:text-neutral-300 text-xs text-center leading-relaxed mt-4">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>`}async function Gt(){const e=et(),t=`${Ce}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(e)}`;if(K())try{const{Browser:n}=await ee(async()=>{const{Browser:a}=await import("./index-wqVEj9fh.js");return{Browser:a}},[]);await n.open({url:t,windowName:"_system"})}catch{window.open(t,"_system")}else window.location.href=t}async function Le(e){let t;if(e){const r=e.indexOf("#");t=r>=0?e.substring(r+1):""}else{const r=window.location.hash;t=r?r.substring(1):""}if(t&&t.includes("error=")){const r=new URLSearchParams(t),c=r.get("error")||"unknown",p=r.get("error_description")||r.get("error_description")||c,g=`${c}: ${decodeURIComponent(String(p).replace(/\+/g," "))}`;return console.error("[OAuth]",g),m(g,!0),history.replaceState(null,"",window.location.pathname+"#auth"),!1}if(!t||!t.includes("access_token="))return!1;const n=new URLSearchParams(t),a=n.get("access_token"),o=n.get("refresh_token");if(!a)return!1;if(localStorage.setItem("zuno_token",a),o&&localStorage.setItem("zuno_refresh_token",o),K())try{const{Browser:r}=await ee(async()=>{const{Browser:c}=await import("./index-wqVEj9fh.js");return{Browser:c}},[]);await r.close()}catch{}let s="#home";try{const r=sessionStorage.getItem("zuno_intended_route");r&&r.startsWith("#")&&(s=r,sessionStorage.removeItem("zuno_intended_route"))}catch{}history.replaceState(null,"",window.location.pathname+s);const i=await u("GET","/api/profile");return i.ok?(Te(i.data),tt(),m("Signed in as "+(i.data.display_name||i.data.email||"user")),!0):(localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),history.replaceState(null,"",window.location.pathname+"#auth"),F(i),!1)}async function Rt(){const e=localStorage.getItem("zuno_refresh_token");if(!e)return!1;try{const t=await fetch(`${Ce}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{"Content-Type":"application/json",apikey:Je},body:JSON.stringify({refresh_token:e})});if(!t.ok)return!1;const n=await t.json();return n.access_token?(localStorage.setItem("zuno_token",n.access_token),n.refresh_token&&localStorage.setItem("zuno_refresh_token",n.refresh_token),!0):!1}catch{return!1}}function rt(){localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),Te(null),E("#auth"),m("Signed out")}window.doLogout=rt;window.doGoogleLogin=Gt;const Ot=Object.freeze(Object.defineProperty({__proto__:null,doLogout:rt,handleOAuthCallback:Le,refreshAccessToken:Rt,renderAuth:st},Symbol.toStringTag,{value:"Module"}));function D(e,t="indigo"){return e?`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-${t}-500/15 text-${t}-600 dark:text-${t}-400">${d(e)}</span>`:""}function we(e){return{youtube:"play_circle",instagram:"camera_alt",x:"tag",reddit:"forum",tiktok:"music_note",spotify:"headphones",web:"language"}[e]||"link"}function te(e,t={}){const n=e.content_id||e.id,a=e.title||e.url||"Untitled",o=e.description||e.ai_summary||"",s=e.image_url||e.thumbnail_url,i=e.category||e.ai_category,r=e.platform,c=t.showBookmark||!1,p=t.isBookmarked||!1,g=t.showAiStatus||!1,l=t.processingIds||null,f=e.ai_processed,b=g&&l&&l.has(n),x=t.roundedMinimal||!1,_=x?"rounded-md":"rounded-2xl",v=x?"rounded":"rounded-xl",y=g?b?`<span class="text-accent/80 text-[10px] flex items-center gap-1 shrink-0" role="status" aria-busy="true">
        <span class="progress-bar-inline flex-1 min-w-[48px] max-w-[80px]"><span class="progress-bar-inline-inner block h-full rounded"></span></span>
        <span class="material-icons-round text-xs">auto_awesome</span> Getting insights…
       </span>`:f?'<span class="text-success text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">check_circle</span>Ready</span>':'<span class="text-muted-foreground text-[10px]">In queue</span>':"";return`
    <article class="bg-card ${_} p-4 border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.97] group"
      onclick="if(!event.target.closest('.card-action'))navigate('#content-detail/${n}')">
      <div class="flex gap-3">
        ${s?`<img src="${d(s)}" alt="" class="w-20 h-20 ${v} object-cover flex-shrink-0" onerror="this.style.display='none'" loading="lazy"/>`:`<div class="w-20 h-20 ${v} bg-surface-hover flex items-center justify-center flex-shrink-0"><span class="material-icons-round text-2xl text-muted-foreground">${we(r)}</span></div>`}
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${d(a)}</h3>
            ${c?`
              <button class="card-action flex-shrink-0 p-1 rounded-lg hover:bg-surface-hover transition-colors" onclick="toggleBookmark('${e.id}', this)" aria-label="${p?"Remove bookmark":"Add bookmark"}">
                <span class="material-icons-round text-lg ${p?"text-accent bookmark-pop":"text-muted-foreground"}">${p?"bookmark":"bookmark_border"}</span>
              </button>`:""}
          </div>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-2">${d(Pe(o,120))}</p>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            ${D(i)}
            ${r?`<span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">${we(r)}</span>${d(r)}</span>`:""}
            ${y}
          </div>
        </div>
      </div>
    </article>`}function it(e,t=48,n=4,a="var(--c-accent)"){const o=(t-n)/2,s=2*Math.PI*o,i=s-s*e/100;return`<svg width="${t}" height="${t}" viewBox="0 0 ${t} ${t}" class="transform -rotate-90">
    <circle cx="${t/2}" cy="${t/2}" r="${o}" fill="none" stroke="var(--c-border)" stroke-width="${n}"/>
    <circle cx="${t/2}" cy="${t/2}" r="${o}" fill="none" stroke="${a}" stroke-width="${n}" stroke-dasharray="${s}" stroke-dashoffset="${i}" stroke-linecap="round" class="progress-ring-circle"/>
  </svg>`}async function Dt(e){await u("PATCH","/api/user-preferences",{feed_type:e}),await k()}async function Ft(e,t){var a;const n=await u("POST",`/api/feed/bookmarks/${e}/toggle`);if(n.ok){const o=t.querySelector("span"),s=((a=n.data)==null?void 0:a.bookmarked)??!o.textContent.includes("border");o.textContent=s?"bookmark":"bookmark_border",o.classList.toggle("text-accent",s),o.classList.toggle("text-muted-foreground",!s),s?o.classList.add("bookmark-pop"):o.classList.remove("bookmark-pop")}}window.switchFeedType=Dt;window.toggleBookmark=Ft;const Ut=15,Ue=15,ze={blue:"from-blue-500/20 to-blue-600/5 border-blue-500/20",green:"from-green-500/20 to-green-600/5 border-green-500/20",purple:"from-purple-500/20 to-purple-600/5 border-purple-500/20",amber:"from-amber-500/20 to-amber-600/5 border-amber-500/20",rose:"from-rose-500/20 to-rose-600/5 border-rose-500/20",indigo:"from-indigo-500/20 to-indigo-600/5 border-indigo-500/20"};function zt(e){const t=ze[e.theme]||ze.blue;return`
    <article onclick="navigate('#collection/${e.id}')" class="bg-gradient-to-br ${t} border rounded-md p-3 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-24 w-[140px] flex-shrink-0 flex flex-col justify-between">
      <span class="material-icons-round text-lg text-heading/80">${d(e.icon||"folder")}</span>
      <div class="min-w-0">
        <h3 class="text-heading font-semibold text-xs leading-snug line-clamp-1">${d(e.title)}</h3>
        <p class="text-muted text-[10px] mt-0.5">${e.item_count} item${e.item_count!==1?"s":""}</p>
      </div>
    </article>`}async function Nt(e){const[t,n,a]=await Promise.all([Tt(),u("GET","/api/collections"),u("GET","/api/content",null,{limit:Ue})]);n.ok||F(n),a.ok||F(a);const o=(t==null?void 0:t.display_name)||"there",i=(n.ok?Array.isArray(n.data)?n.data:[]:[]).slice(0,Ut),r=a.ok?a.data:null,p=(Array.isArray(r)?r:(r==null?void 0:r.items)??[]).slice(0,Ue),g=`
    <section class="mb-4" aria-label="Welcome">
      <h1 class="text-xl font-bold text-heading">Hi, ${d(o)}!</h1>
      <p class="text-muted-foreground text-sm mt-0.5">${jt()}</p>
    </section>`,l=`
    <section class="mb-4" aria-label="Search">
      <button type="button" onclick="navigate('#search')" class="w-full flex items-center gap-3 px-4 py-3 rounded-sm bg-surface border border-border text-left hover:bg-surface-hover transition-colors active:scale-[0.99]" aria-label="Search content">
        <span class="material-icons-round text-xl text-muted-foreground shrink-0">search</span>
        <span class="text-muted-foreground text-sm">Search</span>
      </button>
    </section>`,f=i.length===0?`
    <div class="flex items-center justify-center gap-3 py-4 px-4 rounded-md bg-surface border border-border">
      <span class="material-icons-round text-2xl text-muted-foreground">folder_open</span>
      <p class="text-muted-foreground text-sm">No collections yet</p>
      <a href="#collections" onclick="navigate('#collections');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>
    </div>`:`
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style="scrollbar-width:thin;">
      ${i.map(zt).join("")}
      <a href="#collections" onclick="navigate('#collections');return false" class="flex-shrink-0 w-[100px] h-24 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-accent hover:bg-accent/5 transition-all text-muted text-xs font-medium" aria-label="View all collections">
        View all
      </a>
    </div>`,b=p.length===0?`
    <div class="flex items-center justify-center gap-3 py-6 px-4 rounded-md bg-surface border border-border">
      <span class="material-icons-round text-2xl text-muted-foreground">bookmark_border</span>
      <p class="text-muted-foreground text-sm">No content yet</p>
      <a href="#home/saved" onclick="navigate('#home/saved');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>
    </div>`:`
    <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1" id="home-library-list">
      ${p.map(_=>te(_,{showAiStatus:!0,processingIds:q(),roundedMinimal:!0})).join("")}
      <a href="#home/saved" onclick="navigate('#home/saved');return false" class="block text-center py-3 text-accent text-sm font-semibold hover:underline rounded-md border border-dashed border-border hover:border-accent">View all</a>
    </div>`,x=`
    <section class="mb-5" aria-label="Share Zuno">
      <div class="flex items-center justify-between gap-4 p-4 rounded-sm bg-surface border border-border shadow-sm">
        <div class="flex items-center gap-3 min-w-0">
          <span class="material-icons-round text-2xl text-heading shrink-0" aria-hidden="true">auto_awesome</span>
          <p class="text-heading font-semibold text-sm">Share your Zuno</p>
        </div>
        <button type="button" onclick="openSaveContentModal()" class="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-sm bg-white dark:bg-neutral-800 text-heading border border-border hover:bg-surface-hover text-sm font-semibold shadow-sm transition-colors active:scale-[0.97]" aria-label="Add content">
          <span class="material-icons-round text-lg">add</span>
          <span>Add</span>
        </button>
      </div>
    </section>`;e.innerHTML=`
    <div class="fade-in pb-6">
      ${g}
      ${l}
      ${x}
      <section class="mb-6" aria-label="Collections">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-heading">Collections</h2>
          ${i.length>0?`<a href="#collections" onclick="navigate('#collections');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>`:""}
        </div>
        ${f}
      </section>

      <section aria-label="Library">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-heading">Library</h2>
          ${p.length>0?`<a href="#home/saved" onclick="navigate('#home/saved');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>`:""}
        </div>
        ${b}
      </section>
    </div>`}function L(e){document.getElementById("modal-content").innerHTML=e,document.getElementById("modal-overlay").classList.remove("hidden")}function V(){document.getElementById("modal-overlay").classList.add("hidden")}window.openModal=L;window.closeModal=V;let de=null;function lt(){de&&(clearInterval(de),de=null)}async function qt(e){const t=window.location.hash||"#home",n=t==="#home"||t.startsWith("#home/saved");if(q().size===0||!n){lt();return}const a=await u("GET","/api/content",null,{limit:50});if(!a.ok)return;const o=a.data,s=Array.isArray(o)?o:(o==null?void 0:o.items)??[];let i=!1;s.forEach(r=>{q().has(r.id)&&r.ai_processed&&(I(r.id),i=!0)}),i&&n&&await Ae(e)}async function dt(e,t){(t==="saved"||t==="bookmarks")&&ot(t),me==="saved"?await Ae(e):await Ie(e)}function Wt(e){const t=(n,a)=>{const o=e===a;return`<button onclick="switchLibraryTab('${a}')" role="tab" aria-selected="${o}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${o?"bg-accent text-white shadow-sm":"text-muted hover:text-heading"}">${n}</button>`};return`<div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Library view">
    ${t("Saved","saved")}
    ${t("Bookmarks","bookmarks")}
  </div>`}async function Ae(e){const t=await u("GET","/api/content",null,{limit:50});t.ok||F(t);const n=t.ok?t.data:null,a=Array.isArray(n)?n:(n==null?void 0:n.items)??[];a.forEach(o=>{o.ai_processed&&I(o.id)}),e.innerHTML=`
    <div class="fade-in">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h1 class="text-xl font-bold text-heading">Library</h1>
        <button type="button" onclick="refreshLibrary()" id="library-refresh-btn" class="p-2 rounded-xl text-muted hover:text-heading hover:bg-surface-hover transition-colors active:scale-95" aria-label="Refresh list" title="Refresh list">
          <span class="material-icons-round text-xl">refresh</span>
        </button>
      </div>

      ${a.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">bookmark_border</span>
          </div>
          <p class="text-heading font-semibold mb-1">No saved content yet</p>
          <p class="text-muted text-sm mb-4">Tap the + button to save your first item</p>
        </div>`:`
        <div class="space-y-3" id="content-list">
          ${a.map(o=>te(o,{showAiStatus:!0,processingIds:q(),roundedMinimal:!0})).join("")}
        </div>`}
    </div>`,q().size>0&&(lt(),de=setInterval(()=>qt(e),4500))}async function Ie(e,t={}){const{standalone:n=!1,backHash:a="",backLabel:o=""}=t,s=await u("GET","/api/feed/bookmarks/items");s.ok||F(s);const i=s.ok?Array.isArray(s.data)?s.data:[]:[],r=n&&a&&o?`<a href="${a}" onclick="navigate('${a}');return false" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-heading mb-4">← ${d(o)}</a>`:"";e.innerHTML=`
    <div class="fade-in">
      ${r}
      <div class="flex items-center justify-between gap-3 mb-4">
        <h1 class="text-xl font-bold text-heading">${n?"Bookmarks":"Library"}</h1>
        <button type="button" onclick="refreshLibrary()" id="library-refresh-btn" class="p-2 rounded-xl text-muted hover:text-heading hover:bg-surface-hover transition-colors active:scale-95" aria-label="Refresh list" title="Refresh list">
          <span class="material-icons-round text-xl">refresh</span>
        </button>
      </div>
      ${n?"":Wt("bookmarks")}

      ${i.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">bookmark</span>
          </div>
          <p class="text-heading font-semibold mb-1">No bookmarks yet</p>
          <p class="text-muted text-sm mb-4">When the Feed is enabled, you can bookmark items there to see them here.</p>
          
        </div>`:`
        <div class="space-y-3" id="bookmarks-list">
          ${i.map(c=>te(c,{showBookmark:!0,isBookmarked:!0,roundedMinimal:!0})).join("")}
        </div>`}
    </div>`}const Ne={blue:"from-blue-500/20 to-blue-600/5 border-blue-500/20",green:"from-green-500/20 to-green-600/5 border-green-500/20",purple:"from-purple-500/20 to-purple-600/5 border-purple-500/20",amber:"from-amber-500/20 to-amber-600/5 border-amber-500/20",rose:"from-rose-500/20 to-rose-600/5 border-rose-500/20",indigo:"from-indigo-500/20 to-indigo-600/5 border-indigo-500/20"};function Kt(e,t){return`
    ${t.length>0?`
      <div class="mb-5">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Topics</h2>
        <div class="flex flex-wrap gap-1.5">
          ${t.map(n=>`<span class="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-body">${d(typeof n=="string"?n:n.name||n.category||"")}</span>`).join("")}
        </div>
      </div>`:""}

    ${e.length===0?`
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
          <span class="material-icons-round text-4xl text-accent/60">folder_open</span>
        </div>
        <p class="text-heading font-semibold mb-1">No collections yet</p>
        <p class="text-muted text-sm mb-4">Create your first collection to organize content</p>
        <button onclick="openCreateCollectionModal()" class="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Create Collection</button>
      </div>`:`
      <div class="grid grid-cols-2 gap-3">
        ${e.map(n=>{const a=Ne[n.theme]||Ne.blue;return`
          <article onclick="navigate('#collection/${n.id}')" class="bg-gradient-to-br ${a} border rounded-md p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-36 flex flex-col justify-between">
            <span class="material-icons-round text-2xl text-heading/80">${d(n.icon||"folder")}</span>
            <div>
              <h3 class="text-heading font-semibold text-sm leading-snug line-clamp-1">${d(n.title)}</h3>
              <p class="text-muted text-xs mt-0.5">${n.item_count} item${n.item_count!==1?"s":""}</p>
              ${n.is_shared?'<span class="text-[10px] text-accent font-medium">Shared</span>':""}
            </div>
          </article>`}).join("")}
        <button onclick="openCreateCollectionModal()" class="border-2 border-dashed border-border rounded-md h-36 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all duration-200 active:scale-[0.97]" aria-label="Create new collection">
          <span class="material-icons-round text-2xl text-muted">add</span>
          <span class="text-muted text-xs font-medium">New Collection</span>
        </button>
      </div>`}
  `}async function Vt(e){const[t,n]=await Promise.all([u("GET","/api/collections"),u("GET","/api/collections/categories")]);t.ok||F(t),n.ok||F(n);const a=t.ok?Array.isArray(t.data)?t.data:[]:[],o=n.ok?Array.isArray(n.data)?n.data:[]:[];e.innerHTML=`
    <div class="fade-in">
      <h1 class="text-xl font-bold text-heading mb-4">Collections</h1>
      ${Kt(a,o)}
    </div>`}async function Zt(){const e=document.getElementById("page");if(!e)return;const t=(window.location.hash||"").replace(/^#/,""),[n,a]=t.split("/"),o=document.getElementById("library-refresh-btn");if(o){o.disabled=!0;const s=o.querySelector(".material-icons-round");s&&s.classList.add("animate-spin")}if(n==="profile"&&a==="bookmarks"?await Ie(e,{standalone:!0,backHash:"#profile",backLabel:"Profile"}):await dt(e,me),o){o.disabled=!1;const s=o.querySelector(".material-icons-round");s&&s.classList.remove("animate-spin")}}function Jt(e){ot(e),E(e==="saved"?"#home":`#home/${e}`)}function ke(e=""){return`
    <h2 class="text-lg font-bold text-heading mb-4">Add content</h2>
    <div class="space-y-4">
      <div>
        <label for="m-url" class="text-xs text-muted font-medium mb-1.5 block">URL</label>
        <input id="m-url" type="url" inputmode="url" autocomplete="url" placeholder="Paste a link..." value="${d(e)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" autofocus />
        <p class="text-[11px] text-muted mt-1.5">Title, description, platform and type are auto-detected</p>
      </div>
      <button onclick="doSaveContent()" id="save-content-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97] min-h-[44px]">Save Content</button>
    </div>
  `}function Yt(){return`
    <div class="flex flex-col items-center justify-center py-6 gap-4" role="status" aria-busy="true">
      <span class="material-icons-round text-3xl text-accent/80">link</span>
      <p class="text-sm font-medium text-heading">Saving link…</p>
      <div class="progress-bar-inline w-full" style="max-width: 280px;">
        <span class="progress-bar-inline-inner block h-full rounded"></span>
      </div>
    </div>
  `}function Qt(e=""){L(ke(e))}async function Xt(e=null){const t=(window.location.hash||"").replace("#","");if(!((t==="home"||t==="home/saved")&&me==="saved"))return;const a=await u("GET","/api/content",null,{limit:50});if(!a.ok)return;const o=a.data,s=Array.isArray(o)?o:(o==null?void 0:o.items)??[];s.forEach(r=>{r.ai_processed&&I(r.id)});const i=document.getElementById("content-list");if(i){const r=q();if(i.innerHTML=s.map(c=>{const p=e&&(c.id===e||(c.content_id||c.id)===e),g=te(c,{showAiStatus:!0,processingIds:r,roundedMinimal:!0});return p?g.replace('<article class="','<article class="new-item-highlight '):g}).join(""),e){const c=i.querySelector(".new-item-highlight");c&&setTimeout(()=>c.classList.remove("new-item-highlight"),1500)}}else{const r=document.getElementById("page");r&&await Ae(r)}}async function en(){var a,o;const e=document.getElementById("m-url"),t=e?e.value.trim():"";if(!t){m("URL is required",!0);return}const n=document.getElementById("modal-content");n&&(n.innerHTML=Yt());try{const s=await u("POST","/api/content",{url:t});if(s.ok){const i=(a=s.data)==null?void 0:a.id;i&&(at(i),u("POST","/api/ai/process-content",{content_id:i}).catch(()=>{I(i),m("AI processing failed for this item",!0)})),V(),m("Link saved"),await Xt(i)}else n&&(n.innerHTML=ke(t)),m(((o=s.data)==null?void 0:o.detail)||"Couldn't save link. Check the URL and try again.",!0)}catch{n&&(n.innerHTML=ke(t)),m("Couldn't save link. Check the URL and try again.",!0)}}function tn(){L(`
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
  `)}async function nn(){var o;const e=document.getElementById("c-title").value.trim();if(!e){m("Title is required",!0);return}const t=document.getElementById("create-col-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:e,description:document.getElementById("c-desc").value.trim()||null,icon:document.getElementById("c-icon").value.trim()||"folder",theme:document.getElementById("c-theme").value},a=await u("POST","/api/collections",n);a.ok?(V(),m("Collection created!"),E("#collection/"+a.data.id)):(m(((o=a.data)==null?void 0:o.detail)||"Failed to create",!0),t.textContent="Create Collection",t.disabled=!1)}window.refreshLibrary=Zt;window.switchLibraryTab=Jt;window.openSaveContentModal=Qt;window.doSaveContent=en;window.openCreateCollectionModal=tn;window.doCreateCollection=nn;function Me(e,t,n="Confirm",a=!1){return new Promise(o=>{const s=document.getElementById("confirm-overlay");document.getElementById("confirm-content").innerHTML=`
      <h3 class="text-lg font-bold text-heading mb-2">${e}</h3>
      <p class="text-muted-foreground text-sm mb-6">${t}</p>
      <div class="flex gap-3">
        <button id="confirm-cancel" class="flex-1 py-3 rounded-xl text-sm font-semibold bg-surface-hover text-heading hover:bg-border transition-colors active:scale-[0.97]">Cancel</button>
        <button id="confirm-ok" class="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors active:scale-[0.97] ${a?"bg-danger hover:bg-red-600 text-white":"bg-primary hover:bg-primary/90 text-primary-foreground"}">${n}</button>
      </div>`,s.classList.remove("hidden"),document.getElementById("confirm-cancel").onclick=()=>{s.classList.add("hidden"),o(!1)},document.getElementById("confirm-ok").onclick=()=>{s.classList.add("hidden"),o(!0)}})}async function j(e,t){if(!t){E("#home");return}const[n,a]=await Promise.all([u("GET",`/api/content/${t}`),u("GET",`/api/content/${t}/tags`)]);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Content not found</p></div>';return}const o=n.data;o.ai_processed&&I(o.id);const s=a.ok&&a.data.content_tags?a.data.content_tags.map(c=>c.tags||c):[],i=Ht(o.id),r=c=>ce===c?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-heading";if(e.innerHTML=`
    <div class="slide-in-right">
      <!-- Sticky Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('#home')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to library">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${d(o.title||"Untitled")}</h1>
        <button onclick="openContentActions('${o.id}')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="More actions">
          <span class="material-icons-round text-xl text-muted-foreground">more_vert</span>
        </button>
      </div>

      <!-- Hero Image -->
      ${o.thumbnail_url?`<img src="${d(o.thumbnail_url)}" alt="" class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm" onerror="this.style.display='none'" />`:""}

      <!-- Title & URL -->
      <div class="mb-4">
        <h2 class="text-xl font-bold text-heading leading-snug">${d(o.title||"Untitled")}</h2>
        <a href="${d(o.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all mt-1 inline-block">${d(Pe(o.url,60))}</a>
      </div>

      <!-- Badges -->
      <div class="flex items-center gap-2 flex-wrap mb-5">
        ${D(o.platform,"gray")}
        ${D(o.content_type,"purple")}
        ${D(o.ai_category,"emerald")}
        ${o.ai_processed?'<span class="text-success text-xs flex items-center gap-0.5"><span class="material-icons-round text-sm">check_circle</span>AI Processed</span>':i?'<span class="text-accent/80 text-xs flex items-center gap-1.5" role="status" aria-busy="true"><span class="progress-bar-inline w-16 h-1"><span class="progress-bar-inline-inner block h-full rounded"></span></span><span class="material-icons-round text-sm">auto_awesome</span> Getting insights…</span>':'<span class="text-muted-foreground text-xs">Not AI processed</span>'}
      </div>

      <!-- Content Tabs -->
      <div class="flex bg-card rounded-xl p-1 gap-1 mb-4 shadow-sm" role="tablist">
        <button onclick="switchContentTab('summary','${o.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${r("summary")}">Summary</button>
        <button onclick="switchContentTab('tags','${o.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${r("tags")}">Tags</button>
        <button onclick="switchContentTab('info','${o.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${r("info")}">Info</button>
      </div>

      <div id="content-tab-body" class="mb-6">
        ${on(o,s)}
      </div>

      <!-- Primary Action -->
      ${!o.ai_processed&&!i?`
        <button onclick="processWithAI('${o.id}')" id="ai-btn" class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97] mb-3 shadow-sm min-h-[44px]">
          <span class="material-icons-round text-lg">auto_awesome</span> Get insights
        </button>`:""}

      <button onclick="openAddToCollectionModal('${o.id}')" class="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover border border-border text-heading font-semibold py-3 rounded-xl transition-colors active:scale-[0.97] shadow-sm">
        <span class="material-icons-round text-lg">folder</span> Add to Collection
      </button>
    </div>`,i){window._contentDetailPoll&&clearInterval(window._contentDetailPoll);const c=o.id;window._contentDetailPoll=setInterval(async()=>{if((window.location.hash||"").indexOf("content-detail/"+c)===-1){window._contentDetailPoll&&clearInterval(window._contentDetailPoll),window._contentDetailPoll=null;return}const p=await u("GET",`/api/content/${c}`);p.ok&&p.data.ai_processed&&(window._contentDetailPoll&&clearInterval(window._contentDetailPoll),window._contentDetailPoll=null,I(c),Ee("summary"),await j(e,c))},4e3)}else window._contentDetailPoll&&(clearInterval(window._contentDetailPoll),window._contentDetailPoll=null)}function on(e,t){return ce==="summary"?e.ai_summary?`<div class="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Summary</h3>
          </div>
          <p class="text-body text-sm leading-relaxed">${d(e.ai_summary)}</p>
        </div>`:`<div class="text-center py-8"><p class="text-muted-foreground text-sm">No summary yet</p>${e.ai_processed?"":'<p class="text-muted-foreground text-xs mt-1">Get insights to generate a summary</p>'}</div>`:ce==="tags"?t.length>0?`<div class="flex flex-wrap gap-2">${t.map(n=>`<button onclick="navigate('#search');setTimeout(()=>{document.getElementById('search-input').value='${d(n.name||n.slug||"")}';setSearchType('tag');doSearch()},100)" class="px-3 py-1.5 rounded-xl bg-surface border border-border text-sm text-body hover:border-accent hover:text-accent transition-colors">${d(n.name||n.slug||"")}</button>`).join("")}</div>`:'<div class="text-center py-8"><p class="text-muted-foreground text-sm">No tags yet</p></div>':`
    <div class="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
      ${e.description?`<div><label class="text-xs text-muted-foreground font-medium block mb-1">Description</label><p class="text-body text-sm">${d(e.description)}</p></div>`:""}
      <div><label class="text-xs text-muted-foreground font-medium block mb-1">URL</label><a href="${d(e.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all">${d(e.url)}</a></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-muted-foreground font-medium block mb-1">Platform</label><p class="text-body text-sm flex items-center gap-1"><span class="material-icons-round text-base">${we(e.platform)}</span>${d(e.platform||"Unknown")}</p></div>
        <div><label class="text-xs text-muted-foreground font-medium block mb-1">Type</label><p class="text-body text-sm">${d(e.content_type||"Unknown")}</p></div>
      </div>
      <div><label class="text-xs text-muted-foreground font-medium block mb-1">Status</label><p class="text-sm ${e.ai_processed?"text-success":"text-muted-foreground"}">${e.ai_processed?"Ready":"Not ready"}</p></div>
    </div>`}function an(e,t){Ee(e),j(document.getElementById("page"),t)}function sn(e){L(`
    <h2 class="text-lg font-bold text-heading mb-4">Actions</h2>
    <div class="space-y-2">
      <button onclick="closeModal();openEditContentModal('${e}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted-foreground">edit</span>
        <span class="text-heading text-sm font-medium">Edit Content</span>
      </button>
      <button onclick="closeModal();openAddToCollectionModal('${e}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted-foreground">folder</span>
        <span class="text-heading text-sm font-medium">Add to Collection</span>
      </button>
      <button onclick="closeModal();deleteContent('${e}')" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-danger/10 transition-colors text-left">
        <span class="material-icons-round text-xl text-danger">delete</span>
        <span class="text-danger text-sm font-medium">Delete</span>
      </button>
    </div>
  `)}async function rn(e){var t;at(e),await j(document.getElementById("page"),e),typeof showProgress=="function"&&showProgress();try{const n=await u("POST","/api/ai/process-content",{content_id:e});n.ok?n.status===202?m("AI processing started — refresh the list in a moment"):(I(e),m("AI processing complete!"),Ee("summary"),await j(document.getElementById("page"),e)):(I(e),m(((t=n.data)==null?void 0:t.detail)||"AI processing failed",!0),await j(document.getElementById("page"),e))}catch{I(e),m("AI processing failed",!0),await j(document.getElementById("page"),e)}finally{typeof hideProgress=="function"&&hideProgress()}}async function ln(e){const t=await u("GET","/api/collections"),n=t.ok?Array.isArray(t.data)?t.data:[]:[];L(`
    <h2 class="text-lg font-bold text-heading mb-4">Add to Collection</h2>
    ${n.length===0?'<p class="text-muted-foreground text-sm">No collections yet. Create one first.</p>':`
      <div class="space-y-2">
        ${n.map(a=>`
          <button onclick="addToCollection('${a.id}','${e}')" class="w-full text-left bg-bg hover:bg-surface-hover border border-border rounded-xl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <span class="material-icons-round text-xl text-accent">${d(a.icon||"folder")}</span>
              <div><p class="text-heading text-sm font-medium">${d(a.title)}</p><p class="text-muted-foreground text-xs">${a.item_count} items</p></div>
            </div>
          </button>`).join("")}
      </div>`}
  `)}async function dn(e,t){var a;const n=await u("POST",`/api/collections/${e}/items`,{content_id:t});n.ok?(V(),m("Added to collection!")):m(((a=n.data)==null?void 0:a.detail)||"Failed to add",!0)}async function cn(e){const t=await u("GET",`/api/content/${e}`);if(!t.ok)return;const n=t.data;L(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Content</h2>
    <div class="space-y-4">
      <div>
        <label for="e-title" class="text-xs text-muted-foreground font-medium mb-1.5 block">Title</label>
        <input id="e-title" value="${d(n.title||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="e-desc" class="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
        <textarea id="e-desc" rows="3" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${d(n.description||"")}</textarea>
      </div>
      <div>
        <label for="e-url" class="text-xs text-muted-foreground font-medium mb-1.5 block">URL</label>
        <input id="e-url" value="${d(n.url||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <button onclick="doEditContent('${e}')" id="edit-btn" class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `)}async function un(e){var o;const t=document.getElementById("edit-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:document.getElementById("e-title").value.trim()||null,description:document.getElementById("e-desc").value.trim()||null,url:document.getElementById("e-url").value.trim()||null},a=await u("PATCH",`/api/content/${e}`,n);a.ok?(V(),m("Content updated!"),await j(document.getElementById("page"),e)):(m(((o=a.data)==null?void 0:o.detail)||"Failed to update",!0),t.textContent="Save Changes",t.disabled=!1)}async function mn(e){var a;if(!await Me("Delete Content","This action cannot be undone. Are you sure?","Delete",!0))return;const n=await u("DELETE",`/api/content/${e}`);n.ok?(m("Deleted!"),E("#home")):m(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}window.switchContentTab=an;window.openContentActions=sn;window.processWithAI=rn;window.openAddToCollectionModal=ln;window.addToCollection=dn;window.openEditContentModal=cn;window.doEditContent=un;window.deleteContent=mn;async function Be(e,t){if(!t){E("#collections");return}const[n,a]=await Promise.all([u("GET",`/api/collections/${t}`),u("GET",`/api/collections/${t}/items`)]);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Collection not found</p></div>';return}const o=n.data,s=a.ok?Array.isArray(a.data)?a.data:[]:[];e.innerHTML=`
    <div class="slide-in-right">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-5">
        <button onclick="navigate('#collections')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="Back to collections">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons-round text-2xl text-accent">${d(o.icon||"folder")}</span>
            <h1 class="text-lg font-bold text-heading truncate">${d(o.title)}</h1>
          </div>
          <p class="text-muted-foreground text-xs mt-0.5">${o.item_count} items ${o.is_shared?"&middot; Shared":""}</p>
        </div>
        <div class="flex gap-1">
          <button onclick="openEditCollectionModal('${o.id}')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="Edit collection">
            <span class="material-icons-round text-lg text-muted-foreground">edit</span>
          </button>
          <button onclick="deleteCollection('${o.id}')" class="p-2 rounded-xl hover:bg-danger/10 transition-colors" aria-label="Delete collection">
            <span class="material-icons-round text-lg text-danger">delete</span>
          </button>
        </div>
      </div>

      ${o.description?`<p class="text-muted-foreground text-sm mb-4">${d(o.description)}</p>`:""}

      <button onclick="openAddContentToCollectionModal('${o.id}')" class="w-full flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border text-heading text-sm font-medium py-3 rounded-xl transition-colors mb-4 shadow-sm active:scale-[0.97]">
        <span class="material-icons-round text-base">add</span> Add Content
      </button>

      ${s.length===0?'<div class="text-center py-12"><p class="text-muted-foreground text-sm">No items in this collection</p></div>':`
        <div class="space-y-2">
          ${s.map(i=>{const r=i.content||i;return`
            <div class="bg-card rounded-xl p-3.5 flex items-center gap-3 hover:bg-card-hover transition-colors shadow-sm">
              <div class="flex-1 min-w-0 cursor-pointer" onclick="navigate('#content-detail/${r.id||i.content_id}')">
                <p class="text-heading text-sm font-medium truncate">${d(r.title||r.url||"Untitled")}</p>
                <p class="text-muted-foreground text-xs truncate">${d(r.url||"")}</p>
              </div>
              <button onclick="removeFromCollection('${o.id}','${r.id||i.content_id}')" class="p-1.5 rounded-lg hover:bg-danger/10 transition-colors" aria-label="Remove from collection">
                <span class="material-icons-round text-base text-danger">close</span>
              </button>
            </div>`}).join("")}
        </div>`}
    </div>`}async function pn(e){const t=await u("GET","/api/content",null,{limit:50}),n=t.ok?Array.isArray(t.data)?t.data:[]:[];L(`
    <h2 class="text-lg font-bold text-heading mb-4">Add Content</h2>
    ${n.length===0?'<p class="text-muted-foreground text-sm">No content to add. Save some content first.</p>':`
      <div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
        ${n.map(a=>`
          <button onclick="addToCollection('${e}','${a.id}')" class="w-full text-left bg-bg hover:bg-card-hover border border-border rounded-xl px-4 py-3 transition-colors">
            <p class="text-heading text-sm font-medium truncate">${d(a.title||a.url)}</p>
            <p class="text-muted-foreground text-xs truncate">${d(a.url)}</p>
          </button>`).join("")}
      </div>`}
  `)}async function fn(e,t){var a;const n=await u("DELETE",`/api/collections/${e}/items/${t}`);n.ok?(m("Removed from collection"),await Be(document.getElementById("page"),e)):m(((a=n.data)==null?void 0:a.detail)||"Failed to remove",!0)}async function gn(e){const t=await u("GET",`/api/collections/${e}`);if(!t.ok)return;const n=t.data;L(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Collection</h2>
    <div class="space-y-4">
      <div>
        <label for="ec-title" class="text-xs text-muted-foreground font-medium mb-1.5 block">Title</label>
        <input id="ec-title" value="${d(n.title)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="ec-desc" class="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
        <textarea id="ec-desc" rows="2" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${d(n.description||"")}</textarea>
      </div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input id="ec-shared" type="checkbox" ${n.is_shared?"checked":""} class="w-5 h-5 rounded-lg border-border text-accent focus:ring-accent" />
        <span class="text-sm text-heading font-medium">Share collection</span>
      </label>
      <button onclick="doEditCollection('${e}')" id="edit-col-btn" class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `)}async function bn(e){var o;const t=document.getElementById("edit-col-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:document.getElementById("ec-title").value.trim()||null,description:document.getElementById("ec-desc").value.trim()||null,is_shared:document.getElementById("ec-shared").checked},a=await u("PATCH",`/api/collections/${e}`,n);a.ok?(V(),m("Collection updated!"),await Be(document.getElementById("page"),e)):(m(((o=a.data)==null?void 0:o.detail)||"Failed to update",!0),t.textContent="Save Changes",t.disabled=!1)}async function xn(e){var a;if(!await Me("Delete Collection","This will remove the collection but not its content. Continue?","Delete",!0))return;const n=await u("DELETE",`/api/collections/${e}`);n.ok?(m("Deleted!"),E("#collections")):m(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}window.openAddContentToCollectionModal=pn;window.removeFromCollection=fn;window.openEditCollectionModal=gn;window.doEditCollection=bn;window.deleteCollection=xn;async function ne(e){const[t,n]=await Promise.all([u("GET","/api/goals",null,{status:R}),R==="active"?u("GET","/api/goals/suggestions",null,{status:"pending"}):Promise.resolve({ok:!0,data:[]})]),a=t.ok?Array.isArray(t.data)?t.data:[]:[],o=n.ok?Array.isArray(n.data)?n.data:[]:[],s=a.filter(l=>!l.parent_goal_id),i={};a.filter(l=>l.parent_goal_id).forEach(l=>{i[l.parent_goal_id]||(i[l.parent_goal_id]=[]),i[l.parent_goal_id].push(l)});const r=a.flatMap(l=>l.steps||[]),c=r.length,p=r.filter(l=>l.is_completed).length,g=c>0?Math.round(p/c*100):0;e.innerHTML=`
    <div class="fade-in">
      <!-- Header with Progress Ring -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-4">
          <div class="relative">
            ${it(g,52,4)}
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-heading">${g}%</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">Goals</h1>
            <p class="text-muted-foreground text-xs">${a.length} goal${a.length!==1?"s":""} &middot; ${p}/${c} steps</p>
          </div>
        </div>
        <button onclick="openGoalsMenu()" class="p-2 rounded-md hover:bg-surface-hover transition-colors" aria-label="Goal actions">
          <span class="material-icons-round text-xl text-muted-foreground">more_vert</span>
        </button>
      </div>

      <!-- Filter Pills -->
      <div class="flex gap-2 mb-5" role="tablist" aria-label="Goal status filter">
        ${["active","completed","dismissed"].map(l=>`
          <button onclick="setGoalsFilterAndRender('${l}')" role="tab" aria-selected="${R===l}" class="px-4 py-2 rounded-full text-xs font-semibold border border-border shadow-sm hover:shadow-md transition-all duration-200 ${R===l?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground"}">${l.charAt(0).toUpperCase()+l.slice(1)}</button>
        `).join("")}
      </div>

      <!-- Merge Suggestions Banner -->
      ${o.length>0?`
        <button onclick="toggleSuggestions()" class="w-full bg-purple-500/10 border border-purple-500/20 rounded-md p-4 mb-4 flex items-center gap-3 transition-all active:scale-[0.98]" aria-expanded="${O}">
          <div class="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span class="material-icons-round text-xl text-purple-400">merge_type</span>
          </div>
          <div class="flex-1 text-left">
            <p class="text-heading text-sm font-semibold">You have ${o.length} merge suggestion${o.length!==1?"s":""}</p>
            <p class="text-muted-foreground text-xs">Tap to ${O?"hide":"review"}</p>
          </div>
          <span class="material-icons-round text-muted-foreground transition-transform ${O?"rotate-180":""}">${O?"expand_less":"expand_more"}</span>
        </button>
        ${O?`<div class="space-y-3 mb-4">${o.map(vn).join("")}</div>`:""}
      `:""}

      <!-- Goals List -->
      ${s.length===0&&o.length===0?`
        <div class="rounded-md p-6 min-h-[180px] bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800/40 dark:to-neutral-800/20 border border-border shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div class="absolute inset-0 opacity-20 pointer-events-none"><svg viewBox="0 0 200 200" class="w-full h-full"><defs><filter id="blur-g"><feGaussianBlur in="SourceGraphic" stdDeviation="40"/></filter></defs><circle cx="60" cy="60" r="80" fill="currentColor" filter="url(#blur-g)"/></svg></div>
          <div class="relative z-10"><span class="material-icons-round text-4xl text-heading opacity-80">flag</span></div>
          <p class="relative z-10 text-heading font-semibold mb-1 mt-2">${R==="active"?"No active goals yet":"No "+R+" goals"}</p>
          <p class="relative z-10 text-muted-foreground text-sm">Save more content and Zuno will detect your goals automatically</p>
        </div>`:`
        <div class="space-y-3">
          ${s.map(l=>hn(l,i[l.id]||[])).join("")}
        </div>`}
    </div>`}function hn(e,t=[]){const n=Math.round((e.confidence||0)*100),a=(e.evidence_content_ids||[]).length,o=t.length>0,s=e.steps||[],i=s.filter(l=>l.is_completed).length,r=s.length,c=r>0?Math.round(i/r*100):0,g={active:"border-l-accent",completed:"border-l-success",dismissed:"border-l-muted"}[e.status]||"border-l-accent";return`
    <article onclick="navigate('#goal-detail/${e.id}')" class="bg-card rounded-md p-4 border border-border border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.97] ${g}">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded ${o?"bg-purple-500/15":"bg-accent/15"} flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl ${o?"text-purple-500":"text-accent"}">${o?"account_tree":"flag"}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${d(e.title)}</h3>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-2">${d(e.description||"")}</p>

          <!-- Mini Progress Bar -->
          ${r>0?`
          <div class="mt-2.5 flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div class="h-full ${o?"bg-purple-500":"bg-accent"} rounded-full transition-all duration-300" style="width:${c}%"></div>
            </div>
            <span class="text-muted-foreground text-[10px] flex-shrink-0">${i}/${r}</span>
          </div>`:""}

          <div class="flex items-center gap-3 mt-2">
            ${D(e.category,"emerald")}
            <span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">trending_up</span>${n}%</span>
            <span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">link</span>${a}</span>
            ${o?`<span class="text-purple-400 text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">account_tree</span>${t.length}</span>`:""}
          </div>
        </div>
      </div>
    </article>`}function vn(e){const t=(e.child_goal_ids||[]).length;return`
    <div class="bg-purple-500/10 border border-purple-500/20 rounded-md p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl text-purple-400">merge_type</span>
        </div>
        <div class="flex-1 min-w-0">
          <span class="inline-block text-[10px] font-semibold uppercase tracking-wide text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full mb-1.5">Suggested merge</span>
          <h3 class="font-semibold text-heading text-sm leading-snug">${d(e.suggested_parent_title)}</h3>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-3">${d(e.ai_reasoning||e.suggested_parent_description)}</p>
          <p class="text-purple-400/70 text-[10px] mt-1.5"><span class="material-icons-round text-xs align-middle">account_tree</span> Merges ${t} goal${t!==1?"s":""}</p>
          <div class="flex items-center gap-2 mt-3">
            <button onclick="event.stopPropagation();acceptSuggestion('${e.id}')" id="accept-${e.id}" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-2.5 px-3 rounded-md transition-colors active:scale-[0.97] flex items-center justify-center gap-1">
              <span class="material-icons-round text-sm">check</span> Accept
            </button>
            <button onclick="event.stopPropagation();dismissSuggestion('${e.id}')" id="dismiss-${e.id}" class="flex-1 bg-surface hover:bg-surface-hover text-muted-foreground text-xs font-semibold py-2.5 px-3 rounded-md transition-colors active:scale-[0.97] border border-border flex items-center justify-center gap-1">
              <span class="material-icons-round text-sm">close</span> Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>`}function yn(){Pt(!O),ne(document.getElementById("page"))}function wn(){L(`
    <h2 class="text-lg font-bold text-heading mb-4">Goal Actions</h2>
    <div class="space-y-2">
      <button onclick="closeModal();reanalyzeGoals()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-md hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-accent">refresh</span>
        <div><p class="text-heading text-sm font-medium">Refresh goals</p><p class="text-muted-foreground text-xs">Scan your content for new goals</p></div>
      </button>
      <button onclick="closeModal();triggerConsolidate()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-md hover:bg-surface-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-purple-400">merge_type</span>
        <div><p class="text-heading text-sm font-medium">Combine similar goals</p><p class="text-muted-foreground text-xs">Find goals that can be merged</p></div>
      </button>
    </div>
  `)}async function kn(e){var a,o;const t=document.getElementById("accept-"+e);t&&(t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0);const n=await u("POST",`/api/goals/suggestions/${e}/accept`);n.ok?(m(((a=n.data)==null?void 0:a.message)||"Goals merged!"),ne(document.getElementById("page"))):(m(((o=n.data)==null?void 0:o.detail)||"Failed to merge",!0),t&&(t.textContent="Accept",t.disabled=!1))}async function $n(e){var a;const t=document.getElementById("dismiss-"+e);t&&(t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0);const n=await u("POST",`/api/goals/suggestions/${e}/dismiss`);n.ok?(m("Suggestion dismissed"),ne(document.getElementById("page"))):(m(((a=n.data)==null?void 0:a.detail)||"Failed to dismiss",!0),t&&(t.textContent="Dismiss",t.disabled=!1))}async function _n(){var t,n;m("Starting consolidation...");const e=await u("POST","/api/goals/consolidate");e.ok?m(((t=e.data)==null?void 0:t.message)||"Finding similar goals…"):m(((n=e.data)==null?void 0:n.detail)||"Couldn't find goals to combine",!0)}async function Sn(){var t,n;m("Refreshing goals…");const e=await u("POST","/api/goals/reanalyze");e.ok?m(((t=e.data)==null?void 0:t.message)||"Goals refreshed!"):m(((n=e.data)==null?void 0:n.detail)||"Refresh failed",!0)}function Cn(e){Et(e),ne(document.getElementById("page"))}window.setGoalsFilterAndRender=Cn;window.toggleSuggestions=yn;window.openGoalsMenu=wn;window.acceptSuggestion=kn;window.dismissSuggestion=$n;window.triggerConsolidate=_n;window.reanalyzeGoals=Sn;async function fe(e,t){if(!t){E("#goals");return}const n=await u("GET",`/api/goals/${t}`);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Goal not found</p></div>';return}const a=n.data,o=a.steps||[],s=o.filter(y=>y.is_completed),i=o.filter(y=>!y.is_completed),r=s.length,c=o.length,p=c>0?Math.round(r/c*100):0,g=Math.round((a.confidence||0)*100),l=(a.evidence_content_ids||[]).length,f=a.children||[],b=f.length>0,x=!!a.parent_goal_id,v=`hsl(${getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()})`;e.innerHTML=`
    <div class="slide-in-right">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('${x?"#goal-detail/"+a.parent_goal_id:"#goals"}')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="${x?"Back to parent goal":"Back to goals"}">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${x?"Sub-goal":"Goal"}</h1>
      </div>

      <!-- Progress Card -->
      <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
        <div class="flex items-center gap-4 mb-4">
          <div class="relative flex-shrink-0">
            ${it(p,64,5,v)}
            <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-heading">${p}%</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-bold text-heading leading-snug">${d(a.title)}</h2>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              ${D(a.category,"emerald")}
              ${D(a.status,a.status==="active"?"indigo":a.status==="completed"?"green":"gray")}
              ${b?'<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Parent</span>':""}
              ${x?'<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Sub-goal</span>':""}
            </div>
          </div>
        </div>
        <p class="text-body text-sm leading-relaxed">${d(a.description)}</p>
        <div class="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">trending_up</span>${g}% match</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">link</span>${l} from your content</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">checklist</span>${r}/${c} steps</span>
        </div>
      </section>

      <!-- Sub-goals (horizontal scroll) -->
      ${b?`
      <section class="mb-4" aria-label="Sub-goals">
        <h3 class="text-sm font-semibold text-heading mb-3 flex items-center gap-1.5">
          <span class="material-icons-round text-base text-purple-400">account_tree</span> Sub-goals
        </h3>
        <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          ${f.map(y=>{const be=Math.round((y.confidence||0)*100),M=y.status||"active",oe=M==="completed"?"check_circle":M==="dismissed"?"do_not_disturb_on":"flag",ae=M==="completed"?"text-success":M==="dismissed"?"text-muted-foreground":"text-accent";return`
            <article onclick="navigate('#goal-detail/${y.id}')" class="flex-shrink-0 w-44 bg-card rounded-xl p-3.5 shadow-sm border border-border hover:shadow-elevated transition-all cursor-pointer active:scale-[0.97]">
              <div class="flex items-center gap-2 mb-2">
                <span class="material-icons-round text-lg ${ae}">${oe}</span>
                <span class="text-[10px] text-muted-foreground">${be}%</span>
              </div>
              <h4 class="font-semibold text-heading text-xs leading-snug line-clamp-2">${d(y.title)}</h4>
            </article>`}).join("")}
        </div>
      </section>`:""}

      <!-- Steps -->
      <section class="mb-4" aria-label="Goal steps">
        <h3 class="text-sm font-semibold text-heading mb-3">Steps</h3>
        ${c===0?'<p class="text-muted-foreground text-sm text-center py-4">No steps yet</p>':`
          <div class="space-y-2" id="goal-steps-list">
            ${i.map(y=>qe(y,t)).join("")}
            ${r>0?`
              <button onclick="toggleCompletedSteps('${t}')" class="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground font-medium hover:text-heading transition-colors">
                <span class="material-icons-round text-sm">${ue?"expand_less":"expand_more"}</span>
                ${r} completed step${r!==1?"s":""}
              </button>
              ${ue?s.map(y=>qe(y,t)).join(""):""}
            `:""}
          </div>`}
      </section>

      ${a.ai_reasoning?`
        <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Reasoning</h3>
          </div>
          <p class="text-muted-foreground text-sm leading-relaxed">${d(a.ai_reasoning)}</p>
        </section>`:""}

      <!-- Actions -->
      <div class="space-y-2">
        ${a.status==="active"?`
          <button onclick="updateGoalStatus('${a.id}','completed')" class="w-full flex items-center justify-center gap-2 bg-success/10 hover:bg-success/20 text-success font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">check_circle</span> Mark Complete
          </button>
          <button onclick="updateGoalStatus('${a.id}','dismissed')" class="w-full flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border text-muted-foreground font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">do_not_disturb_on</span> Dismiss Goal
          </button>`:`
          <button onclick="updateGoalStatus('${a.id}','active')" class="w-full flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">
            <span class="material-icons-round text-lg">flag</span> Reactivate
          </button>`}
        <button onclick="deleteGoal('${a.id}')" class="w-full flex items-center justify-center gap-2 bg-card hover:bg-danger/10 border border-border text-danger font-medium py-3 rounded-xl transition-colors active:scale-[0.97]">
          <span class="material-icons-round text-lg">delete</span> Delete Goal
        </button>
      </div>
    </div>`}function qe(e,t){const n=(e.source_content_ids||[]).length;return`
    <div class="bg-card rounded-xl p-3.5 flex items-start gap-3 transition-all duration-200 shadow-sm ${e.is_completed?"opacity-60":""}">
      <button onclick="event.stopPropagation();toggleGoalStep('${t}','${e.id}',${!e.is_completed})" class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 ${e.is_completed?"bg-accent border-accent check-bounce":"border-border hover:border-accent"} flex items-center justify-center transition-all" aria-label="${e.is_completed?"Mark incomplete":"Mark complete"}">
        ${e.is_completed?'<span class="material-icons-round text-sm text-white">check</span>':""}
      </button>
      <div class="flex-1 min-w-0">
        <p class="text-heading text-sm font-medium leading-snug ${e.is_completed?"line-through":""}">${d(e.title)}</p>
        ${e.description?`<p class="text-muted-foreground text-xs mt-1 leading-relaxed">${d(e.description)}</p>`:""}
        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-muted-foreground text-[10px]">Step ${e.step_index+1}</span>
          ${n>0?`<span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-[10px]">link</span>${n}</span>`:""}
          ${e.is_completed&&e.completed_at?'<span class="text-success text-[10px]">Done</span>':""}
        </div>
      </div>
    </div>`}function Tn(e){Lt(!ue),fe(document.getElementById("page"),e)}async function En(e,t,n){var o;const a=await u("PATCH",`/api/goals/${e}/steps/${t}`,{is_completed:n});a.ok?await fe(document.getElementById("page"),e):m(((o=a.data)==null?void 0:o.detail)||"Failed to update step",!0)}async function Pn(e,t){var a;const n=await u("PATCH",`/api/goals/${e}`,{status:t});n.ok?(m(`Goal ${t==="completed"?"completed":t==="dismissed"?"dismissed":"reactivated"}!`),await fe(document.getElementById("page"),e)):m(((a=n.data)==null?void 0:a.detail)||"Failed to update goal",!0)}async function Ln(e){var a;if(!await Me("Delete Goal","This will delete the goal and all its steps. Continue?","Delete",!0))return;const n=await u("DELETE",`/api/goals/${e}`);n.ok?(m("Goal deleted"),E("#goals")):m(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}window.toggleCompletedSteps=Tn;window.toggleGoalStep=En;window.updateGoalStatus=Pn;window.deleteGoal=Ln;function ct(){try{return JSON.parse(localStorage.getItem("zuno_searches")||"[]")}catch{return[]}}function An(e){const t=ct().filter(n=>n!==e);t.unshift(e),localStorage.setItem("zuno_searches",JSON.stringify(t.slice(0,5)))}async function In(e){const t=await u("GET","/api/tags/popular"),n=t.ok?Array.isArray(t.data)?t.data:[]:[],a=ct();e.innerHTML=`
    <div class="fade-in">
      <!-- Search Input -->
      <div class="flex gap-2 mb-3">
        <div class="flex-1 relative">
          <input id="search-input" type="text" placeholder="Search your content..." class="w-full bg-card border border-border rounded-md pl-11 pr-10 py-3.5 text-sm text-heading placeholder-muted-foreground/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 shadow-sm" onkeydown="if(event.key==='Enter')doSearch()" autofocus aria-label="Search input" />
          <span class="material-icons-round text-xl text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2">search</span>
          <button onclick="document.getElementById('search-input').value='';document.getElementById('search-results').innerHTML=''" class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-card-hover transition-colors" aria-label="Clear search">
            <span class="material-icons-round text-lg text-muted-foreground">close</span>
          </button>
        </div>
      </div>

      <!-- Search Type Tabs -->
      <div class="flex gap-2 mb-5" role="tablist" aria-label="Search type">
        <button onclick="setSearchType('fts')" id="st-fts" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${U==="fts"?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground border border-border shadow-sm hover:shadow-md"}">Keywords</button>
        <button onclick="setSearchType('hybrid')" id="st-hybrid" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${U==="hybrid"?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground border border-border shadow-sm hover:shadow-md"}">Smart</button>
        <button onclick="setSearchType('tag')" id="st-tag" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${U==="tag"?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground border border-border shadow-sm hover:shadow-md"}">By topic</button>
      </div>

      ${a.length>0?`
        <section class="mb-5" aria-label="Recent searches">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent</h3>
          <div class="flex flex-wrap gap-1.5">
            ${a.map(o=>`<button onclick="document.getElementById('search-input').value='${d(o)}';doSearch()" class="px-3 py-1.5 rounded-md bg-card border border-border text-xs text-body hover:border-accent transition-colors flex items-center gap-1"><span class="material-icons-round text-xs text-muted-foreground">history</span>${d(o)}</button>`).join("")}
          </div>
        </section>`:""}

      ${n.length>0?`
        <section class="mb-5" aria-label="Popular tags">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Popular topics</h3>
          <div class="flex flex-wrap gap-1.5">
            ${n.map(o=>`<button onclick="searchByTag('${d(o.slug)}')" class="px-3 py-1.5 rounded-md bg-card border border-border text-xs text-body hover:border-accent transition-colors">${d(o.name)} <span class="text-muted-foreground">${o.count||o.usage_count||""}</span></button>`).join("")}
          </div>
        </section>`:""}

      <div id="search-results" aria-live="polite"></div>
    </div>`}function ut(e){At(e),document.querySelectorAll(".search-type").forEach(t=>{const n=t.id==="st-"+e;t.className=`search-type px-4 py-2 rounded-md text-xs font-semibold border border-border transition-all duration-200 ${n?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground shadow-sm hover:shadow-md"}`})}async function mt(){var o;const e=document.getElementById("search-input").value.trim();if(!e)return;An(e);const t=document.getElementById("search-results");t.innerHTML=J(2);let n;U==="hybrid"?n=await u("GET","/api/search/hybrid",null,{q:e,limit:20}):U==="tag"?n=await u("GET",`/api/search/tag/${encodeURIComponent(e)}`,null,{limit:20}):n=await u("GET","/api/search",null,{q:e,limit:20});const a=n.ok?Array.isArray(n.data)?n.data:[]:[];if(!n.ok){t.innerHTML=`<div class="bg-danger/10 rounded-md p-4 text-center"><p class="text-danger text-sm">${d(((o=n.data)==null?void 0:o.detail)||"Search failed")}</p></div>`;return}t.innerHTML=a.length===0?'<div class="text-center py-12"><span class="material-icons-round text-4xl text-muted-foreground/60 mb-2">search_off</span><p class="text-muted-foreground text-sm">No results found</p></div>':`<p class="text-muted-foreground text-xs mb-3">${a.length} result${a.length!==1?"s":""}</p>
       <div class="space-y-3">${a.map(s=>te(s,{roundedMinimal:!0})).join("")}</div>`}function Mn(e){ut("tag"),document.getElementById("search-input").value=e,mt()}window.setSearchType=ut;window.doSearch=mt;window.searchByTag=Mn;async function pt(e){const t=await u("GET","/api/knowledge/stats"),n=t.ok?t.data:null;e.innerHTML=`
    <div class="fade-in flex flex-col min-h-0 flex-1 pb-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 class="text-xl font-bold text-heading">Knowledge Q&A</h1>
          ${n?`<p class="text-muted-foreground text-xs mt-0.5">${n.total_chunks||n.chunks||0} items in your knowledge base</p>`:""}
        </div>
        <button onclick="openKnowledgeSettings()" class="p-2 rounded-md hover:bg-surface-hover transition-colors" aria-label="Knowledge settings">
          <span class="material-icons-round text-xl text-muted-foreground">settings</span>
        </button>
      </div>

      <!-- Chat Area -->
      <div id="knowledge-chat" class="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 mb-4" role="log" aria-label="Chat messages">
        ${Q.length===0?`
          <div class="flex flex-col items-center justify-center min-h-[200px] text-center px-4 py-6">
            <div class="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center mb-4">
              <span class="material-icons-round text-4xl text-primary">psychology</span>
            </div>
            <p class="text-heading font-semibold mb-1">Ask anything about your content</p>
            <p class="text-muted-foreground text-sm mb-5 opacity-90">Answers from your saved content</p>
            <div class="flex flex-wrap gap-2 justify-center">
              ${Mt.map(o=>`
                <button onclick="askSuggested(this.textContent)" class="px-3 py-2 rounded-md bg-card border border-border text-xs text-foreground hover:border-primary hover:text-primary transition-colors shadow-sm">${o}</button>
              `).join("")}
            </div>
          </div>`:Q.map($e).join("")}
      </div>

      <!-- Input (always visible above nav) -->
      <div class="flex gap-2 flex-shrink-0 pt-2">
        <input id="knowledge-input" type="text" placeholder="Ask a question..." class="flex-1 min-w-0 bg-card border border-border rounded-md px-4 py-3.5 text-sm text-heading placeholder-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm" onkeydown="if(event.key==='Enter')doAsk()" aria-label="Question input" />
        <button onclick="doAsk()" class="bg-primary text-primary-foreground px-4 rounded-md transition-colors active:scale-95 shadow-sm flex-shrink-0" aria-label="Send question">
          <span class="material-icons-round text-lg">send</span>
        </button>
      </div>
    </div>`;const a=document.getElementById("knowledge-chat");a.scrollTop=a.scrollHeight}function $e(e){return e.role==="user"?`<div class="flex justify-end"><div class="bg-accent/20 text-heading rounded-md px-4 py-3 max-w-[80%] text-sm">${d(e.text)}</div></div>`:`
    <div class="flex justify-start">
      <div class="bg-card border border-border rounded-md px-4 py-3.5 max-w-[90%] shadow-sm">
        <p class="text-body text-sm leading-relaxed whitespace-pre-wrap">${d(e.text)}</p>
        ${e.sources&&e.sources.length>0?`
          <div class="mt-3 pt-3 border-t border-border">
            <p class="text-muted-foreground text-[10px] uppercase tracking-wide font-semibold mb-2">From your content</p>
            <div class="space-y-1.5">
              ${e.sources.map(t=>`
                <div class="bg-bg rounded-md px-3 py-2.5 cursor-pointer hover:bg-card-hover transition-colors" onclick="navigate('#content-detail/${t.content_id}')">
                  <p class="text-heading text-xs font-medium line-clamp-1">${d(t.title||t.url||t.content_id)}</p>
                  ${t.chunk_text?`<p class="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">${d(Pe(t.chunk_text,100))}</p>`:""}
                </div>`).join("")}
            </div>
          </div>`:""}
      </div>
    </div>`}function Bn(e){document.getElementById("knowledge-input").value=e,ft()}async function ft(){var s,i;const e=document.getElementById("knowledge-input"),t=e.value.trim();if(!t)return;e.value="",De({role:"user",text:t});const n=document.getElementById("knowledge-chat");Q.length===1&&(n.innerHTML=""),n.innerHTML+=$e({role:"user",text:t}),n.innerHTML+='<div id="typing" class="flex justify-start"><div class="bg-card border border-border rounded-md px-5 py-4 shadow-sm"><div class="flex gap-1.5"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div></div>',n.scrollTop=n.scrollHeight;const a=await u("POST","/api/knowledge/ask",{query:t,include_sources:!0});(s=document.getElementById("typing"))==null||s.remove();const o=a.ok?{role:"assistant",text:a.data.answer,sources:a.data.sources||[]}:{role:"assistant",text:`Error: ${((i=a.data)==null?void 0:i.detail)||"Failed to get answer"}`,sources:[]};De(o),n.innerHTML+=$e(o),n.scrollTop=n.scrollHeight}function Hn(){L(`
    <h2 class="text-lg font-bold text-heading mb-4">Knowledge Settings</h2>
    <div class="space-y-2">
      <button onclick="closeModal();doReindex()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-md hover:bg-card-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-accent">refresh</span>
        <div><p class="text-heading text-sm font-medium">Refresh knowledge base</p><p class="text-muted-foreground text-xs">Re-scan your saved content so answers use the latest</p></div>
      </button>
      <button onclick="closeModal();clearKnowledgeAndRender()" class="w-full flex items-center gap-3 px-4 py-3.5 rounded-md hover:bg-card-hover transition-colors text-left">
        <span class="material-icons-round text-xl text-muted-foreground">delete_sweep</span>
        <div><p class="text-heading text-sm font-medium">Clear Chat</p><p class="text-muted-foreground text-xs">Remove conversation history</p></div>
      </button>
    </div>
  `)}async function jn(){var t;m("Updating knowledge base...");const e=await u("POST","/api/knowledge/reindex",{});e.ok?m(`Updated: ${e.data.content_processed} items in your knowledge base`):m(((t=e.data)==null?void 0:t.detail)||"Update failed",!0)}function Gn(){It(),pt(document.getElementById("page"))}window.askSuggested=Bn;window.doAsk=ft;window.openKnowledgeSettings=Hn;window.doReindex=jn;window.clearKnowledgeAndRender=Gn;async function He(e){var c;const[t,n,a]=await Promise.all([u("GET","/api/profile"),u("GET","/api/user-preferences"),u("GET","/api/admin/me")]),o=t.ok?t.data:{},s=n.ok?n.data:{},i=yt(),r=a.ok&&((c=a.data)==null?void 0:c.admin)===!0;e.innerHTML=`
    <div class="fade-in">
      <!-- Avatar Hero -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Account info">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-16 h-16 rounded-md bg-accent/15 flex items-center justify-center overflow-hidden flex-shrink-0">
            ${o.avatar_url?`<img src="${d(o.avatar_url)}" alt="Avatar" class="w-full h-full object-cover" onerror="this.style.display='none'"/>`:'<span class="material-icons-round text-3xl text-accent">person</span>'}
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">${d(o.display_name||"No name")}</h1>
            <p class="text-muted-foreground text-sm">${d(o.email||o.phone||"")}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label for="p-name" class="text-xs text-muted-foreground font-medium mb-1.5 block">Display Name</label>
            <input id="p-name" value="${d(o.display_name||"")}" class="w-full bg-bg border border-border rounded-md px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <div>
            <label for="p-avatar" class="text-xs text-muted-foreground font-medium mb-1.5 block">Avatar URL</label>
            <input id="p-avatar" value="${d(o.avatar_url||"")}" class="w-full bg-bg border border-border rounded-md px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <button onclick="doUpdateProfile()" id="profile-btn" class="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md transition-colors active:scale-[0.97] shadow-sm hover:shadow-md">Update Profile</button>
        </div>
      </section>

      <!-- Preferences -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Preferences">
        <h3 class="text-sm font-semibold text-heading mb-4">Preferences</h3>

        <div class="mb-4">
          <label class="text-xs text-muted-foreground font-medium mb-2 block">Default Feed</label>
          <div class="flex gap-2">
            <button onclick="updateFeedPref('usersaved')" class="flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${s.feed_type==="usersaved"?"bg-primary text-primary-foreground border-primary/30":"bg-card border border-border text-foreground"} active:scale-[0.97]">My Saved</button>
            <button onclick="updateFeedPref('suggestedcontent')" class="flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${s.feed_type==="suggestedcontent"?"bg-primary text-primary-foreground border-primary/30":"bg-card border border-border text-foreground"} active:scale-[0.97]">Suggested</button>
          </div>
        </div>

        <div>
          <label class="text-xs text-muted-foreground font-medium mb-2 block">Theme</label>
          <div class="flex gap-2">
            ${["light","dark","system"].map(p=>`
              <button onclick="applyTheme('${p}');renderProfile(document.getElementById('page'))" class="flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${i===p?"bg-primary text-primary-foreground border-primary/30":"bg-card border border-border text-foreground"} active:scale-[0.97]">
                <span class="material-icons-round text-base">${p==="light"?"light_mode":p==="dark"?"dark_mode":"brightness_auto"}</span>
                ${p.charAt(0).toUpperCase()+p.slice(1)}
              </button>`).join("")}
          </div>
        </div>
      </section>

      <!-- Bookmarks (feed items you bookmarked) -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Bookmarks">
        <h3 class="text-sm font-semibold text-heading mb-2">Bookmarks</h3>
        <p class="text-xs text-muted-foreground mb-3">Items you bookmarked from Feed (My Feed or Suggested).</p>
        <a href="#profile/bookmarks" onclick="navigate('#profile/bookmarks'); return false" class="block w-full text-center py-2.5 rounded-md text-sm font-medium bg-bg hover:bg-surface-hover border border-border text-heading transition-colors">
          <span class="material-icons-round text-base align-middle mr-1">bookmark</span> View Bookmarks
        </a>
      </section>

      <!-- Chrome Extension -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Chrome Extension">
        <h3 class="text-sm font-semibold text-heading mb-2">Chrome Extension</h3>
        <p class="text-xs text-muted-foreground mb-3">Connect the Share to Zuno extension to save links without opening the app.</p>
        <a href="#connect-extension" target="_blank" rel="noopener" class="block w-full text-center py-2.5 rounded-md text-sm font-medium bg-bg hover:bg-surface-hover border border-border text-heading transition-colors">
          <span class="material-icons-round text-base align-middle mr-1">extension</span> Connect Extension
        </a>
      </section>

      ${r?`
      <!-- Admin (only for allowlisted users) -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Admin">
        <button onclick="navigate('#admin')" class="w-full flex items-center justify-center gap-2 bg-bg hover:bg-surface-hover border border-border text-heading font-medium py-3 rounded-md transition-colors active:scale-[0.97]">
          <span class="material-icons-round text-xl text-muted-foreground">admin_panel_settings</span>
          Open Admin
        </button>
      </section>
      `:""}

      <!-- Sign Out -->
      <button onclick="doLogout()" class="w-full flex items-center justify-center gap-2 bg-danger/10 hover:bg-danger/20 text-danger font-semibold py-3.5 rounded-md transition-colors active:scale-[0.97]">
        <span class="material-icons-round text-lg">logout</span> Sign Out
      </button>
    </div>`}async function Rn(){var a;const e=document.getElementById("profile-btn");e.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',e.disabled=!0;const t={display_name:document.getElementById("p-name").value.trim()||null,avatar_url:document.getElementById("p-avatar").value.trim()||null},n=await u("PATCH","/api/profile",t);n.ok?(Te(null),m("Profile updated!")):m(((a=n.data)==null?void 0:a.detail)||"Failed to update",!0),e.textContent="Update Profile",e.disabled=!1}async function On(e){await u("PATCH","/api/user-preferences",{feed_type:e}),m("Feed preference updated!"),await He(document.getElementById("page"))}window.renderProfile=He;window.doUpdateProfile=Rn;window.updateFeedPref=On;async function gt(e){var n;const t=await u("GET","/api/admin/me");if(!t.ok||!((n=t.data)!=null&&n.admin)){E("#profile");return}e.innerHTML=`
    <div class="fade-in">
      <div class="flex items-center gap-3 mb-5">
        <button onclick="navigate('#profile')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to profile">
          <span class="material-icons-round text-heading">arrow_back</span>
        </button>
        <h1 class="text-xl font-bold text-heading">Admin</h1>
      </div>

      <section class="bg-card rounded-2xl shadow-sm border border-border mb-4 overflow-hidden" aria-label="Developer tools">
        <div class="p-5 space-y-4">
          <!-- Cache -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Cache</h4>
            <div class="flex gap-2">
              <input id="admin-cache-pattern" placeholder="Pattern (optional)" class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoBustCache()" id="admin-bust-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Bust</button>
            </div>
            <button onclick="adminLoadCacheStats()" class="text-xs text-accent hover:text-accent-hover mt-2 font-medium">View Stats</button>
            <div id="admin-cache-stats-result" class="mt-2"></div>
          </div>

          <!-- Prompts -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Prompts</h4>
            <button onclick="adminDoReloadPrompts()" id="admin-prompts-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">refresh</span> Reload Prompts
            </button>
          </div>

          <!-- Embedding Test -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Generate Embedding</h4>
            <div class="flex gap-2">
              <input id="admin-embed-text" placeholder="Text to embed..." class="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" />
              <button onclick="adminDoGenerateEmbedding()" id="admin-embed-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 rounded-xl transition-colors active:scale-95">Go</button>
            </div>
            <div id="admin-embed-result" class="mt-2"></div>
          </div>

          <!-- Generate Feed -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">AI Feed</h4>
            <button onclick="adminDoGenerateFeed()" id="admin-gen-feed-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">auto_awesome</span> Generate Feed
            </button>
            <div id="admin-gen-feed-result" class="mt-2"></div>
          </div>

          <!-- Health Check -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Health</h4>
            <button onclick="adminDoHealthCheck()" id="admin-health-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">monitor_heart</span> Check Health
            </button>
            <div id="admin-health-result" class="mt-2"></div>
          </div>

          <!-- Pro waitlist -->
          <div>
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Pro waitlist</h4>
            <button onclick="adminLoadWaitlist()" id="admin-waitlist-btn" class="w-full bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
              <span class="material-icons-round text-base">list</span> Load waitlist
            </button>
            <div id="admin-waitlist-result" class="mt-2"></div>
          </div>
        </div>
      </section>
    </div>`}async function Dn(){var n;const e=await u("GET","/api/admin/cache/stats"),t=document.getElementById("admin-cache-stats-result");e.ok?t.innerHTML=`<pre class="text-xs text-muted-foreground bg-bg rounded-xl p-3 overflow-x-auto max-h-32">${d(JSON.stringify(e.data,null,2))}</pre>`:t.innerHTML=`<p class="text-danger text-xs">${d(((n=e.data)==null?void 0:n.detail)||"Failed to load stats")}</p>`}async function Fn(){var a;const e=document.getElementById("admin-bust-btn");e.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',e.disabled=!0;const t=document.getElementById("admin-cache-pattern").value.trim(),n=await u("POST","/api/admin/cache/bust",null,t?{pattern:t}:null);n.ok?m("Cache busted!"):m(((a=n.data)==null?void 0:a.detail)||"Failed",!0),e.textContent="Bust",e.disabled=!1}async function Un(){var n;const e=document.getElementById("admin-prompts-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>',e.disabled=!0;const t=await u("POST","/api/admin/prompts/reload");t.ok?m("Prompts reloaded!"):m(((n=t.data)==null?void 0:n.detail)||"Failed",!0),e.innerHTML='<span class="material-icons-round text-base">refresh</span> Reload Prompts',e.disabled=!1}async function zn(){var o,s,i;const e=document.getElementById("admin-embed-text").value.trim();if(!e){m("Enter text",!0);return}const t=document.getElementById("admin-embed-btn");t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0;const n=await u("POST","/api/ai/generate-embedding",{text:e}),a=document.getElementById("admin-embed-result");if(n.ok){const r=((o=n.data.embedding)==null?void 0:o.length)||0;a.innerHTML=`<p class="text-success text-xs">Embedding generated (${r} dimensions)</p><pre class="text-xs text-muted-foreground bg-bg rounded-lg p-2 mt-1 max-h-24 overflow-y-auto">[${(s=n.data.embedding)==null?void 0:s.slice(0,5).map(c=>c.toFixed(6)).join(", ")}... ]</pre>`}else a.innerHTML=`<p class="text-danger text-xs">${d(((i=n.data)==null?void 0:i.detail)||"Failed")}</p>`;t.textContent="Go",t.disabled=!1}async function Nn(){var a,o;const e=document.getElementById("admin-gen-feed-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Generating...',e.disabled=!0;const t=await u("POST","/api/ai/generate-feed"),n=document.getElementById("admin-gen-feed-result");if(t.ok){const s=((a=t.data.items)==null?void 0:a.length)||0;n.innerHTML=`<p class="text-success text-xs">${s} feed items generated</p>`,t.data.message&&(n.innerHTML+=`<p class="text-muted-foreground text-xs mt-1">${d(t.data.message)}</p>`)}else n.innerHTML=`<p class="text-danger text-xs">${d(((o=t.data)==null?void 0:o.detail)||"Failed")}</p>`;e.innerHTML='<span class="material-icons-round text-base">auto_awesome</span> Generate Feed',e.disabled=!1}async function qn(){const e=document.getElementById("admin-health-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>',e.disabled=!0;const t=await u("GET","/health");document.getElementById("admin-health-result").innerHTML=`<pre class="text-xs ${t.ok?"text-success":"text-danger"} bg-bg rounded-lg p-2 mt-1">${d(JSON.stringify(t.data,null,2))}</pre>`,e.innerHTML='<span class="material-icons-round text-base">monitor_heart</span> Check Health',e.disabled=!1}let _e=[];async function Wn(){var i,r,c;const e=document.getElementById("admin-waitlist-btn"),t=document.getElementById("admin-waitlist-result");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Loading...',e.disabled=!0;const n=await u("GET","/api/admin/waitlist");if(!n.ok){t.innerHTML=`<p class="text-danger text-xs">${d(((i=n.data)==null?void 0:i.detail)||"Failed to load waitlist")}</p>`,e.innerHTML='<span class="material-icons-round text-base">list</span> Load waitlist',e.disabled=!1;return}const a=((r=n.data)==null?void 0:r.items)||[];_e=a;const o=((c=n.data)==null?void 0:c.total)??a.length,s=a.map(p=>`<tr class="border-b border-border"><td class="py-2 pr-3 text-sm text-heading">${d(p.email)}</td><td class="py-2 pr-3 text-xs text-muted-foreground">${d(p.tier)}</td><td class="py-2 pr-3 text-xs text-muted-foreground">${d(p.discount_code||"—")}</td><td class="py-2 text-xs text-muted-foreground">${p.created_at?new Date(p.created_at).toLocaleDateString():"—"}</td></tr>`).join("");t.innerHTML=`
    <p class="text-success text-xs mb-2">${o} signup(s)</p>
    <div class="overflow-x-auto max-h-48 overflow-y-auto rounded-xl border border-border">
      <table class="w-full text-left text-sm">
        <thead><tr class="bg-card border-b border-border"><th class="py-2 pr-3 font-semibold text-heading">Email</th><th class="py-2 pr-3 font-semibold text-heading">Tier</th><th class="py-2 pr-3 font-semibold text-heading">Code</th><th class="py-2 font-semibold text-heading">Date</th></tr></thead>
        <tbody>${s||'<tr><td colspan="4" class="py-4 text-center text-muted-foreground text-xs">No entries</td></tr>'}</tbody>
      </table>
    </div>
    ${a.length>0?'<button type="button" onclick="adminExportWaitlistCsv()" class="mt-2 text-xs text-accent hover:text-accent-hover font-medium">Export CSV</button>':""}
  `,e.innerHTML='<span class="material-icons-round text-base">list</span> Load waitlist',e.disabled=!1}function Kn(){if(_e.length===0)return;const e=["email","tier","discount_code","created_at"],t=[e.join(",")].concat(_e.map(o=>e.map(s=>`"${String(o[s]||"").replace(/"/g,'""')}"`).join(","))).join(`
`),n=new Blob([t],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(n),a.download=`zuno-waitlist-${new Date().toISOString().slice(0,10)}.csv`,a.click(),URL.revokeObjectURL(a.href)}window.renderAdmin=gt;window.adminLoadCacheStats=Dn;window.adminDoBustCache=Fn;window.adminDoReloadPrompts=Un;window.adminDoGenerateEmbedding=zn;window.adminDoGenerateFeed=Nn;window.adminDoHealthCheck=qn;window.adminLoadWaitlist=Wn;window.adminExportWaitlistCsv=Kn;const ie=["content-detail","collection","goal-detail"];let S=0;function Vn(e){return le?ie.includes(e)&&!ie.includes(le)?"slide-in-right":ie.includes(le)&&!ie.includes(e)?"slide-in-left":"fade-in":"fade-in"}function Zn(e){const t=e();return t&&typeof t.then=="function"?t:Promise.resolve()}async function k(){var g;const e=++S,t=localStorage.getItem("zuno_token");let{page:n,id:a}=$t();if(!n){C(t?"#home":"#auth"),queueMicrotask(()=>k());return}if(n==="collection"&&!a){C("#collections"),queueMicrotask(()=>k());return}if(!t&&n!=="auth"&&n!=="connect-extension"){C("#auth"),queueMicrotask(()=>k());return}if(t&&n==="auth"){C("#home"),queueMicrotask(()=>k());return}const o=document.getElementById("page");if(!o)return;if(n==="connect-extension"){try{window.ZUNO_API_BASE=X()}catch{window.ZUNO_API_BASE=((g=window.location)==null?void 0:g.origin)||""}o.innerHTML=`<div class="flex flex-col items-center justify-center py-16 text-center fade-in">
      <p class="text-heading font-semibold mb-2">Connecting extension…</p>
      <p class="text-muted-foreground text-sm">Make sure you're logged in. If nothing happens, ensure the Share to Zuno extension is installed.</p>
    </div>`,document.getElementById("topnav").classList.add("hidden"),document.getElementById("bottomnav").classList.add("hidden");return}if(n==="feed"){C("#home"),queueMicrotask(()=>k());return}if(n==="library"){const l=a==="collections"?"collections":a==="bookmarks"?"bookmarks":"saved";C(l==="collections"?"#collections":l==="bookmarks"?"#profile/bookmarks":"#home"),queueMicrotask(()=>k());return}if(n==="content"){C("#home"),queueMicrotask(()=>k());return}if(n==="home"&&a==="collections"){C("#collections"),queueMicrotask(()=>k());return}if(n==="home"&&a==="bookmarks"){C("#profile/bookmarks"),queueMicrotask(()=>k());return}const s=n==="auth";document.getElementById("topnav").classList.toggle("hidden",s),document.getElementById("topnav").classList.toggle("flex",!s),document.getElementById("bottomnav").classList.toggle("hidden",s);const i=document.getElementById("nav-feed");i&&i.classList.toggle("hidden",!0);const r={home:"home",feed:"feed",collections:"home","content-detail":"home",collection:"home",goals:"goals","goal-detail":"goals",knowledge:"knowledge",profile:"profile",admin:"profile"};document.querySelectorAll(".nav-btn").forEach(l=>{const f=l.dataset.tab===r[n];l.setAttribute("aria-current",f?"page":"false")});const c=Vn(n);Bt(n),typeof window.showProgress=="function"&&window.showProgress();const p={home:J(3),feed:J(3),collections:J(3),goals:J(3),"content-detail":he(),"goal-detail":he(),collection:he(),admin:Fe()};try{await Zn(async()=>{if(e===S){o.innerHTML=`<div class="${c}">${p[n]||Fe()}</div>`;try{switch(n){case"auth":st(o);break;case"home":if(a==="saved"?await dt(o,"saved"):await Nt(o),e!==S)return;try{const l=sessionStorage.getItem("zuno_pending_share");l&&(sessionStorage.removeItem("zuno_pending_share"),typeof openSaveContentModal=="function"&&openSaveContentModal(l))}catch{}break;case"feed":Xe();break;case"collections":if(await Vt(o),e!==S)return;try{const l=sessionStorage.getItem("zuno_pending_share");l&&(sessionStorage.removeItem("zuno_pending_share"),typeof openSaveContentModal=="function"&&openSaveContentModal(l))}catch{}break;case"content-detail":if(await j(o,a),e!==S)return;break;case"collection":if(await Be(o,a),e!==S)return;break;case"goals":if(await ne(o),e!==S)return;break;case"goal-detail":if(await fe(o,a),e!==S)return;break;case"search":if(await In(o),e!==S)return;break;case"knowledge":if(await pt(o),e!==S)return;break;case"profile":if(a==="bookmarks"?await Ie(o,{standalone:!0,backHash:"#profile",backLabel:"Profile"}):await He(o),e!==S)return;break;case"admin":if(await gt(o),e!==S)return;break;default:C("#home"),queueMicrotask(()=>k());return}}catch(l){if(e!==S)return;const f=typeof(l==null?void 0:l.message)=="string"?l.message:"Something went wrong";o.innerHTML=`<div class="flex flex-col items-center justify-center py-16 text-center fade-in" role="alert" aria-live="assertive">
          <span class="material-icons-round text-5xl text-danger/40 mb-3">error_outline</span>
          <p class="text-heading font-semibold mb-1">Something went wrong</p>
          <p class="text-muted-foreground text-sm mb-4">${d(f)}</p>
          <button type="button" onclick="router()" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Try again</button>
        </div>`}}})}finally{typeof window.hideProgress=="function"&&window.hideProgress()}}window.router=k;/*! Capacitor: https://capacitorjs.com/ - MIT License */var W;(function(e){e.Unimplemented="UNIMPLEMENTED",e.Unavailable="UNAVAILABLE"})(W||(W={}));class ve extends Error{constructor(t,n,a){super(t),this.message=t,this.code=n,this.data=a}}const Jn=e=>{var t,n;return e!=null&&e.androidBridge?"android":!((n=(t=e==null?void 0:e.webkit)===null||t===void 0?void 0:t.messageHandlers)===null||n===void 0)&&n.bridge?"ios":"web"},Yn=e=>{const t=e.CapacitorCustomPlatform||null,n=e.Capacitor||{},a=n.Plugins=n.Plugins||{},o=()=>t!==null?t.name:Jn(e),s=()=>o()!=="web",i=l=>{const f=p.get(l);return!!(f!=null&&f.platforms.has(o())||r(l))},r=l=>{var f;return(f=n.PluginHeaders)===null||f===void 0?void 0:f.find(b=>b.name===l)},c=l=>e.console.error(l),p=new Map,g=(l,f={})=>{const b=p.get(l);if(b)return console.warn(`Capacitor plugin "${l}" already registered. Cannot register plugins twice.`),b.proxy;const x=o(),_=r(l);let v;const y=async()=>(!v&&x in f?v=typeof f[x]=="function"?v=await f[x]():v=f[x]:t!==null&&!v&&"web"in f&&(v=typeof f.web=="function"?v=await f.web():v=f.web),v),be=(w,$)=>{var P,B;if(_){const H=_==null?void 0:_.methods.find(T=>$===T.name);if(H)return H.rtype==="promise"?T=>n.nativePromise(l,$.toString(),T):(T,se)=>n.nativeCallback(l,$.toString(),T,se);if(w)return(P=w[$])===null||P===void 0?void 0:P.bind(w)}else{if(w)return(B=w[$])===null||B===void 0?void 0:B.bind(w);throw new ve(`"${l}" plugin is not implemented on ${x}`,W.Unimplemented)}},M=w=>{let $;const P=(...B)=>{const H=y().then(T=>{const se=be(T,w);if(se){const re=se(...B);return $=re==null?void 0:re.remove,re}else throw new ve(`"${l}.${w}()" is not implemented on ${x}`,W.Unimplemented)});return w==="addListener"&&(H.remove=async()=>$()),H};return P.toString=()=>`${w.toString()}() { [capacitor code] }`,Object.defineProperty(P,"name",{value:w,writable:!1,configurable:!1}),P},oe=M("addListener"),ae=M("removeListener"),ht=(w,$)=>{const P=oe({eventName:w},$),B=async()=>{const T=await P;ae({eventName:w,callbackId:T},$)},H=new Promise(T=>P.then(()=>T({remove:B})));return H.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await B()},H},xe=new Proxy({},{get(w,$){switch($){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return _?ht:oe;case"removeListener":return ae;default:return M($)}}});return a[l]=xe,p.set(l,{name:l,proxy:xe,platforms:new Set([...Object.keys(f),..._?[x]:[]])}),xe};return n.convertFileSrc||(n.convertFileSrc=l=>l),n.getPlatform=o,n.handleError=c,n.isNativePlatform=s,n.isPluginAvailable=i,n.registerPlugin=g,n.Exception=ve,n.DEBUG=!!n.DEBUG,n.isLoggingEnabled=!!n.isLoggingEnabled,n},Qn=e=>e.Capacitor=Yn(e),Se=Qn(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),ge=Se.registerPlugin;class je{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(t,n){let a=!1;this.listeners[t]||(this.listeners[t]=[],a=!0),this.listeners[t].push(n);const s=this.windowListeners[t];s&&!s.registered&&this.addWindowListener(s),a&&this.sendRetainedArgumentsForEvent(t);const i=async()=>this.removeListener(t,n);return Promise.resolve({remove:i})}async removeAllListeners(){this.listeners={};for(const t in this.windowListeners)this.removeWindowListener(this.windowListeners[t]);this.windowListeners={}}notifyListeners(t,n,a){const o=this.listeners[t];if(!o){if(a){let s=this.retainedEventArguments[t];s||(s=[]),s.push(n),this.retainedEventArguments[t]=s}return}o.forEach(s=>s(n))}hasListeners(t){var n;return!!(!((n=this.listeners[t])===null||n===void 0)&&n.length)}registerWindowListener(t,n){this.windowListeners[n]={registered:!1,windowEventName:t,pluginEventName:n,handler:a=>{this.notifyListeners(n,a)}}}unimplemented(t="not implemented"){return new Se.Exception(t,W.Unimplemented)}unavailable(t="not available"){return new Se.Exception(t,W.Unavailable)}async removeListener(t,n){const a=this.listeners[t];if(!a)return;const o=a.indexOf(n);this.listeners[t].splice(o,1),this.listeners[t].length||this.removeWindowListener(this.windowListeners[t])}addWindowListener(t){window.addEventListener(t.windowEventName,t.handler),t.registered=!0}removeWindowListener(t){t&&(window.removeEventListener(t.windowEventName,t.handler),t.registered=!1)}sendRetainedArgumentsForEvent(t){const n=this.retainedEventArguments[t];n&&(delete this.retainedEventArguments[t],n.forEach(a=>{this.notifyListeners(t,a)}))}}const We=e=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),Ke=e=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class Xn extends je{async getCookies(){const t=document.cookie,n={};return t.split(";").forEach(a=>{if(a.length<=0)return;let[o,s]=a.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");o=Ke(o).trim(),s=Ke(s).trim(),n[o]=s}),n}async setCookie(t){try{const n=We(t.key),a=We(t.value),o=`; expires=${(t.expires||"").replace("expires=","")}`,s=(t.path||"/").replace("path=",""),i=t.url!=null&&t.url.length>0?`domain=${t.url}`:"";document.cookie=`${n}=${a||""}${o}; path=${s}; ${i};`}catch(n){return Promise.reject(n)}}async deleteCookie(t){try{document.cookie=`${t.key}=; Max-Age=0`}catch(n){return Promise.reject(n)}}async clearCookies(){try{const t=document.cookie.split(";")||[];for(const n of t)document.cookie=n.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(t){return Promise.reject(t)}}async clearAllCookies(){try{await this.clearCookies()}catch(t){return Promise.reject(t)}}}ge("CapacitorCookies",{web:()=>new Xn});const eo=async e=>new Promise((t,n)=>{const a=new FileReader;a.onload=()=>{const o=a.result;t(o.indexOf(",")>=0?o.split(",")[1]:o)},a.onerror=o=>n(o),a.readAsDataURL(e)}),to=(e={})=>{const t=Object.keys(e);return Object.keys(e).map(o=>o.toLocaleLowerCase()).reduce((o,s,i)=>(o[s]=e[t[i]],o),{})},no=(e,t=!0)=>e?Object.entries(e).reduce((a,o)=>{const[s,i]=o;let r,c;return Array.isArray(i)?(c="",i.forEach(p=>{r=t?encodeURIComponent(p):p,c+=`${s}=${r}&`}),c.slice(0,-1)):(r=t?encodeURIComponent(i):i,c=`${s}=${r}`),`${a}&${c}`},"").substr(1):null,oo=(e,t={})=>{const n=Object.assign({method:e.method||"GET",headers:e.headers},t),o=to(e.headers)["content-type"]||"";if(typeof e.data=="string")n.body=e.data;else if(o.includes("application/x-www-form-urlencoded")){const s=new URLSearchParams;for(const[i,r]of Object.entries(e.data||{}))s.set(i,r);n.body=s.toString()}else if(o.includes("multipart/form-data")||e.data instanceof FormData){const s=new FormData;if(e.data instanceof FormData)e.data.forEach((r,c)=>{s.append(c,r)});else for(const r of Object.keys(e.data))s.append(r,e.data[r]);n.body=s;const i=new Headers(n.headers);i.delete("content-type"),n.headers=i}else(o.includes("application/json")||typeof e.data=="object")&&(n.body=JSON.stringify(e.data));return n};class ao extends je{async request(t){const n=oo(t,t.webFetchExtra),a=no(t.params,t.shouldEncodeUrlParams),o=a?`${t.url}?${a}`:t.url,s=await fetch(o,n),i=s.headers.get("content-type")||"";let{responseType:r="text"}=s.ok?t:{};i.includes("application/json")&&(r="json");let c,p;switch(r){case"arraybuffer":case"blob":p=await s.blob(),c=await eo(p);break;case"json":c=await s.json();break;case"document":case"text":default:c=await s.text()}const g={};return s.headers.forEach((l,f)=>{g[f]=l}),{data:c,headers:g,status:s.status,url:s.url}}async get(t){return this.request(Object.assign(Object.assign({},t),{method:"GET"}))}async post(t){return this.request(Object.assign(Object.assign({},t),{method:"POST"}))}async put(t){return this.request(Object.assign(Object.assign({},t),{method:"PUT"}))}async patch(t){return this.request(Object.assign(Object.assign({},t),{method:"PATCH"}))}async delete(t){return this.request(Object.assign(Object.assign({},t),{method:"DELETE"}))}}ge("CapacitorHttp",{web:()=>new ao});var Ve;(function(e){e.Dark="DARK",e.Light="LIGHT",e.Default="DEFAULT"})(Ve||(Ve={}));var Ze;(function(e){e.StatusBar="StatusBar",e.NavigationBar="NavigationBar"})(Ze||(Ze={}));class so extends je{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}ge("SystemBars",{web:()=>new so});const ro=ge("App",{web:()=>ee(()=>import("./web-BaTKrXaK.js"),[]).then(e=>new e.AppWeb)}),io=80,lo=200;let h=null,z=!1,N=0,Y=null,G=null,bt=0;function co(){return h||(h=document.createElement("div"),h.id="global-loading-overlay",h.setAttribute("role","progressbar"),h.setAttribute("aria-label","Loading"),h.setAttribute("aria-hidden","true"),h.className="global-loading-overlay hidden",h.innerHTML='<div class="global-loading-spinner"></div>',document.body.appendChild(h),h)}function uo(){!h||z||(G&&(clearTimeout(G),G=null),h.classList.remove("hidden"),h.setAttribute("aria-hidden","false"),z=!0,bt=Date.now())}function mo(){if(!h)return;const e=Date.now()-bt,t=Math.max(0,lo-e);t>0&&z?G=setTimeout(()=>{G=null,h.classList.add("hidden"),h.setAttribute("aria-hidden","true"),z=!1},t):(h.classList.add("hidden"),h.setAttribute("aria-hidden","true"),z=!1)}function po(){N++,co(),N===1&&(G&&(clearTimeout(G),G=null),Y=setTimeout(()=>{Y=null,N>0&&uo()},io))}function fo(){N>0&&N--,N===0&&(Y&&(clearTimeout(Y),Y=null),z&&mo())}window.showProgress=po;window.hideProgress=fo;function go(){const e=document.createElement("header");e.id="topnav",e.setAttribute("role","banner"),e.className="hidden sticky top-0 z-30 bg-transparent px-5 py-3 flex items-center justify-between safe-top mt-4";const t=typeof import.meta<"u"&&"/app/"||"/app/";return e.innerHTML=`
    <a href="#home" class="flex items-center gap-2 text-neutral-900 dark:text-white no-underline hover:opacity-90 transition-opacity relative" aria-label="Zuno home">
      <span class="relative w-8 h-8 shrink-0 block">
        <img src="${t}logo.svg" alt="" class="w-8 h-8 absolute inset-0 opacity-100 dark:opacity-0 dark:pointer-events-none" width="32" height="32" />
        <img src="${t}logo-dark.svg" alt="" class="w-8 h-8 absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none dark:pointer-events-auto" width="32" height="32" />
      </span>
      <span class="text-lg font-bold tracking-tight">Zuno</span>
    </a>
    <div class="flex items-center gap-2">
      <button onclick="navigate('#search')" class="topnav-btn p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100/80 dark:hover:bg-white/10 transition-all" aria-label="Search">
        <i data-lucide="search" class="nav-lucide w-5 h-5"></i>
      </button>
      <button onclick="openSaveContentModal()" class="topnav-btn flex items-center gap-1.5 px-3 py-2 rounded-md bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-white/20 transition-all" aria-label="Add content">
        <i data-lucide="plus" class="nav-lucide w-5 h-5"></i>
        <span class="text-sm font-medium">Add</span>
      </button>
      <button onclick="navigate('#profile')" class="topnav-btn header-profile-btn w-9 h-9 rounded-md overflow-hidden flex items-center justify-center bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600 transition-all shrink-0" aria-label="Profile">
        <span id="header-profile-avatar" class="hidden w-full h-full bg-cover bg-center"></span>
        <i data-lucide="circle-user" class="nav-lucide w-6 h-6 header-profile-icon"></i>
      </button>
    </div>
  `,e}function bo(e){const t=document.getElementById("app-header-root");if(!t)return null;const n=go();return t.appendChild(n),n}function xo(){const e=document.createElement("nav");return e.id="bottomnav",e.setAttribute("role","navigation"),e.setAttribute("aria-label","Main navigation"),e.className="hidden fixed bottom-0 left-0 right-0 border-t border-border px-6 py-4 z-30 safe-bottom",e.innerHTML=`
    <div class="flex justify-around items-center max-w-2xl mx-auto">
      <button onclick="navigate('#home')" data-tab="home" class="nav-btn flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Home">
        <i data-lucide="home" class="nav-lucide w-6 h-6"></i>
        <span class="text-[10px] font-medium">Home</span>
      </button>
      <button onclick="navigate('#knowledge')" data-tab="knowledge" class="nav-btn flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Ask AI">
        <span class="material-icons-round text-2xl text-muted">auto_awesome</span>
        <span class="text-[10px] font-medium">Ask</span>
      </button>
      <button onclick="navigate('#goals')" data-tab="goals" class="nav-btn flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Goals">
        <i data-lucide="target" class="nav-lucide w-6 h-6"></i>
        <span class="text-[10px] font-medium">Goals</span>
      </button>
      <button id="nav-feed" onclick="navigate('#feed')" data-tab="feed" class="nav-btn hidden flex flex-col items-center gap-1 min-w-[56px] p-2 rounded-md transition-all text-muted hover:text-heading" aria-label="Feed">
        <i data-lucide="rss" class="nav-lucide w-6 h-6"></i>
        <span class="text-[10px] font-medium">Feed</span>
      </button>
    </div>
  `,e}function ho(e){const t=document.getElementById("bottom-nav-root");if(!t)return null;const n=xo();return t.appendChild(n),n}const vo=/https?:\/\/[^\s)<>]+/i;async function yo(e){if(!e||!e.content)return;if(!localStorage.getItem("zuno_token")){m("Please log in to save shared content",!0);return}try{typeof showProgress=="function"&&showProgress();try{e.type==="text"?await wo(e.content):e.type==="image"&&await ko(e.content,e.mimeType||"image/jpeg")}finally{typeof hideProgress=="function"&&hideProgress()}}catch(n){console.error("[ShareHandler]",n),m("Failed to save shared content",!0),typeof hideProgress=="function"&&hideProgress()}}async function wo(e){var n,a;const t=e.match(vo);if(t){const o=t[0],s=await u("POST","/api/content",{url:o});s.ok?(m("Saved to Zuno!"),u("POST","/api/ai/process-content",{content_id:s.data.id})):m(((n=s.data)==null?void 0:n.detail)||"Failed to save link",!0)}else{const o=e.length>80?e.slice(0,77)+"...":e,s=await u("POST","/api/content/text",{title:o,source_text:e});s.ok?m("Note saved to Zuno!"):m(((a=s.data)==null?void 0:a.detail)||"Failed to save note",!0)}}async function ko(e,t){const n=atob(e),a=new Uint8Array(n.length);for(let b=0;b<n.length;b++)a[b]=n.charCodeAt(b);const o=new Blob([a],{type:t}),s=t.split("/")[1]||"jpg",i=`shared_${Date.now()}.${s}`,r=new FormData;r.append("file",o,i);const{getApiBase:c}=await ee(async()=>{const{getApiBase:b}=await Promise.resolve().then(()=>wt);return{getApiBase:b}},void 0),p=c(),g=localStorage.getItem("zuno_token"),l=await fetch(`${p}/api/v1/content/upload`,{method:"POST",headers:g?{Authorization:`Bearer ${g}`}:{},body:r}),f=await l.json().catch(()=>({}));l.ok?(m("Image saved to Zuno!"),f.id&&u("POST","/api/ai/process-content",{content_id:f.id})):m((f==null?void 0:f.detail)||"Failed to save image",!0)}window.handleSharedContent=yo;vt();K()&&ro.addListener("appUrlOpen",async e=>{e.url&&e.url.includes("access_token")&&await Le(e.url)&&k()});function xt(e){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}window.addEventListener("hashchange",k);const $o=2e3,_o=4e3;function So(){const e=typeof window.hideSplash=="function"?window.hideSplash:typeof hideSplash=="function"?hideSplash:null;if(!e)return;const t=typeof window._splashStart=="number"?Date.now()-window._splashStart:0,n=Math.max(0,$o-t);setTimeout(e,n)}xt(()=>{const e=typeof window.hideSplash=="function"?window.hideSplash:typeof hideSplash=="function"?hideSplash:null;e&&setTimeout(e,_o)});xt(async()=>{bo(),ho();const t=new URLSearchParams(window.location.search).get("share");if(t){try{sessionStorage.setItem("zuno_pending_share",t)}catch{}const n=new URL(window.location.href);n.searchParams.delete("share"),window.history.replaceState({},"",n.pathname+n.search+(n.hash||""))}try{await Le(),await k(),tt(),typeof window.lucide<"u"&&window.lucide.createIcons({nameAttr:"data-lucide"})}finally{So()}});export{je as W,ee as _,ge as r};
