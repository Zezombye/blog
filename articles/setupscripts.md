---
aside: false
---

# My setup scripts

### [Windows 10](/windows-setup.ps1){target="_blank"}

- Sets the color theme of CMD/PowerShell/Git Bash to be actually readable (based on VS Code's default theme) and font to Consolas
- Sets better prompts:
  - All prompts are colored
  - CMD/PowerShell prompts have an `§red§[Admin]`{hl} indicator, and a `§red§[SYSTEM]`{hl} indicator if the setup script is run as admin
  - PowerShell/Git Bash prompts display `§purple§user@hostname`{hl} if connected via SSH. Unfortunately, the CMD prompt can only display a `§purple§[SSH]`{hl} indicator without potential command injection
  - Powershell/Git Bash prompts display the Git branch name if not `master` or `main`
  - Powershell prompt now displays the path in the window title
- Sets accent color to blue, including title bar
- Sets Explorer to display file extensions, hidden files and system files
- Sets notepad++ to be the default editor for files without extensions as well as most common text files (feel free to suggest additional extensions)
- Sets the below `.bashrc` for Git Bash. Prompt has a `>` at the end to distinguish it from Linux

### [Linux (Bash)](/bashrc.sh){target="_blank"}

- Sets `globstar` (allows `**` in glob), `extglob` (allows extended glob matching such as `?(pattern)` or `*(pattern)`), and `dotglob` (allows globbing to match files starting with a dot)
- Modifies the prompt to display the Git branch name if not `master` or `main`
- Sets colors for `ls` and `grep`
- Adds `ll` alias
- Disables generation of `.pyc` files
- Displays headers and columns in sqlite CLI and sets the prompt color
- Vim modifications:
  - Set tab width to 4
  - Disable continuing comment when going on a new line (very annoying when pasting scripts)
  - Case insensitive search
  - Mouse support
  - Disable auto indent (messes up pasting)

Feel free to suggest additional modifications.
