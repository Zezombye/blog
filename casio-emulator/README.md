A vibe coded monochrome Casio emulator. I just needed to port my own programs (chariotwars and sokoban) to display on this blog.

The prompt used was the following, with https://aistudio.google.com/prompts/new_chat:

```
Translate this C code to Typescript. Be as faithful as possible; the aim is to be able to run a diff on the C code and the TS code and to see as few differences as possible. This means you should also not change comments and spacing whenever possible. For example, x+6 must not become x + 6. Comments must not be changed. The code has no bugs in it, so you must not change the behavior. If encountering a function or a constant that is not defined within the code, assume it is defined elsewhere, and do not create the definition yourself, it will be added later. The GetKey and Sleep functions are async and must be prefixed with "await" (making the calling function async, which must itself be called with await, etc). The GetKey(&key) function is translated to key = GetKey() in TS. You can replace filenames in Bfile functions with strings.
```
