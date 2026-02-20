# Quick Installation Guide

## TL;DR - Get This Running in 2 Minutes

1. **Clone and build**
   ```bash
   git clone https://github.com/haydencassar/github-ui-extension.git
   cd github-ui-extension
   npm install
   npm run build
   ```

2. **Load in Chrome**
   - Go to `chrome://extensions/`
   - Turn on "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `dist/chrome-mv3` folder from this project

3. **Use it**
   - Visit github.com
   - See the new "📌 Pinned Repositories" section on the left
   - Click "Edit" and add repos like: `facebook/react`, `microsoft/vscode`
   - Done!

## Updating After Code Changes

```bash
git pull
npm run build
# Then refresh the extension in chrome://extensions/
```

## Development Mode (Auto-reload on changes)

```bash
npm run dev
# Still need to load unpacked, but changes auto-reload
```

## Troubleshooting

**Extension doesn't show up on GitHub?**
- Make sure you're on github.com (not a settings page)
- Check chrome://extensions/ to confirm it's enabled
- Try reloading the page

**Changes not appearing?**
- Rebuild: `npm run build`
- Go to chrome://extensions/ and click the refresh icon
- Hard refresh GitHub: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Build errors?**
- Delete node_modules and .output folders
- Run `npm install` again
- Run `npm run build` again
