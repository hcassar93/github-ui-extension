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
        background: linear-gradient(135deg, #1a1f2e 0%, #161b22 100%);
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;

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
          html += `
            <div style="margin-bottom: 12px;">
              <a href="https://github.com/${repo.name}" 
                 style="color: #58a6ff; text-decoration: none; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; padding: 6px 0; transition: color 0.2s;">
                <span style="opacity: 0.7;">→</span>
                ${repo.name}
              </a>
          `;
          
          if (repo.tabs && repo.tabs.length > 0) {
            html += '<div style="margin-left: 20px; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 6px;">';
            repo.tabs.forEach(tab => {
              html += `
                <a href="https://github.com/${repo.name}/${tab}" 
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
        html += '<div>';
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

      if (repos.length === 0 && projects.length === 0) {
        html += `
          <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 32px; margin-bottom: 8px; opacity: 0.3;">📍</div>
            <p style="font-size: 13px; color: #7d8590; margin: 0;">Click the extension icon to pin<br>repositories and projects!</p>
          </div>
        `;
      }

      section.innerHTML = html;
      
      // Add hover effects
      section.addEventListener('mouseover', (e) => {
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
      
      section.addEventListener('mouseout', (e) => {
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
