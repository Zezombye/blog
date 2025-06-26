---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Zezombye's Blog"
  #text: ""
  tagline: "Programming, self-improvement, and various stuff"
  #actions:
  #  - theme: brand
  #    text: OverPy
  #    link: /overpy
  #  - theme: alt
  #    text: API Examples
  #    link: /api-examples

features:
  - title: "OverPy"
    details: "Creating a programming language to make the Overwatch Workshop usable"
    link: "/overpy"
    icon:
      src: "/overpy-hero.svg"

  - title: "OverWordle"
    details: "Pushing the Overwatch Workshop to its limits by making a multiplayer Wordle"
    link: "/overwordle"
    icon:
      src: "/overwordle-hero.png"

  - title: "Workshop shenanigans"
    details: "Exploiting the Overwatch Workshop with Unicode tricks to bypass sanitization"
    link: "/workshop-shenanigans"
    icon:
      src: "/workshop-shenanigans-hero.png"

  - title: "Why the purpose of life is happiness"
    details: "A philosophical essay and a tutorial on introspection"
    link: "/purpose"
    icon:
      src: "/purpose-hero.jpeg"

  - title: "\"What's the best move on the board?\""
    details: "The mindset that is required to win"
    link: "/best-move"
    icon:
      src: "/best-move-hero.png"


  - title: "Why I view relationships like a business"
    details: "The way to avoid ending up like the 80%"
    link: "/relationships"
    icon:
      src: "/relationships-hero.jpg"
---

## Other stuff

### Games I've made:
  - [Sokoban](/sokoban)
  - [Chariot Wars](/chariotwars) for an Ancient Rome themed jam

### My setup scripts:

#### [Windows 10](/windows-setup.ps1){target="_blank"}

- Sets the color theme of CMD/PowerShell/Git Bash to be actually readable (based on VS Code's default theme) and font to Consolas
- Sets better prompts:
  - All prompts are colored, but differently, to help distinguish between CMD/PowerShell/Git Bash
  - CMD/PowerShell prompts have an `§red§[Admin]`{hl} indicator, and a `§red§[SYSTEM]`{hl} indicator if the setup script is run as admin
  - PowerShell/Git Bash prompts display `user@hostname` if connected via SSH. Unfortunately, the CMD prompt can only display a `[SSH]` indicator without potential command injection
  - Powershell/Git Bash prompts display the Git branch name if not `master` or `main`
  - Powershell prompt now displays the path in the window title

- Sets accent color to blue, including title bar
- Sets Explorer to display file extensions, hidden files and system files
- Sets notepad++ to be the default editor for files without extensions as well as most common text files (feel free to suggest additional extensions)
- Sets the below `.bashrc` for Git Bash

#### [Linux (Bash)](/bashrc.sh){target="_blank"}

- Sets `globstar` (allows `**` in glob), `extglob` (allows extended glob matching such as `?(pattern)` or `*(pattern)`), `dotglob` (allows globbing to match files starting with a dot), and `failglob` (if doing `ls *nomatch*`, it will cause an error instead of passing `*nomatch*` to `ls`)
- Modifies the prompt to display the Git branch name if not `master` or `main`
- Sets colors for `ls` and `grep`
- Adds `ll` alias
- Disables generation of `.pyc` files
- Displays headers and columns in sqlite CLI
- Vim modifications:
  - Set tab width to 4
  - Disable continuing comment when going on a new line (very annoying when pasting scripts)
  - Case insensitive search
  - Mouse support

Feel free to suggest additional modifications.

## Social media

- [Twitter](https://x.com/zezombye)
- [Youtube](https://youtube.com/@Zezombye)
- [GitHub](https://github.com/Zezombye)
