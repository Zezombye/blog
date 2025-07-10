# .bashrc version ###DATE###
# curl zez.dev -Lo .bashrc
# wget zez.dev -O .bashrc

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac


HISTCONTROL=ignoreboth # don't put duplicate lines or lines starting with space in the history
shopt -s histappend # append to the history file, don't overwrite it

HISTSIZE=1000
HISTFILESIZE=2000

shopt -s checkwinsize # check the window size after each command and, if necessary, update the values of LINES and COLUMNS.
shopt -s globstar #allow ** in glob
shopt -s extglob #allow extended glob matching such as ?(pattern), *(pattern), etc
shopt -s dotglob #allow globbing to match hidden files (files starting with a dot)

#disable as it causes problems with scp autocompletion
#shopt -s failglob #if doing ls *nomatch*, it will cause an error instead of passing "*nomatch*" to ls

# set variable identifying the chroot you work in (used in the prompt below)
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
    debian_chroot=$(cat /etc/debian_chroot)
fi

prompt_get_git_branch() {
    title=$1
    _PROMPT_CURRENT_GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [[ $_PROMPT_CURRENT_GIT_BRANCH == "HEAD" ]]; then
        #If checking out a specific commit, we need to use --short
        _PROMPT_CURRENT_GIT_BRANCH=$(git rev-parse --short HEAD 2>/dev/null)
    fi
    if [[ ! -z $_PROMPT_CURRENT_GIT_BRANCH && $_PROMPT_CURRENT_GIT_BRANCH != "main" && $_PROMPT_CURRENT_GIT_BRANCH != "master" ]]; then
        if [[ $title == "true" ]]; then
            _PROMPT_CURRENT_GIT_BRANCH="($_PROMPT_CURRENT_GIT_BRANCH)"
        fi
        _PROMPT_CURRENT_GIT_BRANCH=" $_PROMPT_CURRENT_GIT_BRANCH"
    else
        _PROMPT_CURRENT_GIT_BRANCH=""
    fi
    echo "$_PROMPT_CURRENT_GIT_BRANCH"
}

prompt_get_mingw64() {
    title=$1
    if [[ "$MSYSTEM" == "MINGW64" ]]; then
        if [[ $title == "true" ]]; then
            echo " - MINGW64"
        elif [[ -z "$SSH_CONNECTION" ]]; then
            echo "MINGW64"
        else
            echo " MINGW64"
        fi
    else
        echo ""
    fi
}

prompt_display_user_hostname() {
    # Display user@hostname, unless we are in mingw64 (git bash) and not in ssh
    if [[ "$MSYSTEM" == "MINGW64" && -z "$SSH_CONNECTION" ]]; then
        return 1
    else
        return 0
    fi
}

if [[ $MSYSTEM == "MINGW64" ]]; then
    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;35m\]$(prompt_display_user_hostname && echo "\u@\h " || echo '')\[\033[0m\033[92m\]MINGW64\[\033[0m\] \[\033[01;34m\]\w\[\033[01;36m\]$(prompt_get_git_branch)\[\033[00m\]\$ '
else

    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[0m\]:\[\033[01;34m\]\w\[\033[01;35m\]$(prompt_get_git_branch)\[\033[00m\]\$ '
fi

# If this is an xterm set the title to user@host: dir <branch>
case "$TERM" in
xterm*|rxvt*)
    PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\$(prompt_display_user_hostname && echo '\u@\h: ' || echo '')\w\$(prompt_get_git_branch true)\$(prompt_get_mingw64 true)\a\]$PS1"
    ;;
*)
    ;;
esac

# enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias dir='dir --color=auto'
    alias vdir='vdir --color=auto'

    alias grep='grep --color=auto'
    alias fgrep='fgrep --color=auto'
    alias egrep='egrep --color=auto'
fi

# colored GCC warnings and errors
export GCC_COLORS='error=01;31:warning=01;35:note=01;36:caret=01;32:locus=01:quote=01'

alias ll='ls -laF'

if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

# enable programmable completion features
if ! shopt -oq posix; then
    if [ -f /usr/share/bash-completion/bash_completion ]; then
        . /usr/share/bash-completion/bash_completion
    elif [ -f /etc/bash_completion ]; then
        . /etc/bash_completion
    fi
fi

export PYTHONDONTWRITEBYTECODE=1

#Automatically display column names in sqlite cli and add color to the prompt
cat << EOF > ~/.sqliterc
--Note: this is automatically generated and overwritten by .bashrc
.headers ON
.mode columns
.prompt "[92msqlite[0m> " "[36m   ...[0m> ";
EOF

cat << EOF > ~/.vimrc
"Note: this is automatically generated and overwritten by .bashrc

"Syntax coloration
syntax on
"Load plugins based on file type
filetype on
"Display line numbers. Todo: too distracting.
"set number
"Inserts spaces when pressing the tab key
set expandtab
"Set tab width to 4 spaces
set tabstop=4
set softtabstop=4
set shiftwidth=4

"Do not continue comment when pressing Enter
autocmd FileType * set formatoptions-=cro

"Disable autoindent, as it messes up pasting
filetype indent off
set noautoindent
set nocindent
set nosmartindent
set indentexpr&

"Highlight matching brackets
set showmatch

"Case insensitive matching in search
set ignorecase
set smartcase
"Highlight search matches
set hlsearch

"Allow selecting with the mouse
set mouse=a

"The following is normally in debian.vim but it does not get sourced if vimrc exists

set nocompatible	" Use Vim defaults instead of 100% vi compatibility
set backspace=indent,eol,start	" more powerful backspacing
set history=50		" keep 50 lines of command line history
set ruler		" show the cursor position all the time
set nomodeline
" Suffixes that get lower priority when doing tab completion for filenames.
" These are files we are not likely to want to edit or read.
set suffixes=.bak,~,.swp,.o,.info,.aux,.log,.dvi,.bbl,.blg,.brf,.cb,.ind,.idx,.ilg,.inx,.out,.toc

" We know xterm-debian is a color terminal
if &term =~ "xterm-debian" || &term =~ "xterm-xfree86"
  set t_Co=16
  set t_Sf=[3%dm
  set t_Sb=[4%dm
endif

" Some Debian-specific things
if has('gui')
  " Must define this within the :if so it does not cause problems with
  " vim-tiny (which does not have +eval)
  function! <SID>MapExists(name, modes)
    for mode in split(a:modes, '\zs')
      if !empty(maparg(a:name, mode))
        return 1
      endif
    endfor
    return 0
  endfunction

  " Make shift-insert work like in Xterm
  autocmd GUIEnter * if !<SID>MapExists("<S-Insert>", "nvso") | execute "map <S-Insert> <MiddleMouse>" | endif
  autocmd GUIEnter * if !<SID>MapExists("<S-Insert>", "ic") | execute "map! <S-Insert> <MiddleMouse>" | endif
endif

" Set paper size from /etc/papersize if available (Debian-specific)
if filereadable("/etc/papersize")
  let s:papersize = matchstr(readfile('/etc/papersize', '', 1), '\p*')
  if strlen(s:papersize)
    exe "set printoptions+=paper:" . s:papersize
  endif
endif
EOF
