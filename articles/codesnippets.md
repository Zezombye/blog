# Code snippets & References

## ASCII Table

![](workshop-shenanigans/ascii_table.png)

## HTML/CSS

### Give scrollbar to child div instead of parent div

https://stackoverflow.com/a/49107669/4851350

```css
.wrapper {
  display: flex;
  flex-direction: column;
}

.scrollable-child {
  overflow-y: auto;
}
```
