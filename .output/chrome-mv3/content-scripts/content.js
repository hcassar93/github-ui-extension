var content=(function(){"use strict";function y(e){return e}const g={matches:["https://github.com/*"],main(){console.log("GitHub UI Extension loaded"),document.readyState==="loading"?document.addEventListener("DOMContentLoaded",l):l()}};async function l(){const e=await m(),t=document.querySelector("[data-hpc]");if(!t){setTimeout(l,1e3);return}x(t,e)}async function m(){return(await chrome.storage.sync.get(["pinnedRepos"])).pinnedRepos||[]}function x(e,t){const o=Array.from(e.querySelectorAll("h2")).find(d=>d.textContent?.includes("Top Repositories"));if(!o)return;const i=o.closest("[data-hpc]")||o.parentElement;if(!i||document.getElementById("github-ui-ext-custom-repos"))return;const n=document.createElement("div");n.id="github-ui-ext-custom-repos",n.innerHTML=`
    <style>
      #github-ui-ext-custom-repos {
        margin-bottom: 16px;
        border: 1px solid var(--borderColor-default);
        border-radius: 6px;
        padding: 16px;
        background: var(--bgColor-default);
      }
      
      .github-ui-ext-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      
      .github-ui-ext-header h2 {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
      }
      
      .github-ui-ext-edit-btn {
        background: var(--button-default-bgColor);
        border: 1px solid var(--button-default-borderColor);
        border-radius: 6px;
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
        color: var(--fgColor-default);
      }
      
      .github-ui-ext-edit-btn:hover {
        background: var(--button-default-hoverBgColor);
      }
      
      .github-ui-ext-repo-item {
        display: block;
        padding: 8px;
        margin-bottom: 4px;
        border-radius: 6px;
        text-decoration: none;
        color: var(--fgColor-default);
        font-size: 14px;
        transition: background 0.2s;
      }
      
      .github-ui-ext-repo-item:hover {
        background: var(--bgColor-muted);
      }
      
      .github-ui-ext-repo-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        fill: var(--fgColor-muted);
        vertical-align: middle;
      }
      
      .github-ui-ext-empty {
        color: var(--fgColor-muted);
        font-size: 12px;
        text-align: center;
        padding: 20px;
      }
      
      #github-ui-ext-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .github-ui-ext-modal-content {
        background: var(--bgColor-default);
        border: 1px solid var(--borderColor-default);
        border-radius: 12px;
        padding: 24px;
        min-width: 500px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }
      
      .github-ui-ext-modal-content h2 {
        margin-top: 0;
        font-size: 20px;
        font-weight: 600;
      }
      
      .github-ui-ext-modal-content p {
        color: var(--fgColor-muted);
        font-size: 14px;
        margin-bottom: 20px;
      }
      
      .github-ui-ext-modal-content code {
        background: var(--bgColor-muted);
        padding: 2px 6px;
        border-radius: 3px;
      }
      
      .github-ui-ext-textarea {
        width: 100%;
        min-height: 200px;
        padding: 12px;
        border: 1px solid var(--borderColor-default);
        border-radius: 6px;
        font-family: monospace;
        font-size: 14px;
        background: var(--bgColor-inset);
        color: var(--fgColor-default);
        resize: vertical;
        box-sizing: border-box;
      }
      
      .github-ui-ext-modal-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }
      
      .github-ui-ext-btn {
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
      }
      
      .github-ui-ext-btn-cancel {
        background: var(--button-default-bgColor);
        border: 1px solid var(--button-default-borderColor);
        color: var(--fgColor-default);
      }
      
      .github-ui-ext-btn-cancel:hover {
        background: var(--button-default-hoverBgColor);
      }
      
      .github-ui-ext-btn-save {
        background: var(--button-primary-bgColor);
        border: 1px solid var(--button-primary-borderColor);
        color: var(--button-primary-fgColor);
        font-weight: 600;
      }
      
      .github-ui-ext-btn-save:hover {
        background: var(--button-primary-hoverBgColor);
      }
    </style>
    
    <div class="github-ui-ext-header">
      <h2>📌 Pinned Repositories</h2>
      <button class="github-ui-ext-edit-btn">Edit</button>
    </div>
    
    <div id="github-ui-ext-repo-list"></div>
  `;const p=n.querySelector("#github-ui-ext-repo-list");t.length===0?p.innerHTML=`
      <div class="github-ui-ext-empty">
        No pinned repositories yet.<br>
        Click "Edit" to add some!
      </div>
    `:t.forEach(d=>{const c=document.createElement("a");c.className="github-ui-ext-repo-item",c.href=`https://github.com/${d}`,c.innerHTML=`
        <svg class="github-ui-ext-repo-icon" viewBox="0 0 16 16">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
        </svg>
        <span>${d}</span>
      `,p.appendChild(c)}),i.parentElement?.insertBefore(n,i),n.querySelector(".github-ui-ext-edit-btn").addEventListener("click",v)}function v(){const e=document.createElement("div");e.id="github-ui-ext-modal";const t=document.createElement("div");t.className="github-ui-ext-modal-content",t.innerHTML=`
    <h2>Edit Pinned Repositories</h2>
    <p>Add repositories in the format: <code>owner/repo</code></p>
    <textarea 
      class="github-ui-ext-textarea" 
      placeholder="e.g., facebook/react
microsoft/vscode
vercel/next.js"></textarea>
    <div class="github-ui-ext-modal-actions">
      <button class="github-ui-ext-btn github-ui-ext-btn-cancel">Cancel</button>
      <button class="github-ui-ext-btn github-ui-ext-btn-save">Save</button>
    </div>
  `,e.appendChild(t),document.body.appendChild(e);const o=t.querySelector("textarea");chrome.storage.sync.get(["pinnedRepos"],i=>{i.pinnedRepos&&(o.value=i.pinnedRepos.join(`
`))}),t.querySelector(".github-ui-ext-btn-cancel").addEventListener("click",()=>{e.remove()}),t.querySelector(".github-ui-ext-btn-save").addEventListener("click",async()=>{const i=o.value.split(`
`).map(n=>n.trim()).filter(n=>n&&n.includes("/"));await chrome.storage.sync.set({pinnedRepos:i}),e.remove(),location.reload()}),e.addEventListener("click",i=>{i.target===e&&e.remove()})}function a(e,...t){}const f={debug:(...e)=>a(console.debug,...e),log:(...e)=>a(console.log,...e),warn:(...e)=>a(console.warn,...e),error:(...e)=>a(console.error,...e)},h=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome;var E=class b extends Event{static EVENT_NAME=u("wxt:locationchange");constructor(t,o){super(b.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=o}};function u(e){return`${h?.runtime?.id}:content:${e}`}function C(e){let t,o;return{run(){t==null&&(o=new URL(location.href),t=e.setInterval(()=>{let i=new URL(location.href);i.href!==o.href&&(window.dispatchEvent(new E(i,o)),o=i)},1e3))}}}var S=class r{static SCRIPT_STARTED_MESSAGE_TYPE=u("wxt:content-script-started");id;abortController;locationWatcher=C(this);constructor(t,o){this.contentScriptName=t,this.options=o,this.id=Math.random().toString(36).slice(2),this.abortController=new AbortController,this.stopOldScripts(),this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(t){return this.abortController.abort(t)}get isInvalid(){return h.runtime?.id==null&&this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(t){return this.signal.addEventListener("abort",t),()=>this.signal.removeEventListener("abort",t)}block(){return new Promise(()=>{})}setInterval(t,o){const i=setInterval(()=>{this.isValid&&t()},o);return this.onInvalidated(()=>clearInterval(i)),i}setTimeout(t,o){const i=setTimeout(()=>{this.isValid&&t()},o);return this.onInvalidated(()=>clearTimeout(i)),i}requestAnimationFrame(t){const o=requestAnimationFrame((...i)=>{this.isValid&&t(...i)});return this.onInvalidated(()=>cancelAnimationFrame(o)),o}requestIdleCallback(t,o){const i=requestIdleCallback((...n)=>{this.signal.aborted||t(...n)},o);return this.onInvalidated(()=>cancelIdleCallback(i)),i}addEventListener(t,o,i,n){o==="wxt:locationchange"&&this.isValid&&this.locationWatcher.run(),t.addEventListener?.(o.startsWith("wxt:")?u(o):o,i,{...n,signal:this.signal})}notifyInvalidated(){this.abort("Content script context invalidated"),f.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){document.dispatchEvent(new CustomEvent(r.SCRIPT_STARTED_MESSAGE_TYPE,{detail:{contentScriptName:this.contentScriptName,messageId:this.id}})),window.postMessage({type:r.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:this.id},"*")}verifyScriptStartedEvent(t){const o=t.detail?.contentScriptName===this.contentScriptName,i=t.detail?.messageId===this.id;return o&&!i}listenForNewerScripts(){const t=o=>{!(o instanceof CustomEvent)||!this.verifyScriptStartedEvent(o)||this.notifyInvalidated()};document.addEventListener(r.SCRIPT_STARTED_MESSAGE_TYPE,t),this.onInvalidated(()=>document.removeEventListener(r.SCRIPT_STARTED_MESSAGE_TYPE,t))}};function I(){}function s(e,...t){}const w={debug:(...e)=>s(console.debug,...e),log:(...e)=>s(console.log,...e),warn:(...e)=>s(console.warn,...e),error:(...e)=>s(console.error,...e)};return(async()=>{try{const{main:e,...t}=g;return await e(new S("content",t))}catch(e){throw w.error('The content script "content" crashed on startup!',e),e}})()})();
content;