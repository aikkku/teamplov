# TEAM PLOV // CS2 TACTICAL SQUADRON

An ultra-slick, dark tactical Counter-Strike 2 squad roster and statistics dashboard built with React and Vite.

## Tactical Features
- **Design & Colors**: Military CS2 HUD brutalism with sharp angular corners (`border-radius: 0`), HUD brackets, scanlines, and the exact palette:
  - Tactical Sage Green: `#4A7B6F`
  - Off-White Text: `#EEEEE7`
  - Ice Cyan Highlight: `#CCDDDD`
  - Cool Slate: `#9EAEB3`
  - Gunmetal Dark Panels: `#242E35`
- **Dynamic CS2 Green Crosshair**: Authentic custom pointer with center dot, 4 ticks, and recoil bloom on click.
- **Slideshow Transitions**: Smooth slide snap between the Welcome Briefing and the 5-Man Roster.
- **5 Full-Height Vertical Tiles**: Equal width columns spanning the entire height of the screen with hover expansions.
- **Interactive Dossier Slide-to-Left**: Selecting any player smoothly pins their tile to the far left, collapses other operators, and reveals a detailed Leetify combat dossier on the right.
- **Leetify Public CS API (Matchmaking Only)**: Strict Steam matchmaking filtering (excluding Faceit/Renown), tracking Leetify rating, Aim, Positioning, Utility, Clutch, Reaction time, Preaim, and map match logs.
- **Web Audio SFX**: Crisp mechanical CS2 click and radio sound effects with mute toggle.

---

## Getting Started

### 1. Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Configure Teammates
Open `src/config/roster.js` to customize:
- Player nicknames
- Steam64 IDs
- Roles and callsigns
- Favorite weapons & tactical bios

Or click the **Settings Cog** in the navbar on the website to configure Steam64 IDs directly in the UI.

### 3. Deploy to GitHub Pages
1. Initialize a git repository and add your GitHub remote:
   ```bash
   git init
   git add .
   git commit -m "feat: Team Plov CS2 web application"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/teamplov.git
   git push -u origin main
   ```
2. Deploy to GitHub Pages with one command:
   ```bash
   npm run deploy
   ```
   In your repository settings on GitHub, ensure GitHub Pages source is set to the `gh-pages` branch.
