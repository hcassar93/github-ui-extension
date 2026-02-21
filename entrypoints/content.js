export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    console.log('[GitHub UI Extension] Content script loaded');

    async function loadData() {
      const result = await chrome.storage.sync.get(['repos', 'projects', 'people']);
      return {
        repos: result.repos || [],
        projects: result.projects || [],
        people: result.people || []
      };
    }

    function waitForSidebar() {
      return new Promise((resolve) => {
        const check = () => {
          const sidebar = document.querySelector('.feed-left-sidebar') || 
                         document.querySelector('.dashboard-sidebar');
          if (sidebar) {
            resolve(sidebar);
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    function isHomepage() {
      return window.location.pathname === '/' || window.location.pathname === '';
    }

    function generatePinnedHTML(repos, projects, people) {
      let html = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <span style="font-size: 18px;">📌</span>
          <h2 style="font-size: 15px; font-weight: 700; margin: 0; color: #e6edf3; letter-spacing: 0.3px;">PINNED</h2>
        </div>
      `;

      // Repositories
      if (repos.length > 0) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="font-size: 11px; font-weight: 700; margin: 0 0 10px 0; color: #7d8590; text-transform: uppercase; letter-spacing: 0.8px;">Repositories</h3>';
        
        repos.forEach(repo => {
          const displayName = repo.name || repo.repo;
          const repoPath = repo.repo;
          
          html += `
            <div style="margin-bottom: 12px;">
              <a href="https://github.com/${repoPath}" 
                 style="color: #58a6ff; text-decoration: none; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; padding: 6px 0; transition: color 0.2s;">
                <span style="opacity: 0.7;">→</span>
                ${displayName}
              </a>
          `;
          
          if (repo.tabs && repo.tabs.length > 0) {
            html += '<div style="margin-left: 20px; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px;">';
            repo.tabs.forEach(tab => {
              html += `
                <a href="https://github.com/${repoPath}/${tab}" 
                   style="color: #8b949e; background: #21262d; text-decoration: none; font-size: 11px; padding: 3px 8px; border-radius: 12px; display: inline-block; border: 1px solid #30363d; transition: all 0.2s;">
                  ${tab}
                </a>
              `;
            });
            html += '</div>';
          }
          
          html += '</div>';
        });
        
        html += '</div>';
      }

      // Projects
      if (projects.length > 0) {
        html += '<div style="margin-bottom: 20px;">';
        html += '<h3 style="font-size: 11px; font-weight: 700; margin: 0 0 10px 0; color: #7d8590; text-transform: uppercase; letter-spacing: 0.8px;">Projects</h3>';
        
        projects.forEach(project => {
          html += `
            <div style="margin-bottom: 12px;">
              <a href="${project.url}" 
                 style="color: #58a6ff; text-decoration: none; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; padding: 6px 0; transition: color 0.2s;">
                <span style="opacity: 0.7;">→</span>
                ${project.name}
              </a>
          `;
          
          if (project.views && project.views.length > 0) {
            html += '<div style="margin-left: 20px; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px;">';
            project.views.forEach(view => {
              const viewUrl = `${project.url}/views/${view.number}`;
              html += `
                <a href="${viewUrl}" 
                   style="color: #8b949e; background: #21262d; text-decoration: none; font-size: 11px; padding: 3px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #30363d; transition: all 0.2s;">
                  <span>${view.name}</span>
                  <span style="opacity: 0.5; font-size: 10px;">#${view.number}</span>
                </a>
              `;
            });
            html += '</div>';
          }
          
          html += '</div>';
        });
        
        html += '</div>';
      }

      // People
      if (people.length > 0) {
        html += '<div>';
        html += '<h3 style="font-size: 11px; font-weight: 700; margin: 0 0 10px 0; color: #7d8590; text-transform: uppercase; letter-spacing: 0.8px;">People</h3>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 6px;">';
        
        people.forEach(username => {
          html += `
            <a href="https://github.com/${username}" 
               style="color: #8b949e; background: #21262d; text-decoration: none; font-size: 11px; padding: 4px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #30363d; transition: all 0.2s;">
              <span style="opacity: 0.6;">@</span>${username}
            </a>
          `;
        });
        
        html += '</div></div>';
      }

      if (repos.length === 0 && projects.length === 0 && people.length === 0) {
        html += `
          <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 32px; margin-bottom: 8px; opacity: 0.3;">📍</div>
            <p style="font-size: 13px; color: #7d8590; margin: 0;">Click the extension icon to pin<br>repositories, projects, and people!</p>
          </div>
        `;
      }

      return html;
    }

    function addHoverEffects(element) {
      element.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a');
        if (link) {
          if (link.style.background) {
            link.style.background = '#30363d';
            link.style.color = '#e6edf3';
          } else {
            link.style.color = '#79c0ff';
          }
        }
      });
      
      element.addEventListener('mouseout', (e) => {
        const link = e.target.closest('a');
        if (link) {
          if (link.style.background) {
            link.style.background = '#21262d';
            link.style.color = '#8b949e';
          } else {
            link.style.color = '#58a6ff';
          }
        }
      });
    }

    async function injectCustomSection() {
      if (!isHomepage()) {
        return;
      }

      const sidebar = await waitForSidebar();
      const { repos, projects, people } = await loadData();

      const existing = document.getElementById('github-ui-ext-section');
      if (existing) existing.remove();

      const section = document.createElement('div');
      section.id = 'github-ui-ext-section';
      section.style.cssText = `
        background: linear-gradient(135deg, #1a1f2e 0%, #161b22 100%);
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;

      section.innerHTML = generatePinnedHTML(repos, projects, people);
      addHoverEffects(section);

      sidebar.insertBefore(section, sidebar.firstChild);
    }

    async function injectFloatingButton() {
      if (isHomepage()) {
        const existingFab = document.getElementById('github-ui-ext-fab');
        const existingPopover = document.getElementById('github-ui-ext-popover');
        if (existingFab) existingFab.remove();
        if (existingPopover) existingPopover.remove();
        return;
      }

      const existingFab = document.getElementById('github-ui-ext-fab');
      if (existingFab) return;

      const { repos, projects, people } = await loadData();

      // Create FAB button
      const fab = document.createElement('button');
      fab.id = 'github-ui-ext-fab';
      fab.innerHTML = '📌';
      fab.title = 'Pinned Links';
      fab.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1a1f2e 0%, #161b22 100%);
        border: 1px solid #30363d;
        color: #e6edf3;
        font-size: 20px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(10px);
        animation: fabFadeIn 0.3s ease forwards;
      `;

      // Add animation keyframes
      if (!document.getElementById('github-ui-ext-styles')) {
        const style = document.createElement('style');
        style.id = 'github-ui-ext-styles';
        style.textContent = `
          @keyframes fabFadeIn {
            to {
              opacity: 0.7;
              transform: translateY(0);
            }
          }
          @keyframes popoverSlideIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          #github-ui-ext-fab:hover {
            opacity: 1 !important;
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
          }
        `;
        document.head.appendChild(style);
      }

      // Create popover
      const popover = document.createElement('div');
      popover.id = 'github-ui-ext-popover';
      popover.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 24px;
        width: 320px;
        max-height: 500px;
        overflow-y: auto;
        background: linear-gradient(135deg, #1a1f2e 0%, #161b22 100%);
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 20px;
        z-index: 9999;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        display: none;
        animation: popoverSlideIn 0.2s ease;
      `;

      popover.innerHTML = generatePinnedHTML(repos, projects, people);
      addHoverEffects(popover);

      // Toggle popover
      fab.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = popover.style.display === 'block';
        popover.style.display = isVisible ? 'none' : 'block';
      });

      // Close popover when clicking outside
      document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && !fab.contains(e.target)) {
          popover.style.display = 'none';
        }
      });

      document.body.appendChild(fab);
      document.body.appendChild(popover);
    }

    function initialize() {
      if (isHomepage()) {
        injectCustomSection();
      } else {
        injectFloatingButton();
      }
    }

    function initialize() {
      if (isHomepage()) {
        injectCustomSection();
      } else {
        injectFloatingButton();
      }
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && (changes.repos || changes.projects || changes.people)) {
        initialize();
      }
    });

    // Handle GitHub SPA navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        initialize();
      }
    }).observe(document.body, { subtree: true, childList: true });

    initialize();
  }
});
