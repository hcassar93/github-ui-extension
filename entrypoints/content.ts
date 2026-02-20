export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    console.log('GitHub UI Extension loaded');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initExtension);
    } else {
      initExtension();
    }
  },
});

async function initExtension() {
  // Load saved repositories
  const savedRepos = await loadSavedRepositories();
  
  // Find the sidebar
  const sidebar = document.querySelector('[data-hpc]');
  if (!sidebar) {
    console.log('Sidebar not found, waiting...');
    setTimeout(initExtension, 1000);
    return;
  }

  // Inject custom repositories section
  injectCustomReposSection(sidebar, savedRepos);
  
  // Add settings button
  addSettingsButton(sidebar);
}

async function loadSavedRepositories() {
  const result = await chrome.storage.sync.get(['pinnedRepos', 'pinnedProjects']);
  return {
    repos: result.pinnedRepos || [],
    projects: result.projects || []
  };
}

function injectCustomReposSection(sidebar: Element, savedRepos: any) {
  // Find the "Top Repositories" section
  const repoSection = Array.from(sidebar.querySelectorAll('h2')).find(
    h2 => h2.textContent?.includes('Top Repositories')
  );
  
  if (!repoSection) return;
  
  const container = repoSection.closest('[data-hpc]') || repoSection.parentElement;
  if (!container) return;

  // Create custom section
  const customSection = document.createElement('div');
  customSection.id = 'github-ui-ext-custom-repos';
  customSection.style.cssText = `
    margin-bottom: 16px;
    border: 1px solid var(--borderColor-default);
    border-radius: 6px;
    padding: 16px;
    background: var(--bgColor-default);
  `;

  // Header with edit button
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;';
  header.innerHTML = `
    <h2 style="font-size: 14px; font-weight: 600; margin: 0;">
      📌 Pinned Repositories
    </h2>
    <button id="github-ui-ext-edit-btn" style="
      background: var(--button-default-bgColor);
      border: 1px solid var(--button-default-borderColor);
      border-radius: 6px;
      padding: 4px 12px;
      font-size: 12px;
      cursor: pointer;
      color: var(--fgColor-default);
    ">Edit</button>
  `;
  customSection.appendChild(header);

  // Repository list
  const repoList = document.createElement('div');
  repoList.id = 'github-ui-ext-repo-list';
  
  if (savedRepos.repos.length === 0) {
    repoList.innerHTML = `
      <div style="color: var(--fgColor-muted); font-size: 12px; text-align: center; padding: 20px;">
        No pinned repositories yet.<br>
        Click "Edit" to add some!
      </div>
    `;
  } else {
    savedRepos.repos.forEach((repo: any) => {
      const repoItem = document.createElement('a');
      repoItem.href = `https://github.com/${repo.owner}/${repo.name}`;
      repoItem.style.cssText = `
        display: block;
        padding: 8px;
        margin-bottom: 4px;
        border-radius: 6px;
        text-decoration: none;
        color: var(--fgColor-default);
        font-size: 14px;
        transition: background 0.2s;
      `;
      repoItem.innerHTML = `
        <div style="display: flex; align-items: center;">
          <svg style="width: 16px; height: 16px; margin-right: 8px; fill: var(--fgColor-muted);" viewBox="0 0 16 16">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
          </svg>
          <span><strong>${repo.owner}</strong>/${repo.name}</span>
        </div>
      `;
      repoItem.addEventListener('mouseenter', () => {
        repoItem.style.background = 'var(--bgColor-muted)';
      });
      repoItem.addEventListener('mouseleave', () => {
        repoItem.style.background = 'transparent';
      });
      repoList.appendChild(repoItem);
    });
  }
  
  customSection.appendChild(repoList);

  // Insert before the original Top Repositories section
  container.parentElement?.insertBefore(customSection, container);

  // Add edit button handler
  document.getElementById('github-ui-ext-edit-btn')?.addEventListener('click', openEditModal);
}

function addSettingsButton(sidebar: Element) {
  // This will be enhanced later
}

function openEditModal() {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'github-ui-ext-modal';
  overlay.style.cssText = `
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
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: var(--bgColor-default);
    border: 1px solid var(--borderColor-default);
    border-radius: 12px;
    padding: 24px;
    min-width: 500px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  `;

  modal.innerHTML = `
    <h2 style="margin-top: 0; font-size: 20px; font-weight: 600;">Edit Pinned Repositories</h2>
    <p style="color: var(--fgColor-muted); font-size: 14px; margin-bottom: 20px;">
      Add repositories in the format: <code style="background: var(--bgColor-muted); padding: 2px 6px; border-radius: 3px;">owner/repo</code>
    </p>
    <textarea id="github-ui-ext-repos-input" 
      placeholder="e.g., facebook/react&#10;microsoft/vscode&#10;vercel/next.js"
      style="
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
      "></textarea>
    <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
      <button id="github-ui-ext-cancel-btn" style="
        background: var(--button-default-bgColor);
        border: 1px solid var(--button-default-borderColor);
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        color: var(--fgColor-default);
      ">Cancel</button>
      <button id="github-ui-ext-save-btn" style="
        background: var(--button-primary-bgColor);
        border: 1px solid var(--button-primary-borderColor);
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        color: var(--button-primary-fgColor);
        font-weight: 600;
      ">Save</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Load current repos
  chrome.storage.sync.get(['pinnedRepos'], (result) => {
    const textarea = document.getElementById('github-ui-ext-repos-input') as HTMLTextAreaElement;
    if (textarea && result.pinnedRepos) {
      textarea.value = result.pinnedRepos
        .map((repo: any) => `${repo.owner}/${repo.name}`)
        .join('\n');
    }
  });

  // Event handlers
  document.getElementById('github-ui-ext-cancel-btn')?.addEventListener('click', () => {
    overlay.remove();
  });

  document.getElementById('github-ui-ext-save-btn')?.addEventListener('click', async () => {
    const textarea = document.getElementById('github-ui-ext-repos-input') as HTMLTextAreaElement;
    const repoStrings = textarea.value.split('\n').filter(line => line.trim());
    
    const repos = repoStrings.map(repoString => {
      const [owner, name] = repoString.trim().split('/');
      return { owner, name };
    }).filter(repo => repo.owner && repo.name);

    await chrome.storage.sync.set({ pinnedRepos: repos });
    
    overlay.remove();
    location.reload();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}
