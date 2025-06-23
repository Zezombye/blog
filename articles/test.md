---
defaultHighlightLang: js
---

<script setup>
import ChessProblem from "../components/ChessProblem.vue"

</script>

The bits marked with `§blue§x`{hl} are then retrieved and concatenated together to form the final number. For example:
- The “ඞ” character is the number `0x0D9E`, which in binary is `1101 1001 1110`{txt}
- The UTF-8 binary representation of it is `1110§blue§0000 §reset§10§blue§110110 §reset§10§blue§011110`{hl}
- This yields `0000 1101 1001 1110`{txt} which is indeed the number in Unicode
- `some §red§red§reset§ text`{hl}

<ChessProblem fen="4k1N1/1p6/2p1Kp2/p1B5/2n5/8/P7/8 w - - 0 57" moves="Be7 Nd6 Nxf6" caption="White to play and win"/>

Sacrifice problem:

<ChessProblem fen="1kr4r/ppp5/4Nbn1/8/B7/5pPq/5P2/1Q3RK1 w - - 0 1" moves="Qxb7 Kxb7 Rb1 Ka6 Nc5 Ka5 Rb5" :captions="['Material advantage: -7.\nBlack threatens checkmate', 'Material advantage: -15??\n ', 'Black\'s not feeling good\n ', 'Mate in 1\n ', 'Victory requires sacrifice :)\n ']"/>

```
# Wait until the startFacing action applies and the player's angle has been set to one of the three values.
# Because of precision errors, we round to the hundredth.
waitUntil(round(eventPlayer.getHorizontalFacingAngle()*100)/100 in [30, 60, 90], 15)

if if round(eventPlayer.getHorizontalFacingAngle()*100)/100 == 30:
        eventPlayer.kbLayout = KbLayout.AZERTY
        eventPlayer.kbLayout = KbLayout.AZERTY
elif round(eventPlayer.getHorizontalFacingAngle()*100)/100 == 60:
    eventPlayer.kbLayout = KbLayout.QWERTZ
else:
    eventPlayer.kbLayout = KbLayout.QWERTY
```
```
# some very long commnet ijofdmsq ijofq iojqfsio jdmijfo qisdmjo fimoqsjdf mioqsjfimo qsiodfmj omsiqdjf miosqsoidj fmq
No indent {
    #some very long comment fdsqpoijfdsq iojpdsqf fpoidjsdfqpoi jsqpiodjf ipojdifpojq piodfpoi jdsqpidofjs fpdisoqjdsfqpio

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
