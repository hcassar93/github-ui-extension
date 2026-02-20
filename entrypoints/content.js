export default defineContentScript({
  matches: ['https://github.com/*'],
  main() {
    console.log('[GitHub UI Extension] Content script loaded');

    // Storage helper
    async function loadData() {
      const result = await chrome.storage.sync.get(['pinnedRepos', 'projects']);
      return {
        pinnedRepos: result.pinnedRepos || [],
        projects: result.projects || []
      };
    }

    // Wait for sidebar to load
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

    // Inject custom sidebar section
    async function injectCustomSection() {
      // Only run on GitHub homepage
      if (window.location.pathname !== '/' && window.location.pathname !== '') {
        return;
      }

      console.log('[GitHub UI Extension] Waiting for sidebar...');
      const sidebar = await waitForSidebar();
      console.log('[GitHub UI Extension] Sidebar found');

      const { pinnedRepos, projects } = await loadData();

      // Remove existing custom section if it exists
      const existing = document.getElementById('github-ui-ext-section');
      if (existing) existing.remove();

      // Create custom section
      const section = document.createElement('div');
      section.id = 'github-ui-ext-section';
      section.style.cssText = `
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 16px;
      `;

      let html = '<h2 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #c9d1d9;">Pinned Repositories</h2>';
      
      if (pinnedRepos.length === 0) {
        html += '<p style="font-size: 12px; color: #8b949e; margin: 0;">No pinned repositories. Click the extension icon to add some!</p>';
      } else {
        html += '<ul style="list-style: none; margin: 0; padding: 0;">';
        pinnedRepos.forEach(repo => {
          html += `
            <li style="margin-bottom: 8px;">
              <a href="https://github.com/${repo}" 
                 data-sidepanel-link="true"
                 style="color: #58a6ff; text-decoration: none; font-size: 14px; display: block; padding: 4px 0;">
                ${repo}
              </a>
            </li>
          `;
        });
        html += '</ul>';
      }

      if (projects.length > 0) {
        html += '<h2 style="font-size: 14px; font-weight: 600; margin: 16px 0 12px 0; color: #c9d1d9;">Projects</h2>';
        html += '<ul style="list-style: none; margin: 0; padding: 0;">';
        projects.forEach(project => {
          html += `
            <li style="margin-bottom: 8px;">
              <a href="${project.url}" 
                 data-sidepanel-link="true"
                 style="color: #58a6ff; text-decoration: none; font-size: 14px; display: block; padding: 4px 0;">
                ${project.name}
              </a>
            </li>
          `;
        });
        html += '</ul>';
      }

      section.innerHTML = html;
      sidebar.insertBefore(section, sidebar.firstChild);

      console.log('[GitHub UI Extension] Custom section injected');
      attachSidePanelListeners();
    }

    // Attach click listeners for side panel links
    function attachSidePanelListeners() {
      document.querySelectorAll('[data-sidepanel-link="true"]').forEach(link => {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const url = link.href;
          const name = link.textContent.trim();
          
          console.log('[GitHub UI Extension] Opening in side panel:', name, url);
          
          // Open side panel
          await chrome.runtime.sendMessage({
            type: 'OPEN_SIDEPANEL'
          });
          
          // Wait a bit for panel to open, then send the URL
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: 'OPEN_IN_SIDEPANEL',
              name: name,
              url: url
            });
          }, 100);
        });
      });
    }

    // Listen for storage changes to update sidebar
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && (changes.pinnedRepos || changes.projects)) {
        console.log('[GitHub UI Extension] Storage changed, re-injecting sidebar');
        injectCustomSection();
      }
    });

    // Initialize
    injectCustomSection();
  }
});
