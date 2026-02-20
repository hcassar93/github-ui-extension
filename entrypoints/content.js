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
  initModalSystem();
  
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
        transition: background 0.15s ease;
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

// SPA-Style Modal System
const modalState = {
  tabs: [],
  activeTab: null,
  container: null
};

function initModalSystem() {
  const style = document.createElement('style');
  style.textContent = `
    #github-ui-ext-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--bgColor-default);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      animation: fadeIn 0.15s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    #github-ui-ext-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      background: var(--bgColor-muted);
      padding: 6px 8px;
      border-bottom: 1px solid var(--borderColor-default);
      overflow-x: auto;
      flex-shrink: 0;
    }
    
    .github-ui-ext-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bgColor-inset);
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      color: var(--fgColor-muted);
      min-width: 100px;
      max-width: 160px;
      transition: all 0.15s ease;
      user-select: none;
    }
    
    .github-ui-ext-tab:hover {
      background: var(--bgColor-default);
      border-color: var(--borderColor-default);
      color: var(--fgColor-default);
    }
    
    .github-ui-ext-tab.active {
      background: var(--bgColor-default);
      border-color: var(--borderColor-emphasis);
      color: var(--fgColor-default);
      font-weight: 600;
    }
    
    .github-ui-ext-tab-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .github-ui-ext-tab-close {
      width: 16px;
      height: 16px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--fgColor-muted);
      font-size: 18px;
      line-height: 1;
      transition: all 0.15s ease;
    }
    
    .github-ui-ext-tab-close:hover {
      background: var(--bgColor-danger-emphasis);
      color: var(--fgColor-onEmphasis);
    }
    
    #github-ui-ext-iframes {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    
    .github-ui-ext-iframe {
      width: 100%;
      height: 100%;
      border: none;
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease;
    }
    
    .github-ui-ext-iframe.active {
      opacity: 1;
      visibility: visible;
      z-index: 1;
    }
    
    .github-ui-ext-iframe.preloading {
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
  
  document.addEventListener('click', handleClick, true);
  document.addEventListener('mousedown', handleClick, true);
}

async function handleClick(e) {
  const link = e.target.closest('a[data-modal-link]');
  if (!link) return;
  
  const { modalMode } = await loadData();
  if (!modalMode) return;
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  if (!modalState.container) {
    await openModal(link.href);
  } else {
    const tab = modalState.tabs.find(t => t.url === link.href);
    if (tab) switchTab(tab.id);
  }
  
  return false;
}

async function openModal(clickedUrl) {
  const { pinnedRepos, projects } = await loadData();
  
  // Create container
  modalState.container = document.createElement('div');
  modalState.container.id = 'github-ui-ext-modal';
  modalState.container.innerHTML = `
    <div id="github-ui-ext-tabs"></div>
    <div id="github-ui-ext-iframes"></div>
  `;
  document.body.appendChild(modalState.container);
  
  // Create tabs
  modalState.tabs = [];
  
  pinnedRepos.forEach(repo => {
    const url = `https://github.com/${repo}`;
    modalState.tabs.push({
      id: `repo-${repo.replace('/', '-')}`,
      url,
      title: repo.split('/')[1] || repo
    });
    if (url === clickedUrl) modalState.activeTab = modalState.tabs[modalState.tabs.length - 1].id;
  });
  
  projects.forEach(project => {
    modalState.tabs.push({
      id: `proj-${project.name.replace(/\s+/g, '-')}`,
      url: project.url,
      title: project.name
    });
    if (project.url === clickedUrl) modalState.activeTab = modalState.tabs[modalState.tabs.length - 1].id;
  });
  
  if (!modalState.activeTab && modalState.tabs.length > 0) {
    modalState.activeTab = modalState.tabs[0].id;
  }
  
  renderTabs();
  createIframes();
}

function renderTabs() {
  const container = document.getElementById('github-ui-ext-tabs');
  if (!container) return;
  
  container.innerHTML = modalState.tabs.map(tab => `
    <div class="github-ui-ext-tab ${tab.id === modalState.activeTab ? 'active' : ''}" data-tab="${tab.id}">
      <span class="github-ui-ext-tab-title">${tab.title}</span>
      <span class="github-ui-ext-tab-close" data-close="${tab.id}">×</span>
    </div>
  `).join('');
  
  container.querySelectorAll('.github-ui-ext-tab').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.github-ui-ext-tab-close')) {
        switchTab(el.dataset.tab);
      }
    });
  });
  
  container.querySelectorAll('.github-ui-ext-tab-close').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(el.dataset.close);
    });
  });
}

function createIframes() {
  const container = document.getElementById('github-ui-ext-iframes');
  if (!container) return;
  
  modalState.tabs.forEach(tab => {
    const iframe = document.createElement('iframe');
    iframe.id = `iframe-${tab.id}`;
    iframe.className = `github-ui-ext-iframe ${tab.id === modalState.activeTab ? 'active' : 'preloading'}`;
    iframe.src = tab.url;
    // iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-popups-to-escape-sandbox';
    container.appendChild(iframe);
    
    // Remove preloading class after load
    iframe.addEventListener('load', () => {
      iframe.classList.remove('preloading');
    });
  });
}

function switchTab(tabId) {
  modalState.activeTab = tabId;
  renderTabs();
  
  document.querySelectorAll('.github-ui-ext-iframe').forEach(iframe => {
    iframe.classList.remove('active');
  });
  const active = document.getElementById(`iframe-${tabId}`);
  if (active) active.classList.add('active');
}

function closeTab(tabId) {
  const index = modalState.tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;
  
  modalState.tabs.splice(index, 1);
  document.getElementById(`iframe-${tabId}`)?.remove();
  
  if (modalState.tabs.length === 0) {
    modalState.container?.remove();
    modalState.container = null;
    modalState.activeTab = null;
  } else {
    if (modalState.activeTab === tabId) {
      modalState.activeTab = modalState.tabs[Math.max(0, index - 1)].id;
      renderTabs();
      switchTab(modalState.activeTab);
    } else {
      renderTabs();
    }
  }
}
