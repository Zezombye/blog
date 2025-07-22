# Refuting Pascal's Wager

Pascal's wager is among the most well known arguments regarding religion. Put forward by Blaise Pascal in the 17th Century to defend Christianity, it is extremely straightforward, to the point many people came up with it independently:

- If God exists, and you believe, you go to Heaven (eternity of pleasure); but if you don't believe, you go to Hell (eternity of pain).
- If God doesn't exist, and you believe, you waste your time believing and doing actions (prayer, fasting, etc) for nothing; but if you don't believe, you lose nothing.

The crucial part is that, if God doesn't exist, you can only have finite gains or losses; whereas if God exists, you stand to have an eternity of pain if you disbelieve, whereas you are rewarded with an eternity of pleasure if you believe.

The decision matrix runs as follows:

| |God exists|God does not exist|Total|
|-:|:----------:|:------------------:|:-----:|
|You believe|Infinite gain|Finite loss|+∞|
|You don't believe|Infinite loss|Finite gain|−∞|

As adding or subtracting a finite number in regards to infinity does not do anything, the only column that matters is the "God exists" one, which would clearly make believing in God the rational choice.

## The set of all religions

The first and obvious counter-argument is that there isn't just one religion; as I show in [this essay](/noproof#the-just-in-case-argument), there are three religions today having exclusivity of belief and Hell for non-believers (Christianity, Islam, Mormonism). Still, if you believe in, say, Christianity, a 33% chance of escaping Hell is better than a 0% chance if you are an atheist.

Let us first define the argument mathematically.

Let $R_0$ be Christianity, $G_0$ the Christian God, $E(G_0)$ the hypothesis that the Christian God exists, and $B_0$ the belief in Christianity. The negation operator ¬ will be used to denote an opposite: $\overline{B_0}$ is a non-belief in Christianity and $\overline{E(G_x)}$ is the hypothesis that the Christian God doesn't exist.

The decision matrix becomes the following:

| |$E(G_0)$|$\overline{E(G_0)}$|Total|
|:-:|:----------:|:------------------:|:-----:|
|$B_0$|$0$|$-C$|$-C$|
|$\overline{B_0}$|$−∞$|$+C$|$−∞$|

Where $C$ is a constant (and thus irrelevant in regards to infinity).

Let $R$ be the set of all religions $\{R_0,\ R_1,\ \cdots,\ R_n\}$, where $R_x$ has the following properties for any $x$:

- $R_x$ defines an afterlife with a Hell, which is eternal torture (represented as $-\infty$ gain). For the purposes of this essay, we will assume there is no Heaven.
- $R_x$ has defined a set of criterias that must be met for a belief ($B_x$) in it. That religion states that, if that belief is respected ($B_x$ is true), the soul will cease to exist (gain of 0); if that belief is not respected, the soul will go to Hell.
- $R_x$ has an exclusivity clause; it states that it is not possible to believe in $R_x$ and in any other religion in $R$ at the same time. One can only believe in at most one of the religions in $R$.
- $R_x$ defines a God ($G_x$), who will, according to the religion, oversee the process of "judgement" in the afterlife: putting the soul into Hell, or make it cease to exist, according to whether the soul held the belief $B_x$. Note that actions can also count as necessary for belief (eg, a religion can define belief as doing 5 prayers per day; a soul who would only do 4 per day, despite genuinely believing in $G_x$, would still go to Hell).
- $E(G_x)$ is the possibility that $R_x$ is true and $G_x$ exists, where $P(E(G_x)) > 0$ (in normal terms, there is a non-zero chance that $R_x$ is true).

Taking $R_0$ to be Christianity, $R_1$ to be Islam, and $R_2$ to be Mormonism, we get the following decision matrix if we only consider the set of those three religions, where $\overline{E}$ denotes the possibility that none of the Gods exist, and $\overline{B}$ denotes the belief in no God (atheism):

|     |$E(G_0)$|$E(G_1)$|$E(G_2)$|$\overline{E}$|Total|
|:----:|:---:|:---:|:---:|:---:|:---:|
|$B_0$|$0$|$-∞$|$-∞$|$-C$|$-∞$|
|$B_1$|$−∞$|0|$−∞$|$-C$|$-∞$|
|$B_2$|$−∞$|$-∞$|0|$-C$|$-∞$|
|$\overline{B}$|$−∞$|$−∞$|$−∞$|$+C$|$−∞$|

Well, it looks like we're doomed no matter what we do. But doing math with infinities is pretty hard, and it contradicts the intuitive view: it is better to believe in one of $R_{\{0,1,2\}}$ than to not believe at all, as believing gives us *some* chance of escaping Hell.

To get around that, some nerds smarter than me came up with [ordinal numbers](https://en.wikipedia.org/wiki/Ordinal_number), which is a way of doing math with infinities. If we postulate that Hell would yield $-\omega$ gain, where $\omega$ represents all natural numbers (infinity, for normal people), we get:


|     |$E(G_0)$|$E(G_1)$|$E(G_2)$|$\overline{E}$|Total|
|:----:|:---:|:---:|:---:|:---:|:---:|
|$B_0$|$0$|$-\omega$|$-\omega$|$-C$|$-2\omega-C$|
|$B_1$|$−\omega$|0|$−\omega$|$-C$|$-2\omega-C$|
|$B_2$|$−\omega$|$-\omega$|0|$-C$|$-2\omega-C$|
|$\overline{B}$|$−\omega$|$−\omega$|$−\omega$|$+C$|$−3\omega+C$|

This is congruent with the intuitive result: on average, believing in any of those three religions would yield $-2\omega-C$ gain, but not believing in any would yield $-3\omega+C$. Therefore, believing is the best choice.

Even when considering all religions, we would get $-(n-1)\cdot\omega-C$ gain if we believe in one, but $-n\cdot\omega+C$ if we stay an atheist, which would still make disbelief be disadvantageous.

## The evil Gods

Although one could argue the size of $R$ is infinite, as a holy book can theoretically have an infinite number of words, our universe is very finite and so are our human lives. (If our human lives were infinite, then the concept of an "afterlife" would be undefined and thus irrelevant for this essay.)

What makes religions unique between each other is the actions they make us take. If two religions would make us take the exact same sequence of actions during our finite life (speaking, such as saying "I believe in this God", is considered an action), then for all intents and purposes they are the same religion.

Therefore, $R$ is finite (this will make calculations easier later on).

What we must consider is that a religion is defined by its holy book, and it may not be the truth; we ought to postulate the existence of "evil Gods", for whom lying is a possibility.

For each $R_x$, having a god $G_x$ sending souls to Hell if they do not meet $B_x$ and making them cease to exist if they do meet $B_x$, we can postulate that the God of $R_x$ is actually the opposite (represented as $\overline{G_x}$): sending souls to Hell if they *do* meet $B_x$, making them cease to exist otherwise. In other words, God could be a shy teenager and would punish you for worshipping him.

The decision matrix thus becomes (taking only $R_0$ and $R_1$ to not make the table too wide):

|              |$E(G_0)$ |$E(\overline{G_0})$|$E(G_1)$ |$E(\overline{G_1})$|$\overline{E}$|Total|
|:------------:|:-------:|:-----------------:|:-------:|:-----------------:|:------------:|:---:|
|$B_0$         |$0$      |$-\omega$          |$−\omega$|$-C$               |$-C$          |$-2\omega-2C$|
|$B_1$         |$−\omega$|$-C$               |0        |$−\omega$          |$-C$          |$-2\omega-2C$|
|$\overline{B}$|$−\omega$|$+C$               |$−\omega$|$+C$               |$+C$          |$−2\omega+2C$|

Something interesting happens: since atheists are punished by $G_x$ and believers are punished by $\overline{G_x}$, believers get no advantage in the infinity department, and it all comes down to the earthly life gains, where atheists win.

## The equal probabilities

The keen reader has possibly noticed that, in the previous sections, we have assumed that an evil God has the same probability of existing as a good God; that is, $P(E(G_x)) = P(E(\overline{G_x}))$.

rewrite to only have one religion

define evil/good god

- example with blue/Red balls
- example with cats vs pitbulls: you are invited to a party in pitbull city vs cat city, so in a third city you odn't know the proportions of cats vs pitbulls
- is God a cat, or a pitbull? Eg if 99% of gods are evil, then it stands that God is more likely to be evil

## The sizes of infinities
