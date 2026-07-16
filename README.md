# Grok Build Companion (Grok-Space)

An interactive, premium web application designed to explore, custom-theme, and audit the data plane privacy settings of SpaceXAI's open-source **Grok Build** (`grok-build`) terminal coding agent.

## Features

1.  🎨 **Interactive TUI Theme Playground**: Customize Grok Build colors using presets or fine-grained color sliders. Real-time updates mock a live Grok TUI terminal session, exporting directly to a clean TOML configuration file you can paste into your local configurations.
2.  🛡️ **Data Plane Privacy Auditor**: Visualizes client data transit pathways (Mixpanel telemetry, SpaceXAI cloud storage API, local SQLite journal caches). Interactive switches (Opt-out, ZDR) showcase fail-closed logic and safety boundaries directly mapped from the Rust source code.
3.  🕸️ **Workspace Codebase Graph**: Displays file dependencies and topology as an interactive 2D node-link diagram to explain how Grok handles directory traversal, ignored items (`.gitignore`), and canary tokens.

## Running Locally

To start the companion on your machine, simply serve the directory with a static web server:

**Using Python:**
```bash
python -m http.server 8080
```

**Using Node (http-server):**
```bash
npx http-server -p 8080
```

Then open your browser to [http://localhost:8080](http://localhost:8080).

## Hosting / Deployment (Option A)

This is a fully static client-side web application. You can host it for **free** in less than 2 minutes:

### Deploying to GitHub Pages
1. Push this folder to a public GitHub repository.
2. Go to the repository **Settings** -> **Pages**.
3. Under *Build and deployment*, set the source to **Deploy from a branch** and select `main` (or root).
4. Save, and GitHub will provide a free public URL (e.g., `https://username.github.io/repo-name`).

### Deploying to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside this directory and follow the prompts.
3. Your app will be live instantly!

## Sponsorship & Donations
To collect donations or tips:
1. Open `index.html`.
2. The button on line 53 is currently configured to send PayPal donations to `bloddolo@outlook.it`.
3. If you want to change it, locate the `<a href="..." ...>` tag and replace it with your own PayPal, BuyMeACoffee, or GitHub Sponsors link!


## License
MIT / Apache 2.0
