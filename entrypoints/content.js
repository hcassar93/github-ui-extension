export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    console.log('[GitHub UI Extension] Content script loaded');

    async function loadData() {
      const result = await chrome.storage.sync.get(['repos', 'projects']);
      return {
        repos: result.repos || [],
        projects: result.projects || []
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

    async function injectCustomSection() {
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        return;
      }

      const sidebar = await waitForSidebar();
      const { repos, projects } = await loadData();

      const existing = document.getElementById('github-ui-ext-section');
      if (existing) existing.remove();

      const section = document.createElement('div');
      section.id = 'github-ui-ext-section';
      section.style.cssText = `
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 16px;
      `;

      let html = '<h2 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #c9d1d9;">Pinned</h2>';

      // Repositories
      if (repos.length > 0) {
        html += '<h3 style="font-size: 12px; font-weight: 600; margin: 8px 0 6px 0; color: #8b949e; text-transform: uppercase;">Repositories</h3>';
        html += '<ul style="list-style: none; margin: 0; padding: 0;">';
        
        repos.forEach(repo => {
          html += `
            <li style="margin-bottom: 8px;">
              <a href="https://github.com/${repo.name}" 
                 style="color: #58a6ff; text-decoration: none; font-size: 14px; display: block; padding: 4px 0; font-weight: 600;">
                ${repo.name}
              </a>
          `;
          
          if (repo.tabs && repo.tabs.length > 0) {
            html += '<ul style="list-style: none; margin: 4px 0 0 12px; padding: 0;">';
            repo.tabs.forEach(tab => {
              html += `
                <li style="margin-bottom: 2px;">
                  <a href="https://github.com/${repo.name}/${tab}" 
                     style="color: #8b949e; text-decoration: none; font-size: 12px; display: block; padding: 2px 0;">
                    → ${tab}
                  </a>
                </li>
              `;
            });
            html += '</ul>';
          }
          
          html += '</li>';
        });
        
        html += '</ul>';
      }

      // Projects
      if (projects.length > 0) {
        html += '<h3 style="font-size: 12px; font-weight: 600; margin: 12px 0 6px 0; color: #8b949e; text-transform: uppercase;">Projects</h3>';
        html += '<ul style="list-style: none; margin: 0; padding: 0;">';
        
        projects.forEach(project => {
          html += `
            <li style="margin-bottom: 6px;">
              <a href="${project.url}" 
                 style="color: #58a6ff; text-decoration: none; font-size: 14px; display: block; padding: 4px 0;">
                ${project.name}
              </a>
            </li>
          `;
        });
        
        html += '</ul>';
      }

      if (repos.length === 0 && projects.length === 0) {
        html += '<p style="font-size: 12px; color: #8b949e; margin: 0;">Click the extension icon to pin repositories and projects!</p>';
      }

      section.innerHTML = html;
      sidebar.insertBefore(section, sidebar.firstChild);
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && (changes.repos || changes.projects)) {
        injectCustomSection();
      }
    });

    injectCustomSection();
  }
});
