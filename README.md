# GitHub UI Extension

Make GitHub's homepage actually usable. Pin your most-used repos, customize the sidebar, and stop wasting time navigating.

**Built with plain HTML, CSS, and JavaScript. No frameworks, no auth, no bullshit.**

## Features

- ✅ Pin repositories to the sidebar
- ✅ Quick access with one click
- ✅ Simple edit modal
- ✅ Uses GitHub's native styling
- ✅ Works on any browser (Chrome, Firefox, Edge, etc.)

## Installation

This is for personal use - just load it unpacked.

### 1. Clone and Build

```bash
git clone https://github.com/haydencassar/github-ui-extension.git
cd github-ui-extension
npm install
npm run build
```

### 2. Load in Your Browser

**Chrome/Edge:**
1. Go to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `.output/chrome-mv3` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in the `.output/firefox-mv2` folder

### 3. Use It

1. Go to github.com
2. Look for "📌 Pinned Repositories" in the left sidebar
3. Click "Edit" and add repos like: `facebook/react`, `microsoft/vscode`
4. Done!

## Updating

```bash
git pull
npm run build
# Reload extension in browser
```

## Development

```bash
npm run dev              # Chrome with hot reload
npm run dev:firefox      # Firefox with hot reload
```

## Future Plans

- CLI message bus for local process integration
- Project grouping
- Drag-and-drop reordering
- Integration with coding agents

## Tech

- **Framework:** [WXT](https://wxt.dev) - Cross-platform web extension framework
- **Languages:** Plain JavaScript, HTML, CSS
- **Storage:** Browser Storage API
- **No dependencies, no auth, no tracking**

## License

MIT - Do whatever you want with it.

---

Built out of frustration with GitHub's UI. Open source because why not.

## Usage

1. **Visit GitHub.com** - The extension only activates on GitHub pages
2. **Look for the "📌 Pinned Repositories" section** in the left sidebar
3. **Click "Edit"** to add repositories in the format: `owner/repo` (e.g., `facebook/react`)
4. **Save** - Your pinned repos will appear and persist across sessions

## Architecture

The extension is built with [WXT](https://wxt.dev), a modern web extension framework that provides:
- ✅ Cross-browser compatibility (Chrome, Firefox, Edge, etc.)
- ✅ TypeScript support
- ✅ Hot reload during development
- ✅ Optimized builds

### Project Structure

```
github-ui-extension/
├── entrypoints/
│   ├── content.ts       # Main content script (UI injection)
│   └── background.ts    # Background service worker (future message bus)
├── public/              # Static assets (icons, etc.)
├── wxt.config.ts        # WXT configuration
├── package.json
└── README.md
```

### Future Architecture: CLI Integration

The extension is designed to support a local message bus for CLI integration:

```
┌─────────────────────┐
│  Chrome Extension   │
│  (UI Layer)         │
└──────────┬──────────┘
           │
           │ Message Bus (WebSocket/Native Messaging)
           │
┌──────────┴──────────┐
│  Local CLI Process  │
│  (Node.js Service)  │
└──────────┬──────────┘
           │
           ├─── GitHub CLI (gh)
           ├─── Git Operations
           └─── AI Coding Agents
```

This will enable:
- Programmatic repo management via CLI
- Real-time updates from git operations
- Integration with coding agents (GitHub Copilot, etc.)
- Automated workflow triggers

## Development

### Tech Stack
- **Framework**: [WXT](https://wxt.dev) - Next-gen web extension framework
- **Language**: TypeScript
- **Storage**: Chrome Storage API
- **Styling**: Inline styles using GitHub's CSS variables

### Building for Production

```bash
# Chrome
npm run build
npm run zip

# Firefox
npm run build:firefox
npm run zip:firefox
```

### Code Style
- Keep it simple and readable
- Use TypeScript for type safety
- Follow GitHub's design patterns
- Minimal dependencies

## Contributing

Contributions welcome! This is an open-source project built to make GitHub better for everyone.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy & Security

- ✅ **Open Source**: All code is public and auditable
- ✅ **No Data Collection**: Zero analytics or tracking
- ✅ **Local Storage Only**: All data stays in your browser
- ✅ **Minimal Permissions**: Only requests necessary GitHub access
- ✅ **No External Servers**: Everything runs locally

## License

MIT License - See [LICENSE](LICENSE) file for details

## Roadmap

### v0.2.0 - Enhanced UI
- [ ] Project grouping functionality
- [ ] Drag-and-drop reordering
- [ ] Custom icons/colors per repo

### v0.3.0 - CLI Integration
- [ ] Local WebSocket server
- [ ] GitHub CLI integration
- [ ] Command-line repo management

### v0.4.0 - Advanced Features
- [ ] Coding agent message bus
- [ ] Real-time git status
- [ ] Branch/PR indicators

### v1.0.0 - Stable Release
- [ ] Chrome Web Store publication
- [ ] Firefox Add-ons publication
- [ ] Full documentation
- [ ] Video tutorials

## Support

Found a bug? Have a feature request? 

- **Issues**: [GitHub Issues](https://github.com/haydencassar/github-ui-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/haydencassar/github-ui-extension/discussions)

## Acknowledgments

Built with frustration and coffee ☕ because GitHub's default UI needed some love.

---

**Made by developers, for developers.** Let's make GitHub usable again! 🚀
