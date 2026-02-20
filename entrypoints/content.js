export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    console.log('%c[GitHub UI Extension] Extension loaded!', 'color: #238636; font-weight: bold; font-size: 14px');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  },
});

async function init() {
  // Always initialize modal system
  initModalSystem();
  
  // Only inject sidebar on homepage
  if (window.location.pathname.match(/^\/?$/)) {
    await injectSidebar();
  }
}

async function injectSidebar() {
  const sidebar = await waitForSidebar();
  if (!sidebar) return;
  
  const { pinnedRepos, projects } = await loadData();
  injectCustomSection(sidebar, pinnedRepos, projects);
}

async function waitForSidebar() {
  for (let i = 0; i < 20; i++) {
    const sidebar = document.querySelector('.feed-left-sidebar') || 
                   document.querySelector('.dashboard-sidebar');
    if (sidebar) return sidebar;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return null;
}

async function loadData() {
  const result = await chrome.storage.sync.get(['pinnedRepos', 'projects', 'modalMode']);
  return {
    pinnedRepos: result.pinnedRepos || [],
    projects: result.projects || [],
    modalMode: result.modalMode || false
  };
}

function injectCustomSection(sidebar, repos, projects) {
  if (document.getElementById('github-ui-ext-section')) return;

  const section = document.createElement('div');
  section.id = 'github-ui-ext-section';
  section.innerHTML = `
    <style>
      #github-ui-ext-section {
        margin: 16px;
        border: 1px solid var(--borderColor-default);
        border-radius: 6px;
        padding: 16px;
        background: var(--bgColor-default);
      }
      
      .github-ui-ext-subsection {
        margin-bottom: 16px;
      }
      
      .github-ui-ext-subsection:last-child {
        margin-bottom: 0;
      }
      
      .github-ui-ext-header {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--fgColor-default);
      }
      
      .github-ui-ext-item {
        display: block;
        padding: 6px 8px;
        margin-bottom: 2px;
        border-radius: 6px;
        text-decoration: none;
        color: var(--fgColor-default);
        font-size: 13px;
        transition: background 0.2s;
        cursor: pointer;
      }
      
      .github-ui-ext-item:hover {
        background: var(--bgColor-muted);
      }
      
      .github-ui-ext-icon {
        width: 14px;
        height: 14px;
        margin-right: 6px;
        fill: var(--fgColor-muted);
        vertical-align: middle;
      }
      
      .github-ui-ext-project-icon {
        fill: var(--color-prettylights-syntax-entity);
      }
      
      .github-ui-ext-empty {
        color: var(--fgColor-muted);
        font-size: 11px;
        text-align: center;
        padding: 12px;
      }
    </style>
    
    <div class="github-ui-ext-subsection">
      <div class="github-ui-ext-header">📌 Pinned Repositories</div>
      <div id="github-ui-ext-repos"></div>
    </div>
    
    <div class="github-ui-ext-subsection">
      <div class="github-ui-ext-header">🚀 Projects</div>
      <div id="github-ui-ext-projects"></div>
    </div>
  `;

  const reposList = section.querySelector('#github-ui-ext-repos');
  const projectsList = section.querySelector('#github-ui-ext-projects');
  
  if (repos.length === 0) {
    reposList.innerHTML = '<div class="github-ui-ext-empty">No pinned repos</div>';
  } else {
    repos.forEach(repo => {
      const item = document.createElement('a');
      item.className = 'github-ui-ext-item';
      item.href = `https://github.com/${repo}`;
      item.dataset.modalLink = 'true';
      item.innerHTML = `
        <svg class="github-ui-ext-icon" viewBox="0 0 16 16">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
        </svg>
        <span>${repo.split('/')[1]}</span>
      `;
      reposList.appendChild(item);
    });
  }
  
  if (projects.length === 0) {
    projectsList.innerHTML = '<div class="github-ui-ext-empty">No projects</div>';
  } else {
    projects.forEach(project => {
      const item = document.createElement('a');
      item.className = 'github-ui-ext-item';
      item.href = project.url;
      item.dataset.modalLink = 'true';
      item.innerHTML = `
        <svg class="github-ui-ext-icon github-ui-ext-project-icon" viewBox="0 0 16 16">
          <path d="M1.5 3.25c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5A1.75 1.75 0 0 1 5.75 7.5h-2.5A1.75 1.75 0 0 1 1.5 5.75Zm7 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5a1.75 1.75 0 0 1-1.75 1.75h-2.5A1.75 1.75 0 0 1 8.5 5.75Zm-7 7c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5a1.75 1.75 0 0 1-1.75 1.75h-2.5a1.75 1.75 0 0 1-1.75-1.75Zm7 0c0-.966.784-1.75 1.75-1.75h2.5c.966 0 1.75.784 1.75 1.75v2.5a1.75 1.75 0 0 1-1.75 1.75h-2.5a1.75 1.75 0 0 1-1.75-1.75Z"></path>
        </svg>
        <span>${project.name}</span>
      `;
      projectsList.appendChild(item);
    });
  }

  const firstChild = sidebar.querySelector('.d-flex, .tmp-px-3, div');
  if (firstChild?.parentElement) {
    firstChild.parentElement.insertBefore(section, firstChild);
  } else {
    sidebar.prepend(section);
  }
}

// Modal Tab System - Using Real Chrome Tabs
function initModalSystem() {
  // Intercept clicks on marked links
  document.addEventListener('click', handleModalClick, true);
  document.addEventListener('mousedown', handleModalClick, true);
}

async function handleModalClick(e) {
  const link = e.target.closest('a[data-modal-link]');
  if (!link) return;
  
  const { modalMode } = await loadData();
  if (!modalMode) return;
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  // Open in new tab
  await chrome.runtime.sendMessage({
    type: 'OPEN_TAB',
    url: link.href
  });
  
  return false;
}