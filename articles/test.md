---
defaultHighlightLang: js
---

<script setup>
import ChessProblem from "../components/ChessProblem.vue"

</script>

```
# some very long commnet ijofdmsq ijofq iojqfsio jdmijfo qisdmjo fimoqsjdf mioqsjfimo qsiodfmj omsiqdjf miosqsoidj fmq
No indent {
    # some very long comment fdsqpoijfdsq iojpdsqf fpoidjsdfqpoi jsqpiodjf ipojdifpojq piodfpoi jdsqpidofjs fpdisoqjdsfqpio

    /* multiline comments should also properly get wrapped. dfsjmqosqdfifdsqmfosdqdfismoqdfsq
    fgdmgjfdsgsidfjgfdmjiogdf oimjsdmfgoijfdsmio sgiomjds oijfsdmoi jsdmoijgmsdfggfdsgfsdgfsdgfdgsdfgfdoijmgifoj */
    First indent {
        Second indent { # comments after code should also get wrapped qjomfissfidopj qsoijfd qosipdjf qsoipjfd qisopjfd qpiojsf
            Third indent, this is a very long line of code taht should not be wrapped [jqmiofiqfjfijom zarjiopzearji proijqz jprioz]
        }
    }
}
```

<ChessProblem fen="3r1r2/p4nkp/2p3p1/2n1p3/2B1P3/P1N5/6PP/3R1RK1 w - - 2 25" moves="Rxf7 Rxf7 Rxd8" caption="White to win in %moves%"/>

Normal  line
break

Url: https://zez.dev/overpy(owo)reza, (https://zez.dev/overpy(owo)reza)

Emoji: :) :100: soon:tm: 3 x 4

Typographic garbage: “quotes”, prime′, ‘apos’, dash u+2012 ‒ u+2013 – u+2014 — u+2015 ―, … ellipsis

- ***“quotes”***, prime′, ‘apos’, dash u+2012 ‒ u+2013 – u+2014 — u+2015 ―, … ellipsis

`“quotes”, prime′, ‘apos’, dash u+2012 ‒ u+2013 – u+2014 — u+2015 ―, … ellipsis`

```
“quotes”, prime′, ‘apos’, dash u+2012 ‒ u+2013 – u+2014 — u+2015 ―, … ellipsis
```

Inline code: `A = B*C+D`{scala} became `Set Global Variable(A, Add(Multiply(Global Variable(B), Global Variable(C)), Global Variable(D)))`{scala}.

Line breaks:

- `__assignTo__(__playerVar__(eventPlayer, power), __add__(__multiply__(__globalVar__(globalPower), __number__(1.5)), __number__(30)))`
- `[int(n) for n in "12.34|5.1|53.65|43.67|106.3".split("|")]`
- `["A string", "Une chaîne"][max(0, ["White", "Blanc"].index("{}".format(Color.WHITE)))]`

```
[
    #i[0] is the number, i.last() is the alphabet
    0.01 * i.last().strIndex(i[0].charAt(0))
    + 0.1 * i.last().strIndex(i[0].charAt(1))
    + 1 * i.last().strIndex(i[0].charAt(2))
    + 10 * i.last().strIndex(i[0].charAt(3))
    + 100 * i.last().strIndex(i[0].charAt(4))
    for i in [
        [n, "0123456789"] for n in "4321|005|5635|0034|03601".split("|")
    ]
]
```
