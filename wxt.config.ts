import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'dist',
  manifest: {
    name: 'GitHub UI Extension',
    description: 'Customize your GitHub homepage with pinned repositories and projects',
    permissions: [
      'storage',
      'tabs',
      'webRequest'
    ],
    host_permissions: [
      'https://github.com/*'
    ],
    action: {
      default_popup: 'popup.html',
      default_title: 'GitHub UI Extension'
    }
  },
});
