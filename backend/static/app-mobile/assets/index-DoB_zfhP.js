(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();function Wt(){const e=localStorage.getItem("zuno_theme")||"system";je(e),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{(localStorage.getItem("zuno_theme")||"system")==="system"&&je("system")})}function je(e){localStorage.setItem("zuno_theme",e);const t=e==="dark"||e==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",t)}function Vt(){return localStorage.getItem("zuno_theme")||"system"}window.applyTheme=je;const _e=typeof import.meta<"u"&&"https://fbutixoxslmjumpzlrvp.supabase.co"||typeof import.meta<"u"&&!1||"",xt=typeof import.meta<"u"&&"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidXRpeG94c2xtanVtcHpscnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzAxMzgsImV4cCI6MjA4NjU0NjEzOH0.2EyQggdd7qB1rmJ9xw55FGj0UGc7Y9I5E8Bs0jyXoLE"||typeof import.meta<"u"&&!1||"";var ve,bt;const ze=typeof import.meta<"u"&&"com.zuno.app.dev"||(typeof import.meta<"u"&&typeof window<"u"&&((bt=(ve=window.Capacitor)==null?void 0:ve.isNativePlatform)!=null&&bt.call(ve))?"com.zuno.app.dev":null)||"com.zuno.app",ht=`${ze}://callback`;function Z(){return!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())}function z(){var n,a,o,s;const e=typeof window<"u"&&((n=window.location)==null?void 0:n.hostname),t=e==="localhost"||e==="127.0.0.1";if(Z()){const r=typeof import.meta<"u"&&!0,i=typeof((a=window==null?void 0:window.Capacitor)==null?void 0:a.getPlatform)=="function"&&window.Capacitor.getPlatform()==="android";if(r&&i)return"http://10.0.2.2:8000";let d=typeof import.meta<"u"&&"http://localhost:8000";return d&&d.includes("localhost")&&i&&(d=d.replace(/localhost/g,"10.0.2.2")),d||(typeof window<"u"&&window.ZUNO_API_BASE?window.ZUNO_API_BASE:e==="localhost"?"http://10.0.2.2:8000":"")}return t&&typeof window<"u"&&((o=window.location)!=null&&o.origin)?window.location.origin:typeof import.meta<"u"&&"http://localhost:8000"||typeof window<"u"&&window.ZUNO_API_BASE||typeof window<"u"&&((s=window.location)==null?void 0:s.origin)||""}function vt(){return!1}function Ne(){return Z()?ht:window.location.origin+window.location.pathname}const Kt=Object.freeze(Object.defineProperty({__proto__:null,APP_SCHEME:ze,OAUTH_CALLBACK_URL:ht,SUPABASE_ANON_KEY:xt,SUPABASE_URL:_e,getApiBase:z,getOAuthRedirectUrl:Ne,isCapacitor:Z,showFeed:vt},Symbol.toStringTag,{value:"Module"}));function yt(){var a,o,s;if(typeof window>"u"||!((a=window.Capacitor)!=null&&a.getPlatform)||window.Capacitor.getPlatform()!=="ios")return;const e=localStorage.getItem("zuno_token");if(!e)return;const t=z(),n=(s=(o=window.Capacitor)==null?void 0:o.Plugins)==null?void 0:s.ZunoAuthSync;n!=null&&n.syncToken&&n.syncToken({token:e,apiBase:t}).catch(()=>{})}function T(e){window.location.hash=e}function E(e){const t=e.startsWith("#")?e:"#"+e,n=new URL(window.location.href);n.hash=t,history.replaceState(null,"",n)}const Zt=new Set(["auth","connect-extension","home","library","feed","collections","content-detail","collection","goals","goal-detail","search","knowledge","profile","admin","about"]);function Jt(){const t=(window.location.hash||"").replace(/^#/,"").split("/"),n=(t[0]||"").trim().toLowerCase(),a=(t[1]||"").trim()||null;return{page:n&&Zt.has(n)?n:"",id:a}}window.navigate=T;const Yt="modulepreload",Xt=function(e,t){return new URL(e,t).href},ot={},ce=function(t,n,a){let o=Promise.resolve();if(n&&n.length>0){let r=function(g){return Promise.all(g.map(c=>Promise.resolve(c).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};const i=document.getElementsByTagName("link"),d=document.querySelector("meta[property=csp-nonce]"),p=(d==null?void 0:d.nonce)||(d==null?void 0:d.getAttribute("nonce"));o=r(n.map(g=>{if(g=Xt(g,a),g in ot)return;ot[g]=!0;const c=g.endsWith(".css"),f=c?'[rel="stylesheet"]':"";if(!!a)for(let v=i.length-1;v>=0;v--){const h=i[v];if(h.href===g&&(!c||h.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${g}"]${f}`))return;const b=document.createElement("link");if(b.rel=c?"stylesheet":Yt,c||(b.as="script"),b.crossOrigin="",b.href=g,p&&b.setAttribute("nonce",p),document.head.appendChild(b),c)return new Promise((v,h)=>{b.addEventListener("load",v),b.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${g}`)))})}))}function s(r){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=r,window.dispatchEvent(i),!i.defaultPrevented)throw r}return o.then(r=>{for(const i of r||[])i.status==="rejected"&&s(i.reason);return t().catch(s)})};let ae=null;function wt(e){return e.startsWith("/api/")&&!e.startsWith("/api/v1/")?"/api/v1"+e.slice(4):e}async function at(e,t,n,a){const o=localStorage.getItem("zuno_token"),s={};o&&(s.Authorization=`Bearer ${o}`);const r=wt(t);let d=`${z()}${r}`;if(a){const x=new URLSearchParams;Object.entries(a).forEach(([v,h])=>{h!==""&&h!=null&&x.append(v,h)});const b=x.toString();b&&(d+="?"+b)}const p={method:e,headers:s};n&&["POST","PATCH","PUT","DELETE"].includes(e)&&(s["Content-Type"]="application/json",p.body=JSON.stringify(n));const g=await fetch(d,p),c=await g.text();let f;try{f=JSON.parse(c)}catch{f=c}return{ok:g.ok,status:g.status,data:f}}async function m(e,t,n=null,a=null){try{let o=await at(e,t,n,a);if(o.status===401&&(!!localStorage.getItem("zuno_refresh_token")&&await Qt()&&(o=await at(e,t,n,a)),o.status===401)){const i=window.location.hash||"#";if(i!=="#auth"&&i!=="#")try{sessionStorage.setItem("zuno_intended_route",i)}catch{}localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),window.location.hash!=="#auth"&&(window.location.hash="#auth")}return o}catch(o){const s=`${z()}${wt(t)}`;return console.error("[API] Network error:",e,s,o.message,o),{ok:!1,status:0,data:{error:o.message,detail:o.message}}}}async function Qt(){return ae||(ae=(async()=>{try{const{refreshAccessToken:e}=await ce(async()=>{const{refreshAccessToken:t}=await Promise.resolve().then(()=>pn);return{refreshAccessToken:t}},void 0,import.meta.url);return await e()}catch{return!1}finally{ae=null}})(),ae)}let B=null;function qe(e){B=e}function st(e){const t=document.querySelector("#topnav .header-profile-btn"),n=document.getElementById("header-profile-avatar");!t||!n||(e?(n.style.backgroundImage=`url(${encodeURI(e)})`,n.classList.remove("hidden"),t.classList.add("has-avatar")):(n.style.backgroundImage="",n.classList.add("hidden"),t.classList.remove("has-avatar")))}async function en(e=!1){if(B&&!e)return st(B.avatar_url||null),B;const t=await m("GET","/api/profile");return t.ok&&(B=t.data),st((B==null?void 0:B.avatar_url)||null),B||{}}let Se="saved";function kt(e){Se=e}let ke="summary";function We(e){ke=e}let N="active";function tn(e){N=e}let q=!1;function nn(e){q=e}let $e=!1;function on(e){$e=e}let Y="fts";function an(e){Y=e}let le=[];function rt(e){le.push(e)}function sn(){le=[]}const rn=["What topics appear most in my saved content?","Summarize my most recent saves","What are the key takeaways from my articles?","How are my saved items connected?"];let ye=null;function ln(e){ye=e}const Ce=new Set;function Ee(e){Ce.add(e)}function M(e){Ce.delete(e)}function F(){return Ce}function dn(e){return Ce.has(e)}function se(e=3){return Array(e).fill(0).map(()=>`
    <div class="bg-card rounded-2xl p-4 border border-border shadow-sm">
      <div class="flex gap-3">
        <div class="w-20 h-20 rounded-xl skeleton-line flex-shrink-0"></div>
        <div class="flex-1 space-y-2.5 py-1">
          <div class="h-4 skeleton-line w-3/4"></div>
          <div class="h-3 skeleton-line w-full"></div>
          <div class="h-3 skeleton-line w-1/3"></div>
        </div>
      </div>
    </div>`).join("")}function Me(){return`
    <div class="space-y-4">
      <div class="h-48 rounded-2xl skeleton-line"></div>
      <div class="h-6 skeleton-line w-2/3"></div>
      <div class="h-4 skeleton-line w-full"></div>
      <div class="h-4 skeleton-line w-5/6"></div>
      <div class="flex gap-2"><div class="h-6 w-16 rounded-full skeleton-line"></div><div class="h-6 w-20 rounded-full skeleton-line"></div></div>
    </div>`}function it(){return'<div class="flex justify-center py-12"><div class="spinner"></div></div>'}function l(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function Ve(e,t=100){return e&&e.length>t?e.slice(0,t)+"...":e||""}function cn(){const e=new Date().getHours();return e<12?"Good morning":e<18?"Good afternoon":"Good evening"}function u(e,t=!1){const n=document.getElementById("toast");n.querySelector(".toast-msg").textContent=e;const a=n.querySelector(".toast-icon");a.textContent=t?"error_outline":"check_circle",a.className=`toast-icon material-icons-round text-lg ${t?"text-danger":"text-success"}`,n.classList.remove("hidden"),clearTimeout(n._t),n._t=setTimeout(()=>n.classList.add("hidden"),3e3)}window.toast=u;function V(e){if(e.ok)return;const t=e.data;let n="Something went wrong";t&&typeof t=="object"?typeof t.error=="string"?n=t.error:t.detail!=null&&(typeof t.detail=="string"?n=t.detail:Array.isArray(t.detail)&&(n=t.detail.map(a=>a.msg||a.message||JSON.stringify(a)).join("; ")||n)):typeof t=="string"&&t&&(n=t),u(n,!0)}function $t(e){e.innerHTML=`
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
    </div>`}async function un(){const e=Ne(),t=`${_e}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(e)}`;if(Z())try{const{Browser:n}=await ce(async()=>{const{Browser:a}=await import("./index-BA1j0zEe.js");return{Browser:a}},[],import.meta.url);await n.open({url:t,windowName:"_system"})}catch{window.open(t,"_system")}else window.location.href=t}async function Ke(e){let t;if(e){const i=e.indexOf("#");t=i>=0?e.substring(i+1):""}else{const i=window.location.hash;t=i?i.substring(1):""}if(t&&t.includes("error=")){const i=new URLSearchParams(t),d=i.get("error")||"unknown",p=i.get("error_description")||i.get("error_description")||d,g=`${d}: ${decodeURIComponent(String(p).replace(/\+/g," "))}`;return console.error("[OAuth]",g),u(g,!0),history.replaceState(null,"",window.location.pathname+"#auth"),!1}if(!t||!t.includes("access_token="))return!1;const n=new URLSearchParams(t),a=n.get("access_token"),o=n.get("refresh_token");if(!a)return!1;if(localStorage.setItem("zuno_token",a),o&&localStorage.setItem("zuno_refresh_token",o),Z())try{const{Browser:i}=await ce(async()=>{const{Browser:d}=await import("./index-BA1j0zEe.js");return{Browser:d}},[],import.meta.url);await i.close()}catch{}let s="#home";try{const i=sessionStorage.getItem("zuno_intended_route");i&&i.startsWith("#")&&(s=i,sessionStorage.removeItem("zuno_intended_route"))}catch{}history.replaceState(null,"",window.location.pathname+s);const r=await m("GET","/api/profile");return r.ok?(qe(r.data),yt(),u("Signed in as "+(r.data.display_name||r.data.email||"user")),!0):(localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),history.replaceState(null,"",window.location.pathname+"#auth"),V(r),!1)}async function mn(){const e=localStorage.getItem("zuno_refresh_token");if(!e)return!1;try{const t=await fetch(`${_e}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{"Content-Type":"application/json",apikey:xt},body:JSON.stringify({refresh_token:e})});if(!t.ok)return!1;const n=await t.json();return n.access_token?(localStorage.setItem("zuno_token",n.access_token),n.refresh_token&&localStorage.setItem("zuno_refresh_token",n.refresh_token),!0):!1}catch{return!1}}function _t(){localStorage.removeItem("zuno_token"),localStorage.removeItem("zuno_refresh_token"),qe(null),T("#auth"),u("Signed out")}window.doLogout=_t;window.doGoogleLogin=un;const pn=Object.freeze(Object.defineProperty({__proto__:null,doLogout:_t,handleOAuthCallback:Ke,refreshAccessToken:mn,renderAuth:$t},Symbol.toStringTag,{value:"Module"}));function W(e,t="indigo"){return e?`<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-${t}-500/15 text-${t}-600 dark:text-${t}-400">${l(e)}</span>`:""}function De(e){return{youtube:"play_circle",instagram:"camera_alt",x:"tag",reddit:"forum",tiktok:"music_note",spotify:"headphones",web:"language"}[e]||"link"}function ue(e,t={}){const n=e.content_id||e.id,a=e.title||e.url||"Untitled",o=e.description||e.ai_summary||"",s=e.image_url||e.thumbnail_url,r=e.category||e.ai_category,i=e.platform,d=t.showBookmark||!1,p=t.isBookmarked||!1,g=t.showAiStatus||!1,c=t.processingIds||null,f=e.ai_processed,x=g&&c&&c.has(n),b=t.roundedMinimal||!1,v=b?"rounded-md":"rounded-2xl",h=b?"rounded":"rounded-xl",w=g?x?`<span class="text-accent/80 text-[10px] flex items-center gap-1 shrink-0" role="status" aria-busy="true">
        <span class="progress-bar-inline flex-1 min-w-[48px] max-w-[80px]"><span class="progress-bar-inline-inner block h-full rounded"></span></span>
        <span class="material-icons-round text-xs">auto_awesome</span> Getting insights…
       </span>`:f?'<span class="text-success text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">check_circle</span>Ready</span>':'<span class="text-muted-foreground text-[10px]">In queue</span>':"";return`
    <article class="bg-card ${v} p-4 border border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.97] group"
      onclick="if(!event.target.closest('.card-action'))navigate('#content-detail/${n}')">
      <div class="flex gap-3">
        ${s?`<img src="${l(s)}" alt="" class="w-20 h-20 ${h} object-cover flex-shrink-0" onerror="this.style.display='none'" loading="lazy"/>`:`<div class="w-20 h-20 ${h} bg-surface-hover flex items-center justify-center flex-shrink-0"><span class="material-icons-round text-2xl text-muted-foreground">${De(i)}</span></div>`}
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${l(a)}</h3>
            ${d?`
              <button class="card-action flex-shrink-0 p-1 rounded-lg hover:bg-surface-hover transition-colors" onclick="toggleBookmark('${e.id}', this)" aria-label="${p?"Remove bookmark":"Add bookmark"}">
                <span class="material-icons-round text-lg ${p?"text-accent bookmark-pop":"text-muted-foreground"}">${p?"bookmark":"bookmark_border"}</span>
              </button>`:""}
          </div>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-2">${l(Ve(o,120))}</p>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            ${W(r)}
            ${i?`<span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">${De(i)}</span>${l(i)}</span>`:""}
            ${w}
          </div>
        </div>
      </div>
    </article>`}function St(e,t=48,n=4,a="var(--c-accent)"){const o=(t-n)/2,s=2*Math.PI*o,r=s-s*e/100;return`<svg width="${t}" height="${t}" viewBox="0 0 ${t} ${t}" class="transform -rotate-90">
    <circle cx="${t/2}" cy="${t/2}" r="${o}" fill="none" stroke="var(--c-border)" stroke-width="${n}"/>
    <circle cx="${t/2}" cy="${t/2}" r="${o}" fill="none" stroke="${a}" stroke-width="${n}" stroke-dasharray="${s}" stroke-dashoffset="${r}" stroke-linecap="round" class="progress-ring-circle"/>
  </svg>`}async function fn(e){await m("PATCH","/api/user-preferences",{feed_type:e}),await _()}async function gn(e,t){var a;const n=await m("POST",`/api/feed/bookmarks/${e}/toggle`);if(n.ok){const o=t.querySelector("span"),s=((a=n.data)==null?void 0:a.bookmarked)??!o.textContent.includes("border");o.textContent=s?"bookmark":"bookmark_border",o.classList.toggle("text-accent",s),o.classList.toggle("text-muted-foreground",!s),s?o.classList.add("bookmark-pop"):o.classList.remove("bookmark-pop")}}window.switchFeedType=fn;window.toggleBookmark=gn;const bn=15,lt=15,dt={blue:"from-blue-500/20 to-blue-600/5 border-blue-500/20",green:"from-green-500/20 to-green-600/5 border-green-500/20",purple:"from-purple-500/20 to-purple-600/5 border-purple-500/20",amber:"from-amber-500/20 to-amber-600/5 border-amber-500/20",rose:"from-rose-500/20 to-rose-600/5 border-rose-500/20",indigo:"from-indigo-500/20 to-indigo-600/5 border-indigo-500/20"};function xn(e){const t=dt[e.theme]||dt.blue;return`
    <article onclick="navigate('#collection/${e.id}')" class="bg-gradient-to-br ${t} border rounded-md p-3 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-24 w-[140px] flex-shrink-0 flex flex-col justify-between">
      <span class="material-icons-round text-lg text-heading/80">${l(e.icon||"folder")}</span>
      <div class="min-w-0">
        <h3 class="text-heading font-semibold text-xs leading-snug line-clamp-1">${l(e.title)}</h3>
        <p class="text-muted text-[10px] mt-0.5">${e.item_count} item${e.item_count!==1?"s":""}</p>
      </div>
    </article>`}async function hn(e){const[t,n,a]=await Promise.all([en(),m("GET","/api/collections"),m("GET","/api/content",null,{limit:lt})]);n.ok||V(n),a.ok||V(a);const o=(t==null?void 0:t.display_name)||"there",r=(n.ok?Array.isArray(n.data)?n.data:[]:[]).slice(0,bn),i=a.ok?a.data:null,p=(Array.isArray(i)?i:(i==null?void 0:i.items)??[]).slice(0,lt),g=`
    <section class="mb-4" aria-label="Welcome">
      <h1 class="text-xl font-bold text-heading">Hi, ${l(o)}!</h1>
      <p class="text-muted-foreground text-sm mt-0.5">${cn()}</p>
    </section>`,c=`
    <section class="mb-4" aria-label="Search">
      <button type="button" onclick="navigate('#search')" class="w-full flex items-center gap-3 px-4 py-3 rounded-sm bg-surface border border-border text-left hover:bg-surface-hover transition-colors active:scale-[0.99]" aria-label="Search content">
        <span class="material-icons-round text-xl text-muted-foreground shrink-0">search</span>
        <span class="text-muted-foreground text-sm">Search</span>
      </button>
    </section>`,f=r.length===0?`
    <div class="flex items-center justify-center gap-3 py-4 px-4 rounded-md bg-surface border border-border">
      <span class="material-icons-round text-2xl text-muted-foreground">folder_open</span>
      <p class="text-muted-foreground text-sm">No collections yet</p>
      <a href="#collections" onclick="navigate('#collections');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>
    </div>`:`
    <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style="scrollbar-width:thin;">
      ${r.map(xn).join("")}
      <a href="#collections" onclick="navigate('#collections');return false" class="flex-shrink-0 w-[100px] h-24 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-accent hover:bg-accent/5 transition-all text-muted text-xs font-medium" aria-label="View all collections">
        View all
      </a>
    </div>`,x=p.length===0?`
    <div class="flex items-center justify-center gap-3 py-6 px-4 rounded-md bg-surface border border-border">
      <span class="material-icons-round text-2xl text-muted-foreground">bookmark_border</span>
      <p class="text-muted-foreground text-sm">No content yet</p>
      <a href="#home/saved" onclick="navigate('#home/saved');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>
    </div>`:`
    <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1" id="home-library-list">
      ${p.map(v=>ue(v,{showAiStatus:!0,processingIds:F(),roundedMinimal:!0})).join("")}
      <a href="#home/saved" onclick="navigate('#home/saved');return false" class="block text-center py-3 text-accent text-sm font-semibold hover:underline rounded-md border border-dashed border-border hover:border-accent">View all</a>
    </div>`,b=`
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
      ${c}
      ${b}
      <section class="mb-6" aria-label="Collections">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-heading">Collections</h2>
          ${r.length>0?`<a href="#collections" onclick="navigate('#collections');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>`:""}
        </div>
        ${f}
      </section>

      <section aria-label="Library">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-bold text-heading">Library</h2>
          ${p.length>0?`<a href="#home/saved" onclick="navigate('#home/saved');return false" class="text-accent text-sm font-semibold hover:underline">View all</a>`:""}
        </div>
        ${x}
      </section>
    </div>`}function A(e){document.getElementById("modal-content").innerHTML=e,document.getElementById("modal-overlay").classList.remove("hidden")}function oe(){document.getElementById("modal-overlay").classList.add("hidden")}window.openModal=A;window.closeModal=oe;function J(e,t,n="Confirm",a=!1){return new Promise(o=>{const s=document.getElementById("confirm-overlay");document.getElementById("confirm-content").innerHTML=`
      <h3 class="text-lg font-bold text-heading mb-2">${e}</h3>
      <p class="text-muted-foreground text-sm mb-6">${t}</p>
      <div class="flex gap-3">
        <button id="confirm-cancel" class="flex-1 py-3 rounded-xl text-sm font-semibold bg-surface-hover text-heading hover:bg-border transition-colors active:scale-[0.97]">Cancel</button>
        <button id="confirm-ok" class="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors active:scale-[0.97] ${a?"bg-danger hover:bg-red-600 text-white":"bg-primary hover:bg-primary/90 text-primary-foreground"}">${n}</button>
      </div>`,s.classList.remove("hidden"),document.getElementById("confirm-cancel").onclick=()=>{s.classList.add("hidden"),o(!1)},document.getElementById("confirm-ok").onclick=()=>{s.classList.add("hidden"),o(!0)}})}let we=null,ee=!1,H=new Set,Ct=[],Et=[],K=!1,j=new Set,de=[];function Lt(){we&&(clearInterval(we),we=null)}async function vn(e){const t=window.location.hash||"#home",n=t==="#home"||t.startsWith("#home/saved");if(F().size===0||!n){Lt();return}const a=await m("GET","/api/content",null,{limit:50});if(!a.ok)return;const o=a.data,s=Array.isArray(o)?o:(o==null?void 0:o.items)??[];let r=!1;s.forEach(i=>{F().has(i.id)&&i.ai_processed&&(M(i.id),r=!0)}),r&&n&&await Te(e)}async function Tt(e,t){(t==="saved"||t==="bookmarks")&&kt(t),Se==="saved"?await Te(e):await Ze(e)}function yn(e){const t=(n,a)=>{const o=e===a;return`<button onclick="switchLibraryTab('${a}')" role="tab" aria-selected="${o}" class="flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${o?"bg-accent text-white shadow-sm":"text-muted hover:text-heading"}">${n}</button>`};return`<div class="flex bg-surface rounded-xl p-1 gap-1 mb-5 shadow-card" role="tablist" aria-label="Library view">
    ${t("Saved","saved")}
    ${t("Bookmarks","bookmarks")}
  </div>`}function wn(e,t,n){return e.length===0?`
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
        <span class="material-icons-round text-4xl text-accent/60">bookmark_border</span>
      </div>
      <p class="text-heading font-semibold mb-1">No saved content yet</p>
      <p class="text-muted text-sm mb-4">Tap the + button to save your first item</p>
    </div>`:t?`
    <div class="space-y-3" id="content-list">
      ${e.map(a=>{const o=a.id||a.content_id,s=a.title||a.url||"Untitled",r=n.has(o);return`
      <div role="checkbox" aria-selected="${r}" data-content-id="${l(o)}" onclick="toggleLibrarySavedSelection('${l(o)}')" class="bg-card rounded-md p-4 border border-border shadow-sm cursor-pointer hover:shadow-md transition-all flex gap-3 items-center ${r?"ring-2 ring-accent ring-offset-2 ring-offset-bg":""}">
        <span class="material-icons-round text-2xl text-heading/80 flex-shrink-0">${r?"check_circle":"radio_button_unchecked"}</span>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-heading text-sm leading-snug line-clamp-2">${l(s)}</p>
          <p class="text-muted-foreground text-xs truncate">${l(a.url||"")}</p>
        </div>
      </div>`}).join("")}
    </div>`:`
    <div class="space-y-3" id="content-list">
      ${e.map(a=>ue(a,{showAiStatus:!0,processingIds:F(),roundedMinimal:!0})).join("")}
    </div>`}function Pt(e,t,n){const a=t?`<div class="flex items-center justify-between gap-3 py-3 px-4 mb-4 rounded-xl bg-surface border border-border sticky top-0 z-10" id="library-saved-toolbar" role="toolbar">
        <span class="text-sm font-medium text-heading">${n.size} selected</span>
        <div class="flex gap-2">
          <button type="button" onclick="exitLibrarySavedSelectMode()" class="px-4 py-2 rounded-lg text-sm font-medium bg-surface-hover text-heading hover:bg-border transition-colors">Cancel</button>
          <button type="button" onclick="bulkDeleteContent()" class="px-4 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors">Delete</button>
        </div>
      </div>`:"";return`
    <div class="flex items-center justify-between gap-3 mb-4">
      <h1 class="text-xl font-bold text-heading">Library</h1>
      <div class="flex items-center gap-1">
        ${t?"":'<button type="button" onclick="enterLibrarySavedSelectMode()" class="px-4 py-2 rounded-xl text-sm font-medium bg-surface border border-border text-heading hover:bg-surface-hover transition-colors">Select</button>'}
        <button type="button" onclick="refreshLibrary()" id="library-refresh-btn" class="p-2 rounded-xl text-muted hover:text-heading hover:bg-surface-hover transition-colors active:scale-95" aria-label="Refresh list" title="Refresh list">
          <span class="material-icons-round text-xl">refresh</span>
        </button>
      </div>
    </div>
    ${a}
    <div id="library-saved-content">${wn(e,t,n)}</div>`}function Le(){const e=document.getElementById("page"),t=e==null?void 0:e.querySelector("#library-saved-page");t&&(t.innerHTML=Pt(de,K,j))}function kn(){K=!0,j.clear(),Le()}function It(){K=!1,j.clear(),Le()}function $n(e){K&&(j.has(e)?j.delete(e):j.add(e),Le())}async function _n(){var a;const e=Array.from(j);if(e.length===0||!await J("Delete content",`Permanently delete ${e.length} item${e.length!==1?"s":""}?`,"Delete",!0))return;const n=await m("POST","/api/content/bulk-delete",{ids:e});if(n.ok){u("Deleted"),It(),de=de.filter(s=>!e.includes(s.id||s.content_id));const o=document.getElementById("page");o&&await Te(o)}else u(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}async function Te(e){const t=await m("GET","/api/content",null,{limit:50});t.ok||V(t);const n=t.ok?t.data:null,a=Array.isArray(n)?n:(n==null?void 0:n.items)??[];a.forEach(o=>{o.ai_processed&&M(o.id)}),de=a,K=!1,j.clear(),e.innerHTML=`<div class="fade-in" id="library-saved-page">${Pt(a,K,j)}</div>`,F().size>0&&(Lt(),we=setInterval(()=>vn(e),4500))}async function Ze(e,t={}){const{standalone:n=!1,backHash:a="",backLabel:o=""}=t,s=await m("GET","/api/feed/bookmarks/items");s.ok||V(s);const r=s.ok?Array.isArray(s.data)?s.data:[]:[],i=n&&a&&o?`<a href="${a}" onclick="navigate('${a}');return false" class="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-heading mb-4">← ${l(o)}</a>`:"";e.innerHTML=`
    <div class="fade-in">
      ${i}
      <div class="flex items-center justify-between gap-3 mb-4">
        <h1 class="text-xl font-bold text-heading">${n?"Bookmarks":"Library"}</h1>
        <button type="button" onclick="refreshLibrary()" id="library-refresh-btn" class="p-2 rounded-xl text-muted hover:text-heading hover:bg-surface-hover transition-colors active:scale-95" aria-label="Refresh list" title="Refresh list">
          <span class="material-icons-round text-xl">refresh</span>
        </button>
      </div>
      ${n?"":yn("bookmarks")}

      ${r.length===0?`
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <span class="material-icons-round text-4xl text-accent/60">bookmark</span>
          </div>
          <p class="text-heading font-semibold mb-1">No bookmarks yet</p>
          <p class="text-muted text-sm mb-4">When the Feed is enabled, you can bookmark items there to see them here.</p>
          
        </div>`:`
        <div class="space-y-3" id="bookmarks-list">
          ${r.map(d=>ue(d,{showBookmark:!0,isBookmarked:!0,roundedMinimal:!0})).join("")}
        </div>`}
    </div>`}const ct={blue:"from-blue-500/20 to-blue-600/5 border-blue-500/20",green:"from-green-500/20 to-green-600/5 border-green-500/20",purple:"from-purple-500/20 to-purple-600/5 border-purple-500/20",amber:"from-amber-500/20 to-amber-600/5 border-amber-500/20",rose:"from-rose-500/20 to-rose-600/5 border-rose-500/20",indigo:"from-indigo-500/20 to-indigo-600/5 border-indigo-500/20"};function Sn(e,t,n=!1,a=new Set){return`
    ${t.length>0&&!n?`
      <div class="mb-5">
        <h2 class="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Topics</h2>
        <div class="flex flex-wrap gap-1.5">
          ${t.map(o=>`<span class="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs text-body">${l(typeof o=="string"?o:o.name||o.category||"")}</span>`).join("")}
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
      <div class="grid grid-cols-2 gap-3" id="collections-grid">
        ${e.map(o=>{const s=ct[o.theme]||ct.blue,r=a.has(o.id);return n?`
          <article role="checkbox" aria-selected="${r}" data-collection-id="${l(o.id)}" onclick="toggleCollectionSelection('${l(o.id)}')" class="bg-gradient-to-br ${s} border rounded-md p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-36 flex flex-col justify-between relative ${r?"ring-2 ring-accent ring-offset-2 ring-offset-bg":""}">
            <span class="material-icons-round absolute top-3 right-3 text-lg text-heading/80">${r?"check_circle":"radio_button_unchecked"}</span>
            <span class="material-icons-round text-2xl text-heading/80">${l(o.icon||"folder")}</span>
            <div>
              <h3 class="text-heading font-semibold text-sm leading-snug line-clamp-1">${l(o.title)}</h3>
              <p class="text-muted text-xs mt-0.5">${o.item_count} item${o.item_count!==1?"s":""}</p>
              ${o.is_shared?'<span class="text-[10px] text-accent font-medium">Shared</span>':""}
            </div>
          </article>`:`
          <article onclick="navigate('#collection/${o.id}')" class="bg-gradient-to-br ${s} border rounded-md p-4 cursor-pointer hover:scale-[1.02] transition-all duration-200 active:scale-[0.97] shadow-card h-36 flex flex-col justify-between">
            <span class="material-icons-round text-2xl text-heading/80">${l(o.icon||"folder")}</span>
            <div>
              <h3 class="text-heading font-semibold text-sm leading-snug line-clamp-1">${l(o.title)}</h3>
              <p class="text-muted text-xs mt-0.5">${o.item_count} item${o.item_count!==1?"s":""}</p>
              ${o.is_shared?'<span class="text-[10px] text-accent font-medium">Shared</span>':""}
            </div>
          </article>`}).join("")}
        ${n?"":`<button onclick="openCreateCollectionModal()" class="border-2 border-dashed border-border rounded-md h-36 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all duration-200 active:scale-[0.97]" aria-label="Create new collection">
          <span class="material-icons-round text-2xl text-muted">add</span>
          <span class="text-muted text-xs font-medium">New Collection</span>
        </button>`}
      </div>`}
  `}function At(e,t,n,a){const o=n?`<div class="flex items-center justify-between gap-3 py-3 px-4 mb-4 rounded-xl bg-surface border border-border sticky top-0 z-10" id="collections-toolbar" role="toolbar">
        <span class="text-sm font-medium text-heading">${a.size} selected</span>
        <div class="flex gap-2">
          <button type="button" onclick="exitCollectionsSelectMode()" class="px-4 py-2 rounded-lg text-sm font-medium bg-surface-hover text-heading hover:bg-border transition-colors">Cancel</button>
          <button type="button" onclick="bulkDeleteCollections()" class="px-4 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors">Delete</button>
        </div>
      </div>`:"";return`
    <div class="flex items-center justify-between gap-3 mb-4">
      <h1 class="text-xl font-bold text-heading">Collections</h1>
      ${n?"":'<button type="button" onclick="enterCollectionsSelectMode()" class="px-4 py-2 rounded-xl text-sm font-medium bg-surface border border-border text-heading hover:bg-surface-hover transition-colors">Select</button>'}
    </div>
    ${o}
    <div id="collections-content">${Sn(e,t,n,a)}</div>`}function Je(){const e=document.getElementById("page"),t=e==null?void 0:e.querySelector("#collections-page");t&&(t.innerHTML=At(Ct,Et,ee,H))}function Cn(){ee=!0,H.clear(),Je()}function Bt(){ee=!1,H.clear(),Je()}function En(e){ee&&(H.has(e)?H.delete(e):H.add(e),Je())}async function Ln(){var a;const e=Array.from(H);if(e.length===0||!await J("Delete collections",`Delete ${e.length} collection${e.length!==1?"s":""}? This will not delete the content inside them.`,"Delete",!0))return;const n=await m("POST","/api/collections/bulk-delete",{ids:e});if(n.ok){u("Deleted"),Bt();const o=document.getElementById("page");o&&await Mt(o)}else u(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}async function Mt(e){const[t,n]=await Promise.all([m("GET","/api/collections"),m("GET","/api/collections/categories")]);t.ok||V(t),n.ok||V(n);const a=t.ok?Array.isArray(t.data)?t.data:[]:[],o=n.ok?Array.isArray(n.data)?n.data:[]:[];Ct=a,Et=o,ee=!1,H.clear(),e.innerHTML=`<div class="fade-in" id="collections-page">${At(a,o,ee,H)}</div>`}async function Tn(){const e=document.getElementById("page");if(!e)return;const t=(window.location.hash||"").replace(/^#/,""),[n,a]=t.split("/"),o=document.getElementById("library-refresh-btn");if(o){o.disabled=!0;const s=o.querySelector(".material-icons-round");s&&s.classList.add("animate-spin")}if(n==="profile"&&a==="bookmarks"?await Ze(e,{standalone:!0,backHash:"#profile",backLabel:"Profile"}):await Tt(e,Se),o){o.disabled=!1;const s=o.querySelector(".material-icons-round");s&&s.classList.remove("animate-spin")}}function Pn(e){kt(e),T(e==="saved"?"#home":`#home/${e}`)}function Re(e=""){return`
    <h2 class="text-lg font-bold text-heading mb-4">Add content</h2>
    <div class="space-y-4">
      <div>
        <label for="m-url" class="text-xs text-muted font-medium mb-1.5 block">URL</label>
        <input id="m-url" type="url" inputmode="url" autocomplete="url" placeholder="Paste a link..." value="${l(e)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" autofocus />
        <p class="text-[11px] text-muted mt-1.5">Title, description, platform and type are auto-detected</p>
      </div>
      <button onclick="doSaveContent()" id="save-content-btn" class="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97] min-h-[44px]">Save Content</button>
    </div>
  `}function In(){return`
    <div class="flex flex-col items-center justify-center py-6 gap-4" role="status" aria-busy="true">
      <span class="material-icons-round text-3xl text-accent/80">link</span>
      <p class="text-sm font-medium text-heading">Saving link…</p>
      <div class="progress-bar-inline w-full" style="max-width: 280px;">
        <span class="progress-bar-inline-inner block h-full rounded"></span>
      </div>
    </div>
  `}function An(e=""){A(Re(e))}async function Bn(e=null){const t=(window.location.hash||"").replace("#","");if(!((t==="home"||t==="home/saved")&&Se==="saved"))return;const a=await m("GET","/api/content",null,{limit:50});if(!a.ok)return;const o=a.data,s=Array.isArray(o)?o:(o==null?void 0:o.items)??[];if(de=s,s.forEach(i=>{i.ai_processed&&M(i.id)}),K){Le();return}const r=document.getElementById("content-list");if(r){const i=F();if(r.innerHTML=s.map(d=>{const p=e&&(d.id===e||(d.content_id||d.id)===e),g=ue(d,{showAiStatus:!0,processingIds:i,roundedMinimal:!0});return p?g.replace('<article class="','<article class="new-item-highlight '):g}).join(""),e){const d=r.querySelector(".new-item-highlight");d&&setTimeout(()=>d.classList.remove("new-item-highlight"),1500)}}else{const i=document.getElementById("page");i&&await Te(i)}}async function Mn(){var a,o,s,r;const e=document.getElementById("m-url"),t=e?e.value.trim():"";if(!t){u("URL is required",!0);return}const n=document.getElementById("modal-content");n&&(n.innerHTML=In()),typeof window.showProgress=="function"&&window.showProgress();try{console.log("[SaveContent] POST",z()+"/api/v1/content","url=",t);const i=await m("POST","/api/content",{url:t});if(typeof window.hideProgress=="function"&&window.hideProgress(),i.ok){const d=(a=i.data)==null?void 0:a.id;d&&(Ee(d),m("POST","/api/ai/process-content",{content_id:d}).catch(()=>{M(d),u("AI processing failed for this item",!0)})),oe(),u("Saved"),await Bn(d)}else{n&&(n.innerHTML=Re(t));const d=i.status===0?((o=i.data)==null?void 0:o.error)||((s=i.data)==null?void 0:s.detail)||"Network error. Is the backend running?":((r=i.data)==null?void 0:r.detail)||"Couldn't save link. Check the URL and try again.";console.error("[SaveContent] Save failed:",i.status,i.data),u(d,!0)}}catch{typeof window.hideProgress=="function"&&window.hideProgress(),n&&(n.innerHTML=Re(t)),u("Couldn't save link. Check the URL and try again.",!0)}}function Hn(){A(`
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
  `)}async function jn(){var o;const e=document.getElementById("c-title").value.trim();if(!e){u("Title is required",!0);return}const t=document.getElementById("create-col-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:e,description:document.getElementById("c-desc").value.trim()||null,icon:document.getElementById("c-icon").value.trim()||"folder",theme:document.getElementById("c-theme").value},a=await m("POST","/api/collections",n);a.ok?(oe(),u("Collection created!"),T("#collection/"+a.data.id)):(u(((o=a.data)==null?void 0:o.detail)||"Failed to create",!0),t.textContent="Create Collection",t.disabled=!1)}window.refreshLibrary=Tn;window.switchLibraryTab=Pn;window.openSaveContentModal=An;window.doSaveContent=Mn;window.openCreateCollectionModal=Hn;window.doCreateCollection=jn;window.enterCollectionsSelectMode=Cn;window.exitCollectionsSelectMode=Bt;window.toggleCollectionSelection=En;window.bulkDeleteCollections=Ln;window.enterLibrarySavedSelectMode=kn;window.exitLibrarySavedSelectMode=It;window.toggleLibrarySavedSelection=$n;window.bulkDeleteContent=_n;async function O(e,t){if(!t){T("#home");return}const[n,a]=await Promise.all([m("GET",`/api/content/${t}`),m("GET",`/api/content/${t}/tags`)]);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Content not found</p></div>';return}const o=n.data;o.ai_processed&&M(o.id);const s=a.ok&&a.data.content_tags?a.data.content_tags.map(d=>d.tags||d):[],r=dn(o.id),i=d=>ke===d?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-heading";if(e.innerHTML=`
    <div class="slide-in-right">
      <!-- Sticky Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('#home')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="Back to library">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${l(o.title||"Untitled")}</h1>
        <button onclick="openContentActions('${o.id}')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors" aria-label="More actions">
          <span class="material-icons-round text-xl text-muted-foreground">more_vert</span>
        </button>
      </div>

      <!-- Hero Image -->
      ${o.thumbnail_url?`<img src="${l(o.thumbnail_url)}" alt="" class="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm" onerror="this.style.display='none'" />`:""}

      <!-- Title & URL -->
      <div class="mb-4">
        <h2 class="text-xl font-bold text-heading leading-snug">${l(o.title||"Untitled")}</h2>
        <a href="${l(o.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all mt-1 inline-block">${l(Ve(o.url,60))}</a>
      </div>

      <!-- Badges -->
      <div class="flex items-center gap-2 flex-wrap mb-5">
        ${W(o.platform,"gray")}
        ${W(o.content_type,"purple")}
        ${W(o.ai_category,"emerald")}
        ${o.ai_processed?'<span class="text-success text-xs flex items-center gap-0.5"><span class="material-icons-round text-sm">check_circle</span>AI Processed</span>':r?'<span class="text-accent/80 text-xs flex items-center gap-1.5" role="status" aria-busy="true"><span class="progress-bar-inline w-16 h-1"><span class="progress-bar-inline-inner block h-full rounded"></span></span><span class="material-icons-round text-sm">auto_awesome</span> Getting insights…</span>':'<span class="text-muted-foreground text-xs">Not AI processed</span>'}
      </div>

      <!-- Content Tabs -->
      <div class="flex bg-card rounded-xl p-1 gap-1 mb-4 shadow-sm" role="tablist">
        <button onclick="switchContentTab('summary','${o.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${i("summary")}">Summary</button>
        <button onclick="switchContentTab('tags','${o.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${i("tags")}">Tags</button>
        <button onclick="switchContentTab('info','${o.id}')" role="tab" class="flex-1 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${i("info")}">Info</button>
      </div>

      <div id="content-tab-body" class="mb-6">
        ${Dn(o,s)}
      </div>

      <!-- Primary Action -->
      ${!o.ai_processed&&!r?`
        <button onclick="processWithAI('${o.id}')" id="ai-btn" class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97] mb-3 shadow-sm min-h-[44px]">
          <span class="material-icons-round text-lg">auto_awesome</span> Get insights
        </button>`:""}

      <button onclick="openAddToCollectionModal('${o.id}')" class="w-full flex items-center justify-center gap-2 bg-surface hover:bg-surface-hover border border-border text-heading font-semibold py-3 rounded-xl transition-colors active:scale-[0.97] shadow-sm">
        <span class="material-icons-round text-lg">folder</span> Add to Collection
      </button>
    </div>`,r){window._contentDetailPoll&&clearInterval(window._contentDetailPoll);const d=o.id;window._contentDetailPoll=setInterval(async()=>{if((window.location.hash||"").indexOf("content-detail/"+d)===-1){window._contentDetailPoll&&clearInterval(window._contentDetailPoll),window._contentDetailPoll=null;return}const p=await m("GET",`/api/content/${d}`);p.ok&&p.data.ai_processed&&(window._contentDetailPoll&&clearInterval(window._contentDetailPoll),window._contentDetailPoll=null,M(d),We("summary"),await O(e,d))},4e3)}else window._contentDetailPoll&&(clearInterval(window._contentDetailPoll),window._contentDetailPoll=null)}function Dn(e,t){return ke==="summary"?e.ai_summary?`<div class="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Summary</h3>
          </div>
          <p class="text-body text-sm leading-relaxed">${l(e.ai_summary)}</p>
        </div>`:`<div class="text-center py-8"><p class="text-muted-foreground text-sm">No summary yet</p>${e.ai_processed?"":'<p class="text-muted-foreground text-xs mt-1">Get insights to generate a summary</p>'}</div>`:ke==="tags"?t.length>0?`<div class="flex flex-wrap gap-2">${t.map(n=>`<button onclick="navigate('#search');setTimeout(()=>{document.getElementById('search-input').value='${l(n.name||n.slug||"")}';setSearchType('tag');doSearch()},100)" class="px-3 py-1.5 rounded-xl bg-surface border border-border text-sm text-body hover:border-accent hover:text-accent transition-colors">${l(n.name||n.slug||"")}</button>`).join("")}</div>`:'<div class="text-center py-8"><p class="text-muted-foreground text-sm">No tags yet</p></div>':`
    <div class="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
      ${e.description?`<div><label class="text-xs text-muted-foreground font-medium block mb-1">Description</label><p class="text-body text-sm">${l(e.description)}</p></div>`:""}
      <div><label class="text-xs text-muted-foreground font-medium block mb-1">URL</label><a href="${l(e.url)}" target="_blank" rel="noopener" class="text-accent text-sm hover:underline break-all">${l(e.url)}</a></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-xs text-muted-foreground font-medium block mb-1">Platform</label><p class="text-body text-sm flex items-center gap-1"><span class="material-icons-round text-base">${De(e.platform)}</span>${l(e.platform||"Unknown")}</p></div>
        <div><label class="text-xs text-muted-foreground font-medium block mb-1">Type</label><p class="text-body text-sm">${l(e.content_type||"Unknown")}</p></div>
      </div>
      <div><label class="text-xs text-muted-foreground font-medium block mb-1">Status</label><p class="text-sm ${e.ai_processed?"text-success":"text-muted-foreground"}">${e.ai_processed?"Ready":"Not ready"}</p></div>
    </div>`}function Rn(e,t){We(e),O(document.getElementById("page"),t)}function Gn(e){A(`
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
  `)}async function On(e){var t;Ee(e),await O(document.getElementById("page"),e),typeof showProgress=="function"&&showProgress();try{const n=await m("POST","/api/ai/process-content",{content_id:e});n.ok?n.status===202?u("AI processing started — refresh the list in a moment"):(M(e),u("AI processing complete!"),We("summary"),await O(document.getElementById("page"),e)):(M(e),u(((t=n.data)==null?void 0:t.detail)||"AI processing failed",!0),await O(document.getElementById("page"),e))}catch{M(e),u("AI processing failed",!0),await O(document.getElementById("page"),e)}finally{typeof hideProgress=="function"&&hideProgress()}}async function Un(e){const t=await m("GET","/api/collections"),n=t.ok?Array.isArray(t.data)?t.data:[]:[];A(`
    <h2 class="text-lg font-bold text-heading mb-4">Add to Collection</h2>
    ${n.length===0?'<p class="text-muted-foreground text-sm">No collections yet. Create one first.</p>':`
      <div class="space-y-2">
        ${n.map(a=>`
          <button onclick="addToCollection('${a.id}','${e}')" class="w-full text-left bg-bg hover:bg-surface-hover border border-border rounded-xl px-4 py-3.5 transition-colors">
            <div class="flex items-center gap-3">
              <span class="material-icons-round text-xl text-accent">${l(a.icon||"folder")}</span>
              <div><p class="text-heading text-sm font-medium">${l(a.title)}</p><p class="text-muted-foreground text-xs">${a.item_count} items</p></div>
            </div>
          </button>`).join("")}
      </div>`}
  `)}async function Fn(e,t){var a;const n=await m("POST",`/api/collections/${e}/items`,{content_id:t});n.ok?(oe(),u("Added to collection!")):u(((a=n.data)==null?void 0:a.detail)||"Failed to add",!0)}async function zn(e){const t=await m("GET",`/api/content/${e}`);if(!t.ok)return;const n=t.data;A(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Content</h2>
    <div class="space-y-4">
      <div>
        <label for="e-title" class="text-xs text-muted-foreground font-medium mb-1.5 block">Title</label>
        <input id="e-title" value="${l(n.title||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="e-desc" class="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
        <textarea id="e-desc" rows="3" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${l(n.description||"")}</textarea>
      </div>
      <div>
        <label for="e-url" class="text-xs text-muted-foreground font-medium mb-1.5 block">URL</label>
        <input id="e-url" value="${l(n.url||"")}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <button onclick="doEditContent('${e}')" id="edit-btn" class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `)}async function Nn(e){var o;const t=document.getElementById("edit-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:document.getElementById("e-title").value.trim()||null,description:document.getElementById("e-desc").value.trim()||null,url:document.getElementById("e-url").value.trim()||null},a=await m("PATCH",`/api/content/${e}`,n);a.ok?(oe(),u("Content updated!"),await O(document.getElementById("page"),e)):(u(((o=a.data)==null?void 0:o.detail)||"Failed to update",!0),t.textContent="Save Changes",t.disabled=!1)}async function qn(e){var a;if(!await J("Delete Content","This action cannot be undone. Are you sure?","Delete",!0))return;const n=await m("DELETE",`/api/content/${e}`);n.ok?(u("Deleted!"),T("#home")):u(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}window.switchContentTab=Rn;window.openContentActions=Gn;window.processWithAI=On;window.openAddToCollectionModal=Un;window.addToCollection=Fn;window.openEditContentModal=zn;window.doEditContent=Nn;window.deleteContent=qn;let re=null,Ge=null,Ht=[],te=!1,I=new Set;function Wn(e,t,n,a){return t.length===0?'<div class="text-center py-12"><p class="text-muted-foreground text-sm">No items in this collection</p></div>':n?`
      <div class="space-y-2">
        ${t.map(o=>{const s=o.content||o,r=s.id||o.content_id,i=a.has(r);return`
          <div role="checkbox" aria-selected="${i}" data-content-id="${l(r)}" onclick="toggleCollectionDetailSelection('${l(r)}')" class="bg-card rounded-xl p-3.5 flex items-center gap-3 hover:bg-card-hover transition-colors shadow-sm cursor-pointer ${i?"ring-2 ring-accent ring-offset-2 ring-offset-bg":""}">
            <span class="material-icons-round text-xl text-heading/80 flex-shrink-0">${i?"check_circle":"radio_button_unchecked"}</span>
            <div class="flex-1 min-w-0">
              <p class="text-heading text-sm font-medium truncate">${l(s.title||s.url||"Untitled")}</p>
              <p class="text-muted-foreground text-xs truncate">${l(s.url||"")}</p>
            </div>
          </div>`}).join("")}
      </div>`:`
    <div class="space-y-2">
      ${t.map(o=>{const s=o.content||o,r=s.id||o.content_id,i=F(),p=r&&i.has(r)?'<span class="text-accent/80 text-[10px] flex items-center gap-1 shrink-0" role="status" aria-busy="true"><span class="progress-bar-inline w-12 h-1"><span class="progress-bar-inline-inner block h-full rounded"></span></span><span class="material-icons-round text-xs">auto_awesome</span> Processing…</span>':"";return`
        <div class="bg-card rounded-xl p-3.5 flex items-center gap-3 hover:bg-card-hover transition-colors shadow-sm">
          <div class="flex-1 min-w-0 cursor-pointer" onclick="navigate('#content-detail/${r}')">
            <p class="text-heading text-sm font-medium truncate">${l(s.title||s.url||"Untitled")}</p>
            <p class="text-muted-foreground text-xs truncate">${l(s.url||"")}</p>
            ${p?`<div class="mt-1.5">${p}</div>`:""}
          </div>
          <button onclick="event.stopPropagation(); removeFromCollection('${e.id}','${r}')" class="p-1.5 rounded-lg hover:bg-danger/10 transition-colors" aria-label="Remove from collection">
            <span class="material-icons-round text-base text-danger">close</span>
          </button>
        </div>`}).join("")}
    </div>`}function jt(e,t,n,a){const o=n?`<div class="flex items-center justify-between gap-3 py-3 px-4 mb-4 rounded-xl bg-surface border border-border sticky top-0 z-10" id="collection-detail-toolbar" role="toolbar">
        <span class="text-sm font-medium text-heading">${a.size} selected</span>
        <div class="flex gap-2 flex-wrap">
          <button type="button" onclick="exitCollectionDetailSelectMode()" class="px-4 py-2 rounded-lg text-sm font-medium bg-surface-hover text-heading hover:bg-border transition-colors">Cancel</button>
          <button type="button" onclick="bulkRemoveFromCollection()" class="px-4 py-2 rounded-lg text-sm font-medium bg-surface border border-border text-heading hover:bg-surface-hover transition-colors">Remove from collection</button>
          <button type="button" onclick="bulkDeleteContentInCollection()" class="px-4 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors">Delete content</button>
        </div>
      </div>`:"";return`
    <div class="flex items-center gap-3 mb-5">
      <button onclick="navigate('#collections')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="Back to collections">
        <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
      </button>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="material-icons-round text-2xl text-accent">${l(e.icon||"folder")}</span>
          <h1 class="text-lg font-bold text-heading truncate">${l(e.title)}</h1>
        </div>
        <p class="text-muted-foreground text-xs mt-0.5">${e.item_count} items ${e.is_shared?"&middot; Shared":""}</p>
      </div>
      <div class="flex gap-1">
        ${n?"":`
          <button onclick="openEditCollectionModal('${e.id}')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="Edit collection">
            <span class="material-icons-round text-lg text-muted-foreground">edit</span>
          </button>
          <button onclick="deleteCollection('${e.id}')" class="p-2 rounded-xl hover:bg-danger/10 transition-colors" aria-label="Delete collection">
            <span class="material-icons-round text-lg text-danger">delete</span>
          </button>
          <button onclick="enterCollectionDetailSelectMode()" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="Select items">
            <span class="material-icons-round text-lg text-muted-foreground">checklist</span>
          </button>`}
      </div>
    </div>

    ${e.description?`<p class="text-muted-foreground text-sm mb-4">${l(e.description)}</p>`:""}

    ${n?"":`<button onclick="openAddContentToCollectionModal('${e.id}')" class="w-full flex items-center justify-center gap-2 bg-card hover:bg-card-hover border border-border text-heading text-sm font-medium py-3 rounded-xl transition-colors mb-4 shadow-sm active:scale-[0.97]">
      <span class="material-icons-round text-base">add</span> Add Content
    </button>`}

    ${o}

    <div id="collection-detail-items">${Wn(e,t,n,a)}</div>`}function Ye(){const e=document.getElementById("page"),t=e==null?void 0:e.querySelector("#collection-detail-page");!t||!Ge||(t.innerHTML=jt(Ge,Ht,te,I))}function Vn(){te=!0,I.clear(),Ye()}function Xe(){te=!1,I.clear(),Ye()}function Kn(e){te&&(I.has(e)?I.delete(e):I.add(e),Ye())}async function Zn(){var a;const e=Array.from(I);if(e.length===0||!re||!await J("Remove from collection",`Remove ${e.length} item${e.length!==1?"s":""} from this collection?`,"Remove",!1))return;const n=await m("POST",`/api/collections/${re}/items/bulk-remove`,{content_ids:e});if(n.ok){u("Removed from collection"),Xe();const o=document.getElementById("page");o&&await me(o,re)}else u(((a=n.data)==null?void 0:a.detail)||"Failed to remove",!0)}async function Jn(){var a;const e=Array.from(I);if(e.length===0||!await J("Delete content",`Permanently delete ${e.length} item${e.length!==1?"s":""}? This cannot be undone.`,"Delete",!0))return;const n=await m("POST","/api/content/bulk-delete",{ids:e});if(n.ok){u("Deleted"),Xe();const o=document.getElementById("page");o&&await me(o,re)}else u(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}async function me(e,t){if(!t){T("#collections");return}const[n,a]=await Promise.all([m("GET",`/api/collections/${t}`),m("GET",`/api/collections/${t}/items`)]);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Collection not found</p></div>';return}const o=n.data,s=a.ok?Array.isArray(a.data)?a.data:[]:[];re=t,Ge=o,Ht=s,te=!1,I.clear(),e.innerHTML=`<div class="slide-in-right" id="collection-detail-page">${jt(o,s,te,I)}</div>`}async function Yn(e){const t=await m("GET","/api/content",null,{limit:50}),n=t.ok?Array.isArray(t.data)?t.data:[]:[];A(`
    <h2 class="text-lg font-bold text-heading mb-4">Add Content</h2>
    ${n.length===0?'<p class="text-muted-foreground text-sm">No content to add. Save some content first.</p>':`
      <div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
        ${n.map(a=>`
          <button onclick="addToCollection('${e}','${a.id}')" class="w-full text-left bg-bg hover:bg-card-hover border border-border rounded-xl px-4 py-3 transition-colors">
            <p class="text-heading text-sm font-medium truncate">${l(a.title||a.url)}</p>
            <p class="text-muted-foreground text-xs truncate">${l(a.url)}</p>
          </button>`).join("")}
      </div>`}
  `)}async function Xn(e,t){var a;const n=await m("DELETE",`/api/collections/${e}/items/${t}`);n.ok?(u("Removed from collection"),await me(document.getElementById("page"),e)):u(((a=n.data)==null?void 0:a.detail)||"Failed to remove",!0)}async function Qn(e){const t=await m("GET",`/api/collections/${e}`);if(!t.ok)return;const n=t.data;A(`
    <h2 class="text-lg font-bold text-heading mb-4">Edit Collection</h2>
    <div class="space-y-4">
      <div>
        <label for="ec-title" class="text-xs text-muted-foreground font-medium mb-1.5 block">Title</label>
        <input id="ec-title" value="${l(n.title)}" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
      </div>
      <div>
        <label for="ec-desc" class="text-xs text-muted-foreground font-medium mb-1.5 block">Description</label>
        <textarea id="ec-desc" rows="2" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none">${l(n.description||"")}</textarea>
      </div>
      <label class="flex items-center gap-3 cursor-pointer">
        <input id="ec-shared" type="checkbox" ${n.is_shared?"checked":""} class="w-5 h-5 rounded-lg border-border text-accent focus:ring-accent" />
        <span class="text-sm text-heading font-medium">Share collection</span>
      </label>
      <button onclick="doEditCollection('${e}')" id="edit-col-btn" class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3.5 rounded-xl transition-colors active:scale-[0.97]">Save Changes</button>
    </div>
  `)}async function eo(e){var o;const t=document.getElementById("edit-col-btn");t.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',t.disabled=!0;const n={title:document.getElementById("ec-title").value.trim()||null,description:document.getElementById("ec-desc").value.trim()||null,is_shared:document.getElementById("ec-shared").checked},a=await m("PATCH",`/api/collections/${e}`,n);a.ok?(oe(),u("Collection updated!"),await me(document.getElementById("page"),e)):(u(((o=a.data)==null?void 0:o.detail)||"Failed to update",!0),t.textContent="Save Changes",t.disabled=!1)}async function to(e){var a;if(!await J("Delete Collection","This will remove the collection but not its content. Continue?","Delete",!0))return;const n=await m("DELETE",`/api/collections/${e}`);n.ok?(u("Deleted!"),T("#collections")):u(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}window.openAddContentToCollectionModal=Yn;window.removeFromCollection=Xn;window.openEditCollectionModal=Qn;window.doEditCollection=eo;window.deleteCollection=to;window.enterCollectionDetailSelectMode=Vn;window.exitCollectionDetailSelectMode=Xe;window.toggleCollectionDetailSelection=Kn;window.bulkRemoveFromCollection=Zn;window.bulkDeleteContentInCollection=Jn;async function pe(e){const[t,n]=await Promise.all([m("GET","/api/goals",null,{status:N}),N==="active"?m("GET","/api/goals/suggestions",null,{status:"pending"}):Promise.resolve({ok:!0,data:[]})]),a=t.ok?Array.isArray(t.data)?t.data:[]:[],o=n.ok?Array.isArray(n.data)?n.data:[]:[],s=a.filter(c=>!c.parent_goal_id),r={};a.filter(c=>c.parent_goal_id).forEach(c=>{r[c.parent_goal_id]||(r[c.parent_goal_id]=[]),r[c.parent_goal_id].push(c)});const i=a.flatMap(c=>c.steps||[]),d=i.length,p=i.filter(c=>c.is_completed).length,g=d>0?Math.round(p/d*100):0;e.innerHTML=`
    <div class="fade-in">
      <!-- Header with Progress Ring -->
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-4">
          <div class="relative">
            ${St(g,52,4)}
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-heading">${g}%</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">Goals</h1>
            <p class="text-muted-foreground text-xs">${a.length} goal${a.length!==1?"s":""} &middot; ${p}/${d} steps</p>
          </div>
        </div>
        <button onclick="openGoalsMenu()" class="p-2 rounded-md hover:bg-surface-hover transition-colors" aria-label="Goal actions">
          <span class="material-icons-round text-xl text-muted-foreground">more_vert</span>
        </button>
      </div>

      <!-- Filter Pills -->
      <div class="flex gap-2 mb-5" role="tablist" aria-label="Goal status filter">
        ${["active","completed","dismissed"].map(c=>`
          <button onclick="setGoalsFilterAndRender('${c}')" role="tab" aria-selected="${N===c}" class="px-4 py-2 rounded-full text-xs font-semibold border border-border shadow-sm hover:shadow-md transition-all duration-200 ${N===c?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground"}">${c.charAt(0).toUpperCase()+c.slice(1)}</button>
        `).join("")}
      </div>

      <!-- Merge Suggestions Banner -->
      ${o.length>0?`
        <button onclick="toggleSuggestions()" class="w-full bg-purple-500/10 border border-purple-500/20 rounded-md p-4 mb-4 flex items-center gap-3 transition-all active:scale-[0.98]" aria-expanded="${q}">
          <div class="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span class="material-icons-round text-xl text-purple-400">merge_type</span>
          </div>
          <div class="flex-1 text-left">
            <p class="text-heading text-sm font-semibold">You have ${o.length} merge suggestion${o.length!==1?"s":""}</p>
            <p class="text-muted-foreground text-xs">Tap to ${q?"hide":"review"}</p>
          </div>
          <span class="material-icons-round text-muted-foreground transition-transform ${q?"rotate-180":""}">${q?"expand_less":"expand_more"}</span>
        </button>
        ${q?`<div class="space-y-3 mb-4">${o.map(oo).join("")}</div>`:""}
      `:""}

      <!-- Goals List -->
      ${s.length===0&&o.length===0?`
        <div class="rounded-md p-6 min-h-[180px] bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800/40 dark:to-neutral-800/20 border border-border shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div class="absolute inset-0 opacity-20 pointer-events-none"><svg viewBox="0 0 200 200" class="w-full h-full"><defs><filter id="blur-g"><feGaussianBlur in="SourceGraphic" stdDeviation="40"/></filter></defs><circle cx="60" cy="60" r="80" fill="currentColor" filter="url(#blur-g)"/></svg></div>
          <div class="relative z-10"><span class="material-icons-round text-4xl text-heading opacity-80">flag</span></div>
          <p class="relative z-10 text-heading font-semibold mb-1 mt-2">${N==="active"?"No active goals yet":"No "+N+" goals"}</p>
          <p class="relative z-10 text-muted-foreground text-sm">Save more content and Zuno will detect your goals automatically</p>
        </div>`:`
        <div class="space-y-3">
          ${s.map(c=>no(c,r[c.id]||[])).join("")}
        </div>`}
    </div>`}function no(e,t=[]){const n=Math.round((e.confidence||0)*100),a=(e.evidence_content_ids||[]).length,o=t.length>0,s=e.steps||[],r=s.filter(c=>c.is_completed).length,i=s.length,d=i>0?Math.round(r/i*100):0,g={active:"border-l-accent",completed:"border-l-success",dismissed:"border-l-muted"}[e.status]||"border-l-accent";return`
    <article onclick="navigate('#goal-detail/${e.id}')" class="bg-card rounded-md p-4 border border-border border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.97] ${g}">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded ${o?"bg-purple-500/15":"bg-accent/15"} flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl ${o?"text-purple-500":"text-accent"}">${o?"account_tree":"flag"}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-heading text-sm leading-snug line-clamp-2">${l(e.title)}</h3>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-2">${l(e.description||"")}</p>

          <!-- Mini Progress Bar -->
          ${i>0?`
          <div class="mt-2.5 flex items-center gap-2">
            <div class="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div class="h-full ${o?"bg-purple-500":"bg-accent"} rounded-full transition-all duration-300" style="width:${d}%"></div>
            </div>
            <span class="text-muted-foreground text-[10px] flex-shrink-0">${r}/${i}</span>
          </div>`:""}

          <div class="flex items-center gap-3 mt-2">
            ${W(e.category,"emerald")}
            <span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">trending_up</span>${n}%</span>
            <span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">link</span>${a}</span>
            ${o?`<span class="text-purple-400 text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-xs">account_tree</span>${t.length}</span>`:""}
          </div>
        </div>
      </div>
    </article>`}function oo(e){const t=(e.child_goal_ids||[]).length;return`
    <div class="bg-purple-500/10 border border-purple-500/20 rounded-md p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span class="material-icons-round text-xl text-purple-400">merge_type</span>
        </div>
        <div class="flex-1 min-w-0">
          <span class="inline-block text-[10px] font-semibold uppercase tracking-wide text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full mb-1.5">Suggested merge</span>
          <h3 class="font-semibold text-heading text-sm leading-snug">${l(e.suggested_parent_title)}</h3>
          <p class="text-muted-foreground text-xs mt-1 line-clamp-3">${l(e.ai_reasoning||e.suggested_parent_description)}</p>
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
    </div>`}function ao(){nn(!q),pe(document.getElementById("page"))}function so(){A(`
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
  `)}async function ro(e){var a,o;const t=document.getElementById("accept-"+e);t&&(t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0);const n=await m("POST",`/api/goals/suggestions/${e}/accept`);n.ok?(u(((a=n.data)==null?void 0:a.message)||"Goals merged!"),pe(document.getElementById("page"))):(u(((o=n.data)==null?void 0:o.detail)||"Failed to merge",!0),t&&(t.textContent="Accept",t.disabled=!1))}async function io(e){var a;const t=document.getElementById("dismiss-"+e);t&&(t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0);const n=await m("POST",`/api/goals/suggestions/${e}/dismiss`);n.ok?(u("Suggestion dismissed"),pe(document.getElementById("page"))):(u(((a=n.data)==null?void 0:a.detail)||"Failed to dismiss",!0),t&&(t.textContent="Dismiss",t.disabled=!1))}async function lo(){var t,n;u("Starting consolidation...");const e=await m("POST","/api/goals/consolidate");e.ok?u(((t=e.data)==null?void 0:t.message)||"Finding similar goals…"):u(((n=e.data)==null?void 0:n.detail)||"Couldn't find goals to combine",!0)}async function co(){var t,n;u("Refreshing goals…");const e=await m("POST","/api/goals/reanalyze");e.ok?u(((t=e.data)==null?void 0:t.message)||"Goals refreshed!"):u(((n=e.data)==null?void 0:n.detail)||"Refresh failed",!0)}function uo(e){tn(e),pe(document.getElementById("page"))}window.setGoalsFilterAndRender=uo;window.toggleSuggestions=ao;window.openGoalsMenu=so;window.acceptSuggestion=ro;window.dismissSuggestion=io;window.triggerConsolidate=lo;window.reanalyzeGoals=co;async function Pe(e,t){if(!t){T("#goals");return}const n=await m("GET",`/api/goals/${t}`);if(!n.ok){e.innerHTML='<div class="text-center py-16 fade-in"><span class="material-icons-round text-5xl text-muted-foreground/60 mb-3">error</span><p class="text-muted-foreground">Goal not found</p></div>';return}const a=n.data,o=a.steps||[],s=o.filter(w=>w.is_completed),r=o.filter(w=>!w.is_completed),i=s.length,d=o.length,p=d>0?Math.round(i/d*100):0,g=Math.round((a.confidence||0)*100),c=(a.evidence_content_ids||[]).length,f=a.children||[],x=f.length>0,b=!!a.parent_goal_id,h=`hsl(${getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()})`;e.innerHTML=`
    <div class="slide-in-right">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <button onclick="navigate('${b?"#goal-detail/"+a.parent_goal_id:"#goals"}')" class="p-2 rounded-xl hover:bg-card-hover transition-colors" aria-label="${b?"Back to parent goal":"Back to goals"}">
          <span class="material-icons-round text-xl text-muted-foreground">arrow_back</span>
        </button>
        <h1 class="text-lg font-bold text-heading truncate flex-1">${b?"Sub-goal":"Goal"}</h1>
      </div>

      <!-- Progress Card -->
      <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
        <div class="flex items-center gap-4 mb-4">
          <div class="relative flex-shrink-0">
            ${St(p,64,5,h)}
            <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-heading">${p}%</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-lg font-bold text-heading leading-snug">${l(a.title)}</h2>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              ${W(a.category,"emerald")}
              ${W(a.status,a.status==="active"?"indigo":a.status==="completed"?"green":"gray")}
              ${x?'<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Parent</span>':""}
              ${b?'<span class="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-500">Sub-goal</span>':""}
            </div>
          </div>
        </div>
        <p class="text-body text-sm leading-relaxed">${l(a.description)}</p>
        <div class="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">trending_up</span>${g}% match</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">link</span>${c} from your content</span>
          <span class="flex items-center gap-1"><span class="material-icons-round text-sm">checklist</span>${i}/${d} steps</span>
        </div>
      </section>

      <!-- Sub-goals (horizontal scroll) -->
      ${x?`
      <section class="mb-4" aria-label="Sub-goals">
        <h3 class="text-sm font-semibold text-heading mb-3 flex items-center gap-1.5">
          <span class="material-icons-round text-base text-purple-400">account_tree</span> Sub-goals
        </h3>
        <div class="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          ${f.map(w=>{const Ae=Math.round((w.confidence||0)*100),D=w.status||"active",fe=D==="completed"?"check_circle":D==="dismissed"?"do_not_disturb_on":"flag",ge=D==="completed"?"text-success":D==="dismissed"?"text-muted-foreground":"text-accent";return`
            <article onclick="navigate('#goal-detail/${w.id}')" class="flex-shrink-0 w-44 bg-card rounded-xl p-3.5 shadow-sm border border-border hover:shadow-elevated transition-all cursor-pointer active:scale-[0.97]">
              <div class="flex items-center gap-2 mb-2">
                <span class="material-icons-round text-lg ${ge}">${fe}</span>
                <span class="text-[10px] text-muted-foreground">${Ae}%</span>
              </div>
              <h4 class="font-semibold text-heading text-xs leading-snug line-clamp-2">${l(w.title)}</h4>
            </article>`}).join("")}
        </div>
      </section>`:""}

      <!-- Steps -->
      <section class="mb-4" aria-label="Goal steps">
        <h3 class="text-sm font-semibold text-heading mb-3">Steps</h3>
        ${d===0?'<p class="text-muted-foreground text-sm text-center py-4">No steps yet</p>':`
          <div class="space-y-2" id="goal-steps-list">
            ${r.map(w=>ut(w,t)).join("")}
            ${i>0?`
              <button onclick="toggleCompletedSteps('${t}')" class="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground font-medium hover:text-heading transition-colors">
                <span class="material-icons-round text-sm">${$e?"expand_less":"expand_more"}</span>
                ${i} completed step${i!==1?"s":""}
              </button>
              ${$e?s.map(w=>ut(w,t)).join(""):""}
            `:""}
          </div>`}
      </section>

      ${a.ai_reasoning?`
        <section class="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-icons-round text-base text-accent">auto_awesome</span>
            <h3 class="text-xs font-semibold text-accent uppercase tracking-wide">AI Reasoning</h3>
          </div>
          <p class="text-muted-foreground text-sm leading-relaxed">${l(a.ai_reasoning)}</p>
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
    </div>`}function ut(e,t){const n=(e.source_content_ids||[]).length;return`
    <div class="bg-card rounded-xl p-3.5 flex items-start gap-3 transition-all duration-200 shadow-sm ${e.is_completed?"opacity-60":""}">
      <button onclick="event.stopPropagation();toggleGoalStep('${t}','${e.id}',${!e.is_completed})" class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 ${e.is_completed?"bg-accent border-accent check-bounce":"border-border hover:border-accent"} flex items-center justify-center transition-all" aria-label="${e.is_completed?"Mark incomplete":"Mark complete"}">
        ${e.is_completed?'<span class="material-icons-round text-sm text-white">check</span>':""}
      </button>
      <div class="flex-1 min-w-0">
        <p class="text-heading text-sm font-medium leading-snug ${e.is_completed?"line-through":""}">${l(e.title)}</p>
        ${e.description?`<p class="text-muted-foreground text-xs mt-1 leading-relaxed">${l(e.description)}</p>`:""}
        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-muted-foreground text-[10px]">Step ${e.step_index+1}</span>
          ${n>0?`<span class="text-muted-foreground text-[10px] flex items-center gap-0.5"><span class="material-icons-round text-[10px]">link</span>${n}</span>`:""}
          ${e.is_completed&&e.completed_at?'<span class="text-success text-[10px]">Done</span>':""}
        </div>
      </div>
    </div>`}function mo(e){on(!$e),Pe(document.getElementById("page"),e)}async function po(e,t,n){var o;const a=await m("PATCH",`/api/goals/${e}/steps/${t}`,{is_completed:n});a.ok?await Pe(document.getElementById("page"),e):u(((o=a.data)==null?void 0:o.detail)||"Failed to update step",!0)}async function fo(e,t){var a;const n=await m("PATCH",`/api/goals/${e}`,{status:t});n.ok?(u(`Goal ${t==="completed"?"completed":t==="dismissed"?"dismissed":"reactivated"}!`),await Pe(document.getElementById("page"),e)):u(((a=n.data)==null?void 0:a.detail)||"Failed to update goal",!0)}async function go(e){var a;if(!await J("Delete Goal","This will delete the goal and all its steps. Continue?","Delete",!0))return;const n=await m("DELETE",`/api/goals/${e}`);n.ok?(u("Goal deleted"),T("#goals")):u(((a=n.data)==null?void 0:a.detail)||"Failed to delete",!0)}window.toggleCompletedSteps=mo;window.toggleGoalStep=po;window.updateGoalStatus=fo;window.deleteGoal=go;function Dt(){try{return JSON.parse(localStorage.getItem("zuno_searches")||"[]")}catch{return[]}}function bo(e){const t=Dt().filter(n=>n!==e);t.unshift(e),localStorage.setItem("zuno_searches",JSON.stringify(t.slice(0,5)))}async function xo(e){const t=await m("GET","/api/tags/popular"),n=t.ok?Array.isArray(t.data)?t.data:[]:[],a=Dt();e.innerHTML=`
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
        <button onclick="setSearchType('fts')" id="st-fts" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${Y==="fts"?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground border border-border shadow-sm hover:shadow-md"}">Keywords</button>
        <button onclick="setSearchType('hybrid')" id="st-hybrid" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${Y==="hybrid"?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground border border-border shadow-sm hover:shadow-md"}">Smart</button>
        <button onclick="setSearchType('tag')" id="st-tag" role="tab" class="search-type px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 ${Y==="tag"?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground border border-border shadow-sm hover:shadow-md"}">By topic</button>
      </div>

      ${a.length>0?`
        <section class="mb-5" aria-label="Recent searches">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent</h3>
          <div class="flex flex-wrap gap-1.5">
            ${a.map(o=>`<button onclick="document.getElementById('search-input').value='${l(o)}';doSearch()" class="px-3 py-1.5 rounded-md bg-card border border-border text-xs text-body hover:border-accent transition-colors flex items-center gap-1"><span class="material-icons-round text-xs text-muted-foreground">history</span>${l(o)}</button>`).join("")}
          </div>
        </section>`:""}

      ${n.length>0?`
        <section class="mb-5" aria-label="Popular tags">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Popular topics</h3>
          <div class="flex flex-wrap gap-1.5">
            ${n.map(o=>`<button onclick="searchByTag('${l(o.slug)}')" class="px-3 py-1.5 rounded-md bg-card border border-border text-xs text-body hover:border-accent transition-colors">${l(o.name)} <span class="text-muted-foreground">${o.count||o.usage_count||""}</span></button>`).join("")}
          </div>
        </section>`:""}

      <div id="search-results" aria-live="polite"></div>
    </div>`}function Rt(e){an(e),document.querySelectorAll(".search-type").forEach(t=>{const n=t.id==="st-"+e;t.className=`search-type px-4 py-2 rounded-md text-xs font-semibold border border-border transition-all duration-200 ${n?"bg-primary text-primary-foreground border-primary/30":"bg-card text-foreground shadow-sm hover:shadow-md"}`})}async function Gt(){var o;const e=document.getElementById("search-input").value.trim();if(!e)return;bo(e);const t=document.getElementById("search-results");t.innerHTML=se(2);let n;Y==="hybrid"?n=await m("GET","/api/search/hybrid",null,{q:e,limit:20}):Y==="tag"?n=await m("GET",`/api/search/tag/${encodeURIComponent(e)}`,null,{limit:20}):n=await m("GET","/api/search",null,{q:e,limit:20});const a=n.ok?Array.isArray(n.data)?n.data:[]:[];if(!n.ok){t.innerHTML=`<div class="bg-danger/10 rounded-md p-4 text-center"><p class="text-danger text-sm">${l(((o=n.data)==null?void 0:o.detail)||"Search failed")}</p></div>`;return}t.innerHTML=a.length===0?'<div class="text-center py-12"><span class="material-icons-round text-4xl text-muted-foreground/60 mb-2">search_off</span><p class="text-muted-foreground text-sm">No results found</p></div>':`<p class="text-muted-foreground text-xs mb-3">${a.length} result${a.length!==1?"s":""}</p>
       <div class="space-y-3">${a.map(s=>ue(s,{roundedMinimal:!0,showAiStatus:!0,processingIds:F()})).join("")}</div>`}function ho(e){Rt("tag"),document.getElementById("search-input").value=e,Gt()}window.setSearchType=Rt;window.doSearch=Gt;window.searchByTag=ho;async function Ot(e){const t=await m("GET","/api/knowledge/stats"),n=t.ok?t.data:null;e.innerHTML=`
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
        ${le.length===0?`
          <div class="flex flex-col items-center justify-center min-h-[200px] text-center px-4 py-6">
            <div class="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center mb-4">
              <span class="material-icons-round text-4xl text-primary">psychology</span>
            </div>
            <p class="text-heading font-semibold mb-1">Ask anything about your content</p>
            <p class="text-muted-foreground text-sm mb-5 opacity-90">Answers from your saved content</p>
            <div class="flex flex-wrap gap-2 justify-center">
              ${rn.map(o=>`
                <button onclick="askSuggested(this.textContent)" class="px-3 py-2 rounded-md bg-card border border-border text-xs text-foreground hover:border-primary hover:text-primary transition-colors shadow-sm">${o}</button>
              `).join("")}
            </div>
          </div>`:le.map(Oe).join("")}
      </div>

      <!-- Input (always visible above nav) -->
      <div class="flex gap-2 flex-shrink-0 pt-2">
        <input id="knowledge-input" type="text" placeholder="Ask a question..." class="flex-1 min-w-0 bg-card border border-border rounded-md px-4 py-3.5 text-sm text-heading placeholder-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 shadow-sm" onkeydown="if(event.key==='Enter')doAsk()" aria-label="Question input" />
        <button onclick="doAsk()" class="bg-primary text-primary-foreground px-4 rounded-md transition-colors active:scale-95 shadow-sm flex-shrink-0" aria-label="Send question">
          <span class="material-icons-round text-lg">send</span>
        </button>
      </div>
    </div>`;const a=document.getElementById("knowledge-chat");a.scrollTop=a.scrollHeight}function Oe(e){return e.role==="user"?`<div class="flex justify-end"><div class="bg-accent/20 text-heading rounded-md px-4 py-3 max-w-[80%] text-sm">${l(e.text)}</div></div>`:`
    <div class="flex justify-start">
      <div class="bg-card border border-border rounded-md px-4 py-3.5 max-w-[90%] shadow-sm">
        <p class="text-body text-sm leading-relaxed whitespace-pre-wrap">${l(e.text)}</p>
        ${e.sources&&e.sources.length>0?`
          <div class="mt-3 pt-3 border-t border-border">
            <p class="text-muted-foreground text-[10px] uppercase tracking-wide font-semibold mb-2">From your content</p>
            <div class="space-y-1.5">
              ${e.sources.map(t=>`
                <div class="bg-bg rounded-md px-3 py-2.5 cursor-pointer hover:bg-card-hover transition-colors" onclick="navigate('#content-detail/${t.content_id}')">
                  <p class="text-heading text-xs font-medium line-clamp-1">${l(t.title||t.url||t.content_id)}</p>
                  ${t.chunk_text?`<p class="text-muted-foreground text-[11px] line-clamp-2 mt-0.5">${l(Ve(t.chunk_text,100))}</p>`:""}
                </div>`).join("")}
            </div>
          </div>`:""}
      </div>
    </div>`}function vo(e){document.getElementById("knowledge-input").value=e,Ut()}async function Ut(){var s,r;const e=document.getElementById("knowledge-input"),t=e.value.trim();if(!t)return;e.value="",rt({role:"user",text:t});const n=document.getElementById("knowledge-chat");le.length===1&&(n.innerHTML=""),n.innerHTML+=Oe({role:"user",text:t}),n.innerHTML+='<div id="typing" class="flex justify-start"><div class="bg-card border border-border rounded-md px-5 py-4 shadow-sm"><div class="flex gap-1.5"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div></div>',n.scrollTop=n.scrollHeight;const a=await m("POST","/api/knowledge/ask",{query:t,include_sources:!0});(s=document.getElementById("typing"))==null||s.remove();const o=a.ok?{role:"assistant",text:a.data.answer,sources:a.data.sources||[]}:{role:"assistant",text:`Error: ${((r=a.data)==null?void 0:r.detail)||"Failed to get answer"}`,sources:[]};rt(o),n.innerHTML+=Oe(o),n.scrollTop=n.scrollHeight}function yo(){A(`
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
  `)}async function wo(){var t;u("Updating knowledge base...");const e=await m("POST","/api/knowledge/reindex",{});e.ok?u(`Updated: ${e.data.content_processed} items in your knowledge base`):u(((t=e.data)==null?void 0:t.detail)||"Update failed",!0)}function ko(){sn(),Ot(document.getElementById("page"))}window.askSuggested=vo;window.doAsk=Ut;window.openKnowledgeSettings=yo;window.doReindex=wo;window.clearKnowledgeAndRender=ko;async function Qe(e){var d;const[t,n,a]=await Promise.all([m("GET","/api/profile"),m("GET","/api/user-preferences"),m("GET","/api/admin/me")]),o=t.ok?t.data:{},s=n.ok?n.data:{},r=Vt(),i=a.ok&&((d=a.data)==null?void 0:d.admin)===!0;e.innerHTML=`
    <div class="fade-in">
      <!-- Avatar Hero -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Account info">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-16 h-16 rounded-md bg-accent/15 flex items-center justify-center overflow-hidden flex-shrink-0">
            ${o.avatar_url?`<img src="${l(o.avatar_url)}" alt="Avatar" class="w-full h-full object-cover" onerror="this.style.display='none'"/>`:'<span class="material-icons-round text-3xl text-accent">person</span>'}
          </div>
          <div>
            <h1 class="text-xl font-bold text-heading">${l(o.display_name||"No name")}</h1>
            <p class="text-muted-foreground text-sm">${l(o.email||o.phone||"")}</p>
          </div>
        </div>
        <div class="space-y-4">
          <div>
            <label for="p-name" class="text-xs text-muted-foreground font-medium mb-1.5 block">Display Name</label>
            <input id="p-name" value="${l(o.display_name||"")}" class="w-full bg-bg border border-border rounded-md px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
          </div>
          <div>
            <label for="p-avatar" class="text-xs text-muted-foreground font-medium mb-1.5 block">Avatar URL</label>
            <input id="p-avatar" value="${l(o.avatar_url||"")}" class="w-full bg-bg border border-border rounded-md px-4 py-3 text-sm text-heading focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30" />
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
              <button onclick="applyTheme('${p}');renderProfile(document.getElementById('page'))" class="flex-1 py-2.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${r===p?"bg-primary text-primary-foreground border-primary/30":"bg-card border border-border text-foreground"} active:scale-[0.97]">
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

      ${i?`
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

      <!-- About Us -->
      <section class="mt-4" aria-label="About">
        <button onclick="navigate('#about')" class="w-full flex items-center justify-center gap-2 bg-bg hover:bg-surface-hover border border-border text-heading font-medium py-3 rounded-md transition-colors active:scale-[0.97]">
          <span class="material-icons-round text-lg text-muted-foreground">info</span> About Us
        </button>
      </section>
    </div>`}async function $o(){var a;const e=document.getElementById("profile-btn");e.innerHTML='<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div>',e.disabled=!0;const t={display_name:document.getElementById("p-name").value.trim()||null,avatar_url:document.getElementById("p-avatar").value.trim()||null},n=await m("PATCH","/api/profile",t);n.ok?(qe(null),u("Profile updated!")):u(((a=n.data)==null?void 0:a.detail)||"Failed to update",!0),e.textContent="Update Profile",e.disabled=!1}async function _o(e){await m("PATCH","/api/user-preferences",{feed_type:e}),u("Feed preference updated!"),await Qe(document.getElementById("page"))}window.renderProfile=Qe;window.doUpdateProfile=$o;window.updateFeedPref=_o;async function Ft(e){var n;const t=await m("GET","/api/admin/me");if(!t.ok||!((n=t.data)!=null&&n.admin)){T("#profile");return}e.innerHTML=`
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
          <div id="admin-prompts-section">
            <h4 class="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Prompts</h4>
            <div id="admin-prompts-list-wrap">
              <div class="flex gap-2 mb-2">
                <button onclick="adminLoadPromptsList()" id="admin-prompts-load-btn" class="flex-1 bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5">
                  <span class="material-icons-round text-base">list</span> Load prompts
                </button>
                <button onclick="adminDoReloadPrompts()" id="admin-prompts-btn" class="bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium py-2.5 rounded-xl transition-colors active:scale-[0.97] flex items-center justify-center gap-1.5 px-3" title="Clear cache">
                  <span class="material-icons-round text-base">refresh</span> Reload cache
                </button>
              </div>
              <div id="admin-prompts-list-result" class="mt-2"></div>
            </div>
            <div id="admin-prompts-edit-wrap" class="hidden space-y-3">
              <div class="flex items-center justify-between">
                <span id="admin-prompts-edit-title" class="text-sm font-medium text-heading">Edit prompt</span>
                <button type="button" onclick="adminShowPromptsList()" class="text-xs text-muted-foreground hover:text-heading">Back to list</button>
              </div>
              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">System prompt</label>
                <textarea id="admin-prompt-system" rows="6" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent font-mono"></textarea>
              </div>
              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">User template (optional)</label>
                <textarea id="admin-prompt-user-template" rows="3" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent font-mono" placeholder="e.g. {query} or leave empty"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Version</label>
                  <input type="text" id="admin-prompt-version" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="1.0" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Temperature</label>
                  <input type="number" id="admin-prompt-temperature" step="0.1" min="0" max="2" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="0.3" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Max output tokens</label>
                  <input type="number" id="admin-prompt-max-tokens" min="1" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="2048" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Model (optional)</label>
                  <input type="text" id="admin-prompt-model" class="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent" placeholder="" />
                </div>
              </div>
              <div class="flex gap-2">
                <button type="button" onclick="adminSavePrompt()" id="admin-prompt-save-btn" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-xl">Save</button>
                <button type="button" onclick="adminShowPromptsList()" class="bg-bg hover:bg-surface-hover border border-border text-heading text-sm font-medium px-4 py-2.5 rounded-xl">Cancel</button>
              </div>
            </div>
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
    </div>`}async function So(){var n;const e=await m("GET","/api/admin/cache/stats"),t=document.getElementById("admin-cache-stats-result");e.ok?t.innerHTML=`<pre class="text-xs text-muted-foreground bg-bg rounded-xl p-3 overflow-x-auto max-h-32">${l(JSON.stringify(e.data,null,2))}</pre>`:t.innerHTML=`<p class="text-danger text-xs">${l(((n=e.data)==null?void 0:n.detail)||"Failed to load stats")}</p>`}async function Co(){var a;const e=document.getElementById("admin-bust-btn");e.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',e.disabled=!0;const t=document.getElementById("admin-cache-pattern").value.trim(),n=await m("POST","/api/admin/cache/bust",null,t?{pattern:t}:null);n.ok?u("Cache busted!"):u(((a=n.data)==null?void 0:a.detail)||"Failed",!0),e.textContent="Bust",e.disabled=!1}let et=null;async function Eo(){var s;const e=document.getElementById("admin-prompts-load-btn"),t=document.getElementById("admin-prompts-list-result");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>',e.disabled=!0,t.innerHTML="";const n=await m("GET","/api/admin/prompts");if(!n.ok){t.innerHTML=`<p class="text-danger text-xs">${l(((s=n.data)==null?void 0:s.detail)||"Failed to load prompts")}</p>`,e.innerHTML='<span class="material-icons-round text-base">list</span> Load prompts',e.disabled=!1;return}const a=Array.isArray(n.data)?n.data:[],o=a.map(r=>`
    <div class="flex items-center justify-between py-2 border-b border-border last:border-0">
      <div>
        <span class="text-sm font-medium text-heading">${l(r.name)}</span>
        <span class="text-xs text-muted-foreground ml-2">v${l(r.version||"—")}</span>
        ${r.updated_at?`<span class="text-xs text-muted-foreground ml-2">${new Date(r.updated_at).toLocaleString()}</span>`:""}
      </div>
      <button type="button" onclick="adminEditPrompt('${l(r.name)}')" class="text-xs text-accent hover:text-accent-hover font-medium py-1 px-2">Edit</button>
    </div>
  `).join("");t.innerHTML=a.length?`<div class="max-h-48 overflow-y-auto rounded-xl border border-border p-2">${o}</div>`:'<p class="text-muted-foreground text-xs">No prompts in DB. Run migration to seed.</p>',e.innerHTML='<span class="material-icons-round text-base">list</span> Load prompts',e.disabled=!1}function tt(){et=null,document.getElementById("admin-prompts-list-wrap").classList.remove("hidden"),document.getElementById("admin-prompts-edit-wrap").classList.add("hidden")}async function Lo(e){var a;et=e,document.getElementById("admin-prompts-list-wrap").classList.add("hidden"),document.getElementById("admin-prompts-edit-wrap").classList.remove("hidden"),document.getElementById("admin-prompts-edit-title").textContent=`Edit: ${e}`;const t=await m("GET",`/api/admin/prompts/${encodeURIComponent(e)}`);if(!t.ok){u(((a=t.data)==null?void 0:a.detail)||"Failed to load prompt",!0),tt();return}const n=t.data;document.getElementById("admin-prompt-system").value=n.system||"",document.getElementById("admin-prompt-user-template").value=n.user_template??"",document.getElementById("admin-prompt-version").value=n.version??"",document.getElementById("admin-prompt-temperature").value=n.temperature??"",document.getElementById("admin-prompt-max-tokens").value=n.max_output_tokens??"",document.getElementById("admin-prompt-model").value=n.model??""}async function To(){var o;const e=et;if(!e)return;const t={system:document.getElementById("admin-prompt-system").value,user_template:document.getElementById("admin-prompt-user-template").value||null,version:document.getElementById("admin-prompt-version").value||null,temperature:document.getElementById("admin-prompt-temperature").value?parseFloat(document.getElementById("admin-prompt-temperature").value):null,max_output_tokens:document.getElementById("admin-prompt-max-tokens").value?parseInt(document.getElementById("admin-prompt-max-tokens").value,10):null,model:document.getElementById("admin-prompt-model").value||null},n=document.getElementById("admin-prompt-save-btn");n.disabled=!0,n.textContent="Saving...";const a=await m("PUT",`/api/admin/prompts/${encodeURIComponent(e)}`,t);a.ok?(u("Prompt saved!"),tt()):u(((o=a.data)==null?void 0:o.detail)||"Failed to save",!0),n.disabled=!1,n.textContent="Save"}async function Po(){var n;const e=document.getElementById("admin-prompts-btn");e.innerHTML,e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>',e.disabled=!0;const t=await m("POST","/api/admin/prompts/reload");t.ok?u("Prompts cache cleared!"):u(((n=t.data)==null?void 0:n.detail)||"Failed",!0),e.innerHTML='<span class="material-icons-round text-base">refresh</span> Reload cache',e.disabled=!1}async function Io(){var o,s,r;const e=document.getElementById("admin-embed-text").value.trim();if(!e){u("Enter text",!0);return}const t=document.getElementById("admin-embed-btn");t.innerHTML='<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>',t.disabled=!0;const n=await m("POST","/api/ai/generate-embedding",{text:e}),a=document.getElementById("admin-embed-result");if(n.ok){const i=((o=n.data.embedding)==null?void 0:o.length)||0;a.innerHTML=`<p class="text-success text-xs">Embedding generated (${i} dimensions)</p><pre class="text-xs text-muted-foreground bg-bg rounded-lg p-2 mt-1 max-h-24 overflow-y-auto">[${(s=n.data.embedding)==null?void 0:s.slice(0,5).map(d=>d.toFixed(6)).join(", ")}... ]</pre>`}else a.innerHTML=`<p class="text-danger text-xs">${l(((r=n.data)==null?void 0:r.detail)||"Failed")}</p>`;t.textContent="Go",t.disabled=!1}async function Ao(){var a,o;const e=document.getElementById("admin-gen-feed-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Generating...',e.disabled=!0;const t=await m("POST","/api/ai/generate-feed"),n=document.getElementById("admin-gen-feed-result");if(t.ok){const s=((a=t.data.items)==null?void 0:a.length)||0;n.innerHTML=`<p class="text-success text-xs">${s} feed items generated</p>`,t.data.message&&(n.innerHTML+=`<p class="text-muted-foreground text-xs mt-1">${l(t.data.message)}</p>`)}else n.innerHTML=`<p class="text-danger text-xs">${l(((o=t.data)==null?void 0:o.detail)||"Failed")}</p>`;e.innerHTML='<span class="material-icons-round text-base">auto_awesome</span> Generate Feed',e.disabled=!1}async function Bo(){const e=document.getElementById("admin-health-btn");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div>',e.disabled=!0;const t=await m("GET","/health");document.getElementById("admin-health-result").innerHTML=`<pre class="text-xs ${t.ok?"text-success":"text-danger"} bg-bg rounded-lg p-2 mt-1">${l(JSON.stringify(t.data,null,2))}</pre>`,e.innerHTML='<span class="material-icons-round text-base">monitor_heart</span> Check Health',e.disabled=!1}let Ue=[];async function Mo(){var r,i,d;const e=document.getElementById("admin-waitlist-btn"),t=document.getElementById("admin-waitlist-result");e.innerHTML='<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Loading...',e.disabled=!0;const n=await m("GET","/api/admin/waitlist");if(!n.ok){t.innerHTML=`<p class="text-danger text-xs">${l(((r=n.data)==null?void 0:r.detail)||"Failed to load waitlist")}</p>`,e.innerHTML='<span class="material-icons-round text-base">list</span> Load waitlist',e.disabled=!1;return}const a=((i=n.data)==null?void 0:i.items)||[];Ue=a;const o=((d=n.data)==null?void 0:d.total)??a.length,s=a.map(p=>`<tr class="border-b border-border"><td class="py-2 pr-3 text-sm text-heading">${l(p.email)}</td><td class="py-2 pr-3 text-xs text-muted-foreground">${l(p.tier)}</td><td class="py-2 pr-3 text-xs text-muted-foreground">${l(p.discount_code||"—")}</td><td class="py-2 text-xs text-muted-foreground">${p.created_at?new Date(p.created_at).toLocaleDateString():"—"}</td></tr>`).join("");t.innerHTML=`
    <p class="text-success text-xs mb-2">${o} signup(s)</p>
    <div class="overflow-x-auto max-h-48 overflow-y-auto rounded-xl border border-border">
      <table class="w-full text-left text-sm">
        <thead><tr class="bg-card border-b border-border"><th class="py-2 pr-3 font-semibold text-heading">Email</th><th class="py-2 pr-3 font-semibold text-heading">Tier</th><th class="py-2 pr-3 font-semibold text-heading">Code</th><th class="py-2 font-semibold text-heading">Date</th></tr></thead>
        <tbody>${s||'<tr><td colspan="4" class="py-4 text-center text-muted-foreground text-xs">No entries</td></tr>'}</tbody>
      </table>
    </div>
    ${a.length>0?'<button type="button" onclick="adminExportWaitlistCsv()" class="mt-2 text-xs text-accent hover:text-accent-hover font-medium">Export CSV</button>':""}
  `,e.innerHTML='<span class="material-icons-round text-base">list</span> Load waitlist',e.disabled=!1}function Ho(){if(Ue.length===0)return;const e=["email","tier","discount_code","created_at"],t=[e.join(",")].concat(Ue.map(o=>e.map(s=>`"${String(o[s]||"").replace(/"/g,'""')}"`).join(","))).join(`
`),n=new Blob([t],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(n),a.download=`zuno-waitlist-${new Date().toISOString().slice(0,10)}.csv`,a.click(),URL.revokeObjectURL(a.href)}window.renderAdmin=Ft;window.adminLoadCacheStats=So;window.adminDoBustCache=Co;window.adminLoadPromptsList=Eo;window.adminShowPromptsList=tt;window.adminEditPrompt=Lo;window.adminSavePrompt=To;window.adminDoReloadPrompts=Po;window.adminDoGenerateEmbedding=Io;window.adminDoGenerateFeed=Ao;window.adminDoHealthCheck=Bo;window.adminLoadWaitlist=Mo;window.adminExportWaitlistCsv=Ho;const jo={},Do="1.0.0";function Ro(){return typeof import.meta>"u"||!jo?"unknown":"development"}async function Go(e){var r,i,d,p,g,c,f,x;const t=await m("GET","/api/about-config"),n=t.ok?t.data:null,a=n&&(((r=n.dev)==null?void 0:r.apiBase)||((i=n.dev)==null?void 0:i.appUrl)||((d=n.prod)==null?void 0:d.apiBase)||((p=n.prod)==null?void 0:p.appUrl)),o=z(),s=typeof window<"u"?Ne():"";e.innerHTML=`
    <div class="fade-in">
      <button onclick="navigate('#profile')" class="p-2 rounded-xl hover:bg-surface-hover transition-colors mb-4 flex items-center gap-2 text-muted-foreground hover:text-heading" aria-label="Back to profile">
        <span class="material-icons-round text-xl">arrow_back</span> Back to Profile
      </button>

      <!-- Version & Build -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Version and build">
        <h2 class="text-sm font-semibold text-heading mb-4">Version &amp; Build</h2>
        <dl class="space-y-2 text-sm">
          <div><dt class="text-muted-foreground font-medium">App version</dt><dd class="text-heading mt-0.5">${l(Do)}</dd></div>
          <div><dt class="text-muted-foreground font-medium">Build mode</dt><dd class="text-heading mt-0.5">${l(Ro())}</dd></div>
        </dl>
      </section>

      <!-- Current runtime -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Current runtime">
        <h2 class="text-sm font-semibold text-heading mb-4">Current runtime</h2>
        <dl class="space-y-2 text-sm">
          <div><dt class="text-muted-foreground font-medium">API base</dt><dd class="text-heading mt-0.5 break-all">${l(o||"(none)")}</dd></div>
          <div><dt class="text-muted-foreground font-medium">Supabase URL</dt><dd class="text-heading mt-0.5 break-all">${l(_e||"(none)")}</dd></div>
          <div><dt class="text-muted-foreground font-medium">OAuth redirect URL</dt><dd class="text-heading mt-0.5 break-all">${l(s||"(none)")}</dd></div>
          <div><dt class="text-muted-foreground font-medium">App scheme</dt><dd class="text-heading mt-0.5">${l(ze)}</dd></div>
          <div><dt class="text-muted-foreground font-medium">Feed visible</dt><dd class="text-heading mt-0.5">No</dd></div>
          <div><dt class="text-muted-foreground font-medium">Capacitor (native)</dt><dd class="text-heading mt-0.5">${Z()?"Yes":"No"}</dd></div>
        </dl>
      </section>

      <!-- Reference (dev vs prod) -->
      <section class="bg-card rounded-md p-5 mb-4 shadow-sm border border-border" aria-label="Reference URLs">
        <h2 class="text-sm font-semibold text-heading mb-4">Reference (expected dev / prod)</h2>
        ${a?`
          <div class="space-y-4">
            ${(g=n.dev)!=null&&g.apiBase||(c=n.dev)!=null&&c.appUrl?`
            <div>
              <h3 class="text-xs font-medium text-muted-foreground uppercase mb-2">Dev</h3>
              <dl class="space-y-2 text-sm">
                ${n.dev.apiBase?`<div><dt class="text-muted-foreground font-medium">API base</dt><dd class="text-heading mt-0.5 break-all">${l(n.dev.apiBase)}</dd></div>`:""}
                ${n.dev.appUrl?`<div><dt class="text-muted-foreground font-medium">App URL</dt><dd class="text-heading mt-0.5 break-all">${l(n.dev.appUrl)}</dd></div>`:""}
              </dl>
            </div>
            `:""}
            ${(f=n.prod)!=null&&f.apiBase||(x=n.prod)!=null&&x.appUrl?`
            <div>
              <h3 class="text-xs font-medium text-muted-foreground uppercase mb-2">Prod</h3>
              <dl class="space-y-2 text-sm">
                ${n.prod.apiBase?`<div><dt class="text-muted-foreground font-medium">API base</dt><dd class="text-heading mt-0.5 break-all">${l(n.prod.apiBase)}</dd></div>`:""}
                ${n.prod.appUrl?`<div><dt class="text-muted-foreground font-medium">App URL</dt><dd class="text-heading mt-0.5 break-all">${l(n.prod.appUrl)}</dd></div>`:""}
              </dl>
            </div>
            `:""}
          </div>
        `:'<p class="text-sm text-muted-foreground">Reference not available (server env not set or request failed).</p>'}
      </section>
    </div>`}const he=["content-detail","collection","goal-detail"];let C=0,$=!1;function Oo(e){return ye?he.includes(e)&&!he.includes(ye)?"slide-in-right":he.includes(ye)&&!he.includes(e)?"slide-in-left":"fade-in":"fade-in"}function Uo(e){const t=e();return t&&typeof t.then=="function"?t:Promise.resolve()}async function _(){var g;if($)return;$=!0;const e=++C,t=localStorage.getItem("zuno_token");let{page:n,id:a}=Jt();if(!n){$=!1,E(t?"#home":"#auth"),queueMicrotask(()=>_());return}if(n==="collection"&&!a){$=!1,E("#collections"),queueMicrotask(()=>_());return}if(!t&&n!=="auth"&&n!=="connect-extension"){$=!1,E("#auth"),queueMicrotask(()=>_());return}if(t&&n==="auth"){$=!1,E("#home"),queueMicrotask(()=>_());return}const o=document.getElementById("page");if(!o){$=!1;return}if(n==="connect-extension"){$=!1;try{window.ZUNO_API_BASE=z()}catch{window.ZUNO_API_BASE=((g=window.location)==null?void 0:g.origin)||""}o.innerHTML=`<div class="flex flex-col items-center justify-center py-16 text-center fade-in">
      <p class="text-heading font-semibold mb-2">Connecting extension…</p>
      <p class="text-muted-foreground text-sm">Make sure you're logged in. If nothing happens, ensure the Share to Zuno extension is installed.</p>
    </div>`,document.getElementById("topnav").classList.add("hidden"),document.getElementById("bottomnav").classList.add("hidden");return}if(n==="feed"){$=!1,E("#home"),queueMicrotask(()=>_());return}if(n==="library"){$=!1;const c=a==="collections"?"collections":a==="bookmarks"?"bookmarks":"saved";E(c==="collections"?"#collections":c==="bookmarks"?"#profile/bookmarks":"#home"),queueMicrotask(()=>_());return}if(n==="content"){$=!1,E("#home"),queueMicrotask(()=>_());return}if(n==="home"&&a==="collections"){$=!1,E("#collections"),queueMicrotask(()=>_());return}if(n==="home"&&a==="bookmarks"){$=!1,E("#profile/bookmarks"),queueMicrotask(()=>_());return}const s=n==="auth";document.getElementById("topnav").classList.toggle("hidden",s),document.getElementById("topnav").classList.toggle("flex",!s),document.getElementById("bottomnav").classList.toggle("hidden",s);const r=document.getElementById("nav-feed");r&&r.classList.toggle("hidden",!0);const i={home:"home",feed:"feed",collections:"home","content-detail":"home",collection:"home",goals:"goals","goal-detail":"goals",knowledge:"knowledge",profile:"profile",admin:"profile",about:"profile"};document.querySelectorAll(".nav-btn").forEach(c=>{const f=c.dataset.tab===i[n];c.setAttribute("aria-current",f?"page":"false")});const d=Oo(n);ln(n);try{const c=window.location.hash||"#home";c&&c!=="#auth"&&sessionStorage.setItem("zuno_last_hash",c)}catch{}const p={home:se(3),feed:se(3),collections:se(3),goals:se(3),"content-detail":Me(),"goal-detail":Me(),collection:Me(),admin:it()};try{await Uo(async()=>{if(e===C){o.innerHTML=`<div class="${d}">${p[n]||it()}</div>`;try{switch(n){case"auth":$t(o);break;case"home":if(a==="saved"?await Tt(o,"saved"):await hn(o),e!==C)return;try{const c=sessionStorage.getItem("zuno_pending_share");c&&(sessionStorage.removeItem("zuno_pending_share"),typeof openSaveContentModal=="function"&&openSaveContentModal(c))}catch{}break;case"feed":vt();break;case"collections":if(await Mt(o),e!==C)return;try{const c=sessionStorage.getItem("zuno_pending_share");c&&(sessionStorage.removeItem("zuno_pending_share"),typeof openSaveContentModal=="function"&&openSaveContentModal(c))}catch{}break;case"content-detail":if(await O(o,a),e!==C)return;break;case"collection":if(await me(o,a),e!==C)return;break;case"goals":if(await pe(o),e!==C)return;break;case"goal-detail":if(await Pe(o,a),e!==C)return;break;case"search":if(await xo(o),e!==C)return;break;case"knowledge":if(await Ot(o),e!==C)return;break;case"profile":if(a==="bookmarks"?await Ze(o,{standalone:!0,backHash:"#profile",backLabel:"Profile"}):await Qe(o),e!==C)return;break;case"admin":if(await Ft(o),e!==C)return;break;case"about":if(await Go(o),e!==C)return;break;default:$=!1,E("#home"),queueMicrotask(()=>_());return}}catch(c){if(e!==C)return;const f=typeof(c==null?void 0:c.message)=="string"?c.message:"Something went wrong";o.innerHTML=`<div class="flex flex-col items-center justify-center py-16 text-center fade-in" role="alert" aria-live="assertive">
          <span class="material-icons-round text-5xl text-danger/40 mb-3">error_outline</span>
          <p class="text-heading font-semibold mb-1">Something went wrong</p>
          <p class="text-muted-foreground text-sm mb-4">${l(f)}</p>
          <button type="button" onclick="router()" class="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors active:scale-[0.97]">Try again</button>
        </div>`}}})}catch{}$=!1}window.router=_;/*! Capacitor: https://capacitorjs.com/ - MIT License */var ne;(function(e){e.Unimplemented="UNIMPLEMENTED",e.Unavailable="UNAVAILABLE"})(ne||(ne={}));class He extends Error{constructor(t,n,a){super(t),this.message=t,this.code=n,this.data=a}}const Fo=e=>{var t,n;return e!=null&&e.androidBridge?"android":!((n=(t=e==null?void 0:e.webkit)===null||t===void 0?void 0:t.messageHandlers)===null||n===void 0)&&n.bridge?"ios":"web"},zo=e=>{const t=e.CapacitorCustomPlatform||null,n=e.Capacitor||{},a=n.Plugins=n.Plugins||{},o=()=>t!==null?t.name:Fo(e),s=()=>o()!=="web",r=c=>{const f=p.get(c);return!!(f!=null&&f.platforms.has(o())||i(c))},i=c=>{var f;return(f=n.PluginHeaders)===null||f===void 0?void 0:f.find(x=>x.name===c)},d=c=>e.console.error(c),p=new Map,g=(c,f={})=>{const x=p.get(c);if(x)return console.warn(`Capacitor plugin "${c}" already registered. Cannot register plugins twice.`),x.proxy;const b=o(),v=i(c);let h;const w=async()=>(!h&&b in f?h=typeof f[b]=="function"?h=await f[b]():h=f[b]:t!==null&&!h&&"web"in f&&(h=typeof f.web=="function"?h=await f.web():h=f.web),h),Ae=(k,S)=>{var P,R;if(v){const G=v==null?void 0:v.methods.find(L=>S===L.name);if(G)return G.rtype==="promise"?L=>n.nativePromise(c,S.toString(),L):(L,be)=>n.nativeCallback(c,S.toString(),L,be);if(k)return(P=k[S])===null||P===void 0?void 0:P.bind(k)}else{if(k)return(R=k[S])===null||R===void 0?void 0:R.bind(k);throw new He(`"${c}" plugin is not implemented on ${b}`,ne.Unimplemented)}},D=k=>{let S;const P=(...R)=>{const G=w().then(L=>{const be=Ae(L,k);if(be){const xe=be(...R);return S=xe==null?void 0:xe.remove,xe}else throw new He(`"${c}.${k}()" is not implemented on ${b}`,ne.Unimplemented)});return k==="addListener"&&(G.remove=async()=>S()),G};return P.toString=()=>`${k.toString()}() { [capacitor code] }`,Object.defineProperty(P,"name",{value:k,writable:!1,configurable:!1}),P},fe=D("addListener"),ge=D("removeListener"),qt=(k,S)=>{const P=fe({eventName:k},S),R=async()=>{const L=await P;ge({eventName:k,callbackId:L},S)},G=new Promise(L=>P.then(()=>L({remove:R})));return G.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await R()},G},Be=new Proxy({},{get(k,S){switch(S){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return v?qt:fe;case"removeListener":return ge;default:return D(S)}}});return a[c]=Be,p.set(c,{name:c,proxy:Be,platforms:new Set([...Object.keys(f),...v?[b]:[]])}),Be};return n.convertFileSrc||(n.convertFileSrc=c=>c),n.getPlatform=o,n.handleError=d,n.isNativePlatform=s,n.isPluginAvailable=r,n.registerPlugin=g,n.Exception=He,n.DEBUG=!!n.DEBUG,n.isLoggingEnabled=!!n.isLoggingEnabled,n},No=e=>e.Capacitor=zo(e),Fe=No(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Ie=Fe.registerPlugin;class nt{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(t,n){let a=!1;this.listeners[t]||(this.listeners[t]=[],a=!0),this.listeners[t].push(n);const s=this.windowListeners[t];s&&!s.registered&&this.addWindowListener(s),a&&this.sendRetainedArgumentsForEvent(t);const r=async()=>this.removeListener(t,n);return Promise.resolve({remove:r})}async removeAllListeners(){this.listeners={};for(const t in this.windowListeners)this.removeWindowListener(this.windowListeners[t]);this.windowListeners={}}notifyListeners(t,n,a){const o=this.listeners[t];if(!o){if(a){let s=this.retainedEventArguments[t];s||(s=[]),s.push(n),this.retainedEventArguments[t]=s}return}o.forEach(s=>s(n))}hasListeners(t){var n;return!!(!((n=this.listeners[t])===null||n===void 0)&&n.length)}registerWindowListener(t,n){this.windowListeners[n]={registered:!1,windowEventName:t,pluginEventName:n,handler:a=>{this.notifyListeners(n,a)}}}unimplemented(t="not implemented"){return new Fe.Exception(t,ne.Unimplemented)}unavailable(t="not available"){return new Fe.Exception(t,ne.Unavailable)}async removeListener(t,n){const a=this.listeners[t];if(!a)return;const o=a.indexOf(n);this.listeners[t].splice(o,1),this.listeners[t].length||this.removeWindowListener(this.windowListeners[t])}addWindowListener(t){window.addEventListener(t.windowEventName,t.handler),t.registered=!0}removeWindowListener(t){t&&(window.removeEventListener(t.windowEventName,t.handler),t.registered=!1)}sendRetainedArgumentsForEvent(t){const n=this.retainedEventArguments[t];n&&(delete this.retainedEventArguments[t],n.forEach(a=>{this.notifyListeners(t,a)}))}}const mt=e=>encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),pt=e=>e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class qo extends nt{async getCookies(){const t=document.cookie,n={};return t.split(";").forEach(a=>{if(a.length<=0)return;let[o,s]=a.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");o=pt(o).trim(),s=pt(s).trim(),n[o]=s}),n}async setCookie(t){try{const n=mt(t.key),a=mt(t.value),o=`; expires=${(t.expires||"").replace("expires=","")}`,s=(t.path||"/").replace("path=",""),r=t.url!=null&&t.url.length>0?`domain=${t.url}`:"";document.cookie=`${n}=${a||""}${o}; path=${s}; ${r};`}catch(n){return Promise.reject(n)}}async deleteCookie(t){try{document.cookie=`${t.key}=; Max-Age=0`}catch(n){return Promise.reject(n)}}async clearCookies(){try{const t=document.cookie.split(";")||[];for(const n of t)document.cookie=n.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(t){return Promise.reject(t)}}async clearAllCookies(){try{await this.clearCookies()}catch(t){return Promise.reject(t)}}}Ie("CapacitorCookies",{web:()=>new qo});const Wo=async e=>new Promise((t,n)=>{const a=new FileReader;a.onload=()=>{const o=a.result;t(o.indexOf(",")>=0?o.split(",")[1]:o)},a.onerror=o=>n(o),a.readAsDataURL(e)}),Vo=(e={})=>{const t=Object.keys(e);return Object.keys(e).map(o=>o.toLocaleLowerCase()).reduce((o,s,r)=>(o[s]=e[t[r]],o),{})},Ko=(e,t=!0)=>e?Object.entries(e).reduce((a,o)=>{const[s,r]=o;let i,d;return Array.isArray(r)?(d="",r.forEach(p=>{i=t?encodeURIComponent(p):p,d+=`${s}=${i}&`}),d.slice(0,-1)):(i=t?encodeURIComponent(r):r,d=`${s}=${i}`),`${a}&${d}`},"").substr(1):null,Zo=(e,t={})=>{const n=Object.assign({method:e.method||"GET",headers:e.headers},t),o=Vo(e.headers)["content-type"]||"";if(typeof e.data=="string")n.body=e.data;else if(o.includes("application/x-www-form-urlencoded")){const s=new URLSearchParams;for(const[r,i]of Object.entries(e.data||{}))s.set(r,i);n.body=s.toString()}else if(o.includes("multipart/form-data")||e.data instanceof FormData){const s=new FormData;if(e.data instanceof FormData)e.data.forEach((i,d)=>{s.append(d,i)});else for(const i of Object.keys(e.data))s.append(i,e.data[i]);n.body=s;const r=new Headers(n.headers);r.delete("content-type"),n.headers=r}else(o.includes("application/json")||typeof e.data=="object")&&(n.body=JSON.stringify(e.data));return n};class Jo extends nt{async request(t){const n=Zo(t,t.webFetchExtra),a=Ko(t.params,t.shouldEncodeUrlParams),o=a?`${t.url}?${a}`:t.url,s=await fetch(o,n),r=s.headers.get("content-type")||"";let{responseType:i="text"}=s.ok?t:{};r.includes("application/json")&&(i="json");let d,p;switch(i){case"arraybuffer":case"blob":p=await s.blob(),d=await Wo(p);break;case"json":d=await s.json();break;case"document":case"text":default:d=await s.text()}const g={};return s.headers.forEach((c,f)=>{g[f]=c}),{data:d,headers:g,status:s.status,url:s.url}}async get(t){return this.request(Object.assign(Object.assign({},t),{method:"GET"}))}async post(t){return this.request(Object.assign(Object.assign({},t),{method:"POST"}))}async put(t){return this.request(Object.assign(Object.assign({},t),{method:"PUT"}))}async patch(t){return this.request(Object.assign(Object.assign({},t),{method:"PATCH"}))}async delete(t){return this.request(Object.assign(Object.assign({},t),{method:"DELETE"}))}}Ie("CapacitorHttp",{web:()=>new Jo});var ft;(function(e){e.Dark="DARK",e.Light="LIGHT",e.Default="DEFAULT"})(ft||(ft={}));var gt;(function(e){e.StatusBar="StatusBar",e.NavigationBar="NavigationBar"})(gt||(gt={}));class Yo extends nt{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Ie("SystemBars",{web:()=>new Yo});const Xo=Ie("App",{web:()=>ce(()=>import("./web-CDSKpCNo.js"),[],import.meta.url).then(e=>new e.AppWeb)}),Qo=80,ea=200;let y=null,X=!1,Q=0,ie=null,U=null,zt=0;function ta(){return y||(y=document.createElement("div"),y.id="global-loading-overlay",y.setAttribute("role","progressbar"),y.setAttribute("aria-label","Loading"),y.setAttribute("aria-hidden","true"),y.className="global-loading-overlay hidden",y.innerHTML='<div class="global-loading-spinner"></div>',document.body.appendChild(y),y)}function na(){!y||X||(U&&(clearTimeout(U),U=null),y.classList.remove("hidden"),y.setAttribute("aria-hidden","false"),X=!0,zt=Date.now())}function oa(){if(!y)return;const e=Date.now()-zt,t=Math.max(0,ea-e);t>0&&X?U=setTimeout(()=>{U=null,y.classList.add("hidden"),y.setAttribute("aria-hidden","true"),X=!1},t):(y.classList.add("hidden"),y.setAttribute("aria-hidden","true"),X=!1)}function aa(){Q++,ta(),Q===1&&(U&&(clearTimeout(U),U=null),ie=setTimeout(()=>{ie=null,Q>0&&na()},Qo))}function sa(){Q>0&&Q--,Q===0&&(ie&&(clearTimeout(ie),ie=null),X&&oa())}window.showProgress=aa;window.hideProgress=sa;function ra(){const e=document.createElement("header");e.id="topnav",e.setAttribute("role","banner"),e.className="hidden sticky top-0 z-30 bg-transparent px-5 py-3 flex items-center justify-between safe-top mt-4";const t=typeof import.meta<"u"&&"./"||"/app/";return e.innerHTML=`
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
  `,e}function ia(e){const t=document.getElementById("app-header-root");if(!t)return null;const n=ra();return t.appendChild(n),n}function la(){const e=document.createElement("nav");return e.id="bottomnav",e.setAttribute("role","navigation"),e.setAttribute("aria-label","Main navigation"),e.className="hidden fixed bottom-0 left-0 right-0 border-t border-border px-6 py-4 z-30 safe-bottom",e.innerHTML=`
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
  `,e}function da(e){const t=document.getElementById("bottom-nav-root");if(!t)return null;const n=la();return t.appendChild(n),n}const ca=/https?:\/\/[^\s)<>]+/i;async function ua(e){if(!e||!e.content)return;if(!localStorage.getItem("zuno_token")){u("Please log in to save shared content",!0);return}try{typeof showProgress=="function"&&showProgress();try{e.type==="text"?await ma(e.content):e.type==="image"&&await pa(e.content,e.mimeType||"image/jpeg")}finally{typeof hideProgress=="function"&&hideProgress()}}catch(n){console.error("[ShareHandler]",n),u("Failed to save shared content",!0),typeof hideProgress=="function"&&hideProgress()}}async function ma(e){var n,a,o;const t=e.match(ca);if(t){const s=t[0],r=await m("POST","/api/content",{url:s});if(r.ok){u("Saved");const i=(n=r.data)==null?void 0:n.id;i&&(Ee(i),m("POST","/api/ai/process-content",{content_id:i}).catch(()=>{}))}else u(((a=r.data)==null?void 0:a.detail)||"Failed to save link",!0)}else{const s=e.length>80?e.slice(0,77)+"...":e,r=await m("POST","/api/content/text",{title:s,source_text:e});r.ok?u("Saved"):u(((o=r.data)==null?void 0:o.detail)||"Failed to save note",!0)}}async function pa(e,t){const n=atob(e),a=new Uint8Array(n.length);for(let x=0;x<n.length;x++)a[x]=n.charCodeAt(x);const o=new Blob([a],{type:t}),s=t.split("/")[1]||"jpg",r=`shared_${Date.now()}.${s}`,i=new FormData;i.append("file",o,r);const{getApiBase:d}=await ce(async()=>{const{getApiBase:x}=await Promise.resolve().then(()=>Kt);return{getApiBase:x}},void 0,import.meta.url),p=d(),g=localStorage.getItem("zuno_token"),c=await fetch(`${p}/api/v1/content/upload`,{method:"POST",headers:g?{Authorization:`Bearer ${g}`}:{},body:i}),f=await c.json().catch(()=>({}));c.ok?(u("Saved"),f.id&&(Ee(f.id),m("POST","/api/ai/process-content",{content_id:f.id}).catch(()=>{}))):u((f==null?void 0:f.detail)||"Failed to save image",!0)}window.handleSharedContent=ua;Wt();{const e=document.getElementById("dev-indicator"),t=z();console.log("[Zuno] DEV build — API base:",t,"| Debug APK uses host (10.0.2.2), release uses prod"),e&&(e.classList.remove("hidden"),e.setAttribute("aria-hidden","false"),e.textContent=t?`DEV ${t.replace(/^https?:\/\//,"").replace(/\/$/,"")}`:"DEV",e.classList.remove("pointer-events-none"),e.title=`API: ${t||"(not set)"}. Tap to copy.`)}Z()&&Xo.addListener("appUrlOpen",async e=>{e.url&&e.url.includes("access_token")&&await Ke(e.url)&&_()});function Nt(e){document.readyState==="loading"?document.addEventListener("DOMContentLoaded",e):e()}window.addEventListener("hashchange",_);const fa=2e3,ga=4e3;function ba(){const e=typeof window.hideSplash=="function"?window.hideSplash:typeof hideSplash=="function"?hideSplash:null;if(!e)return;const t=!!window._restoringRoute,n=typeof window._splashStart=="number"?Date.now()-window._splashStart:0,a=t?0:Math.max(0,fa-n);setTimeout(e,a)}Nt(()=>{const e=typeof window.hideSplash=="function"?window.hideSplash:typeof hideSplash=="function"?hideSplash:null;e&&setTimeout(e,ga)});Nt(async()=>{ia(),da();const t=new URLSearchParams(window.location.search).get("share");if(t){try{sessionStorage.setItem("zuno_pending_share",t)}catch{}const n=new URL(window.location.href);n.searchParams.delete("share"),window.history.replaceState({},"",n.pathname+n.search+(n.hash||""))}try{await Ke();const n=window.location.hash||"",a=!n||n==="#"||n==="#home",o=n.includes("access_token")||n.includes("error=");let s=!1;if(a&&!o)try{const r=sessionStorage.getItem("zuno_last_hash");r&&r!=="#"&&r!=="#auth"&&(history.replaceState(null,"",window.location.pathname+window.location.search+r),s=!0,window._restoringRoute=!0)}catch{}await _(),s&&(window._restoringRoute=!1),yt(),typeof window.lucide<"u"&&window.lucide.createIcons({nameAttr:"data-lucide"})}finally{ba()}});export{nt as W,ce as _,Ie as r};
