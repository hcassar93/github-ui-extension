export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    console.log('%c[GitHub UI Extension] Extension loaded!', 'color: #238636; font-weight: bold; font-size: 14px');
    console.log('[GitHub UI Extension] URL:', window.location.href);
    console.log('[GitHub UI Extension] Ready state:', document.readyState);
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initExtension);
    } else {
      initExtension();
    }
  },
});

async function initExtension() {
  console.log('%c[GitHub UI Extension] Initializing...', 'color: #58a6ff; font-weight: bold');
  
  // Only run on the dashboard/homepage
  if (!window.location.pathname.match(/^\/?$/)) {
    console.log('[GitHub UI Extension] Not on homepage, skipping');
    return;
  }
  
  const sidebar = await waitForSidebar();
  if (!sidebar) {
    console.error('%c[GitHub UI Extension] Could not find sidebar after 10 seconds', 'color: #f85149; font-weight: bold');
    return;
  }
  
  console.log('%c[GitHub UI Extension] Sidebar found!', 'color: #238636; font-weight: bold', sidebar);
  
  const savedRepos = await loadSavedRepositories();
  console.log('[GitHub UI Extension] Loaded repos:', savedRepos);
  
  injectCustomReposSection(sidebar, savedRepos);
  console.log('%c[GitHub UI Extension] ✓ Successfully injected!', 'color: #238636; font-weight: bold; font-size: 16px');
}

async function waitForSidebar() {
  // The sidebar has class "feed-left-sidebar" or "dashboard-sidebar"
  for (let i = 0; i < 20; i++) {
    const sidebar = document.querySelector('.feed-left-sidebar') || 
                   document.querySelector('.dashboard-sidebar');
    
    if (sidebar) return sidebar;
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return null;
}

async function loadSavedRepositories() {
  const result = await chrome.storage.sync.get(['pinnedRepos']);
  return result.pinnedRepos || [];
}

function injectCustomReposSection(sidebar, savedRepos) {
  // Check if already injected
  if (document.getElementById('github-ui-ext-custom-repos')) {
    console.log('[GitHub UI Extension] Already injected');
    return;
  }

  const customSection = document.createElement('div');
  customSection.id = 'github-ui-ext-custom-repos';
  customSection.innerHTML = `
    <style>
      #github-ui-ext-custom-repos {
        margin: 16px;
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
        line-height: 1.5;
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
        font-family: monospace;
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
  `;

  const repoList = customSection.querySelector('#github-ui-ext-repo-list');
  
  if (savedRepos.length === 0) {
    repoList.innerHTML = `
      <div class="github-ui-ext-empty">
        No pinned repositories yet.<br>
        Click "Edit" to add some!
      </div>
    `;
  } else {
    savedRepos.forEach(repo => {
      const repoItem = document.createElement('a');
      repoItem.className = 'github-ui-ext-repo-item';
      repoItem.href = `https://github.com/${repo}`;
      repoItem.innerHTML = `
        <svg class="github-ui-ext-repo-icon" viewBox="0 0 16 16">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
        </svg>
        <span>${repo}</span>
      `;
      repoList.appendChild(repoItem);
    });
  }

  // Insert at the top of the sidebar
  const firstChild = sidebar.querySelector('.d-flex, .tmp-px-3, div');
  if (firstChild && firstChild.parentElement) {
    firstChild.parentElement.insertBefore(customSection, firstChild);
  } else {
    sidebar.prepend(customSection);
  }

  customSection.querySelector('.github-ui-ext-edit-btn').addEventListener('click', openEditModal);
}

function openEditModal() {
  console.log('[GitHub UI Extension] Opening edit modal');
  
  const overlay = document.createElement('div');
  overlay.id = 'github-ui-ext-modal';
  
  const modal = document.createElement('div');
  modal.className = 'github-ui-ext-modal-content';
  modal.innerHTML = `
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
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const textarea = modal.querySelector('textarea');
  
  chrome.storage.sync.get(['pinnedRepos'], (result) => {
    if (result.pinnedRepos) {
      textarea.value = result.pinnedRepos.join('\n');
    }
  });

  modal.querySelector('.github-ui-ext-btn-cancel').addEventListener('click', () => {
    overlay.remove();
  });

  modal.querySelector('.github-ui-ext-btn-save').addEventListener('click', async () => {
    const repoStrings = textarea.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('/'));

    console.log('[GitHub UI Extension] Saving repos:', repoStrings);
    await chrome.storage.sync.set({ pinnedRepos: repoStrings });
    overlay.remove();
    location.reload();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}
