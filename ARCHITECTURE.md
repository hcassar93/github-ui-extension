# Architecture Overview

## Current Architecture (v0.1.0)

### Components

```
┌─────────────────────────────────────┐
│     GitHub Website (DOM)            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Sidebar                     │  │
│  │  ┌────────────────────────┐ │  │
│  │  │ 📌 Pinned Repositories │ │  │
│  │  │  - Custom repo list    │ │  │
│  │  │  [Edit Button]         │ │  │
│  │  └────────────────────────┘ │  │
│  │                              │  │
│  │  Original GitHub Content     │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
           ▲
           │ Content Script Injection
           │
┌──────────┴──────────────────────────┐
│  Chrome Extension                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  content.ts                 │   │
│  │  - DOM manipulation         │   │
│  │  - Modal UI                 │   │
│  │  - Event handlers           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  background.ts              │   │
│  │  - Service worker           │   │
│  │  - (Future message bus)     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Chrome Storage API         │   │
│  │  - pinnedRepos: []          │   │
│  │  - projects: []             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Data Flow

1. **Page Load**
   - Content script injects on github.com pages
   - Loads pinned repos from Chrome Storage
   - Injects custom UI into GitHub's sidebar

2. **User Edits**
   - User clicks "Edit" button
   - Modal opens with current repos
   - User adds/removes repos
   - Saves to Chrome Storage
   - Page reloads to show changes

3. **Storage Format**
   ```typescript
   {
     pinnedRepos: [
       { owner: 'facebook', name: 'react' },
       { owner: 'microsoft', name: 'vscode' }
     ],
     projects: [] // Future feature
   }
   ```

## Future Architecture (CLI Integration)

### Phase 2: Local Message Bus

```
┌─────────────────────────────────────┐
│  Chrome Extension                   │
│  ┌─────────────────────────────┐   │
│  │  background.ts              │   │
│  │  - WebSocket Client         │   │
│  │  - Message Router           │   │
│  └──────────┬──────────────────┘   │
└─────────────┼───────────────────────┘
              │
              │ WebSocket (ws://localhost:9876)
              │
┌─────────────┴───────────────────────┐
│  Local Node.js Service              │
│  (CLI Process)                      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  WebSocket Server           │   │
│  │  - Handles extension msgs   │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────┴──────────────────┐   │
│  │  Command Router             │   │
│  │  - Parse commands           │   │
│  │  - Execute operations       │   │
│  └──────────┬──────────────────┘   │
│             │                       │
│  ┌──────────┼──────────────────┐   │
│  │  Integrations               │   │
│  │  ├─ GitHub CLI (gh)         │   │
│  │  ├─ Git Operations          │   │
│  │  └─ AI Coding Agents        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Message Protocol (Future)

```typescript
// Extension → CLI
{
  type: 'COMMAND',
  payload: {
    action: 'list-repos',
    params: { org: 'facebook' }
  }
}

// CLI → Extension
{
  type: 'UPDATE',
  payload: {
    repos: [...],
    source: 'gh-cli'
  }
}

// Agent → Extension (via CLI)
{
  type: 'NOTIFICATION',
  payload: {
    message: 'PR created in repo X',
    action: 'pin-repo',
    repo: { owner: 'x', name: 'y' }
  }
}
```

## Design Principles

1. **Simple First**: Start with essential features, iterate based on usage
2. **No External Services**: Everything runs locally for privacy
3. **GitHub Native**: Use GitHub's design system and patterns
4. **Extensible**: Architecture supports future enhancements without rewrites
5. **Open Source**: All code is auditable and modifiable

## Technology Choices

- **WXT Framework**: Modern web extension development with TypeScript
- **Vanilla TS**: No heavy frameworks, keeps bundle small
- **Chrome Storage API**: Simple, built-in persistence
- **Future WebSocket**: Standard protocol for CLI communication
- **GitHub CSS Variables**: Automatic theme compatibility

## File Structure

```
github-ui-extension/
├── entrypoints/
│   ├── content.ts       # Main UI injection & interaction logic
│   └── background.ts    # Service worker (future message bus)
├── public/              # Static assets (icons, etc.)
├── .output/             # Built extension files (git ignored)
│   └── chrome-mv3/      # Chrome extension output
├── wxt.config.ts        # Extension configuration
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript config
├── README.md            # Main documentation
├── INSTALL.md           # Installation guide
├── ARCHITECTURE.md      # This file
└── LICENSE              # MIT License
```

## Future Enhancements

### Phase 2: Enhanced UI
- Project grouping
- Drag-and-drop reordering
- Custom icons/colors
- Quick search

### Phase 3: CLI Integration
- Local WebSocket server
- GitHub CLI commands
- Real-time updates
- Git status indicators

### Phase 4: Agent Integration
- Copilot message bus
- Automated pinning
- PR/Issue notifications
- Smart suggestions
