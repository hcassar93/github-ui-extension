import { defineConfig } from 'wxt';

export default defineConfig({
  outDir: 'dist',
  manifest: {
    name: 'GitHub UI Extension',
    description: 'Customize your GitHub homepage with pinned repositories and projects',
    permissions: ['storage'],
    host_permissions: ['https://github.com/*'],
  },
});
