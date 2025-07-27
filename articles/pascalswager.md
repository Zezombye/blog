# Refuting Pascal's Wager

Pascal's wager is among the most well known arguments regarding religion. Put forward by Blaise Pascal in the 17th century to defend Christianity, it is extremely straightforward, to the point that many people came up with it independently:

- If God exists, and you believe, you go to Heaven (eternity of pleasure); but if you don't believe, you go to Hell (eternity of pain).
- If God doesn't exist, and you believe, you waste your time believing and doing actions (prayer, fasting, etc) for nothing; but if you don't believe, you lose nothing.

The crucial part is that, if God doesn't exist, you can only have finite gains or losses; whereas if God exists, you wager an eternity of pain against an eternity of pleasure.

The decision matrix runs as follows:

| |God exists|God doesn't exist|Expected<br>gain|
|-:|:----------:|:------------------:|:-----:|
|You believe|Infinite gain|Finite loss|+∞|
|You don't believe|Infinite loss|No gain or loss|−∞|

As adding or subtracting a finite number relative to infinity does not do anything, the only column that matters is the "God exists" one, which would clearly make believing in God the rational choice.

## The set of all religions

The first and obvious counter-argument is that there isn't just one religion; as I show in [this essay](/noproof#the-just-in-case-argument), there are three major religions today claiming exclusivity of belief and Hell for non-believers (Christianity, Islam, Mormonism). Still, if you believe in, say, Christianity, a 33% chance of escaping Hell is better than a 0% chance if you are an atheist.

Let us first define the argument mathematically. For the purposes of this essay, we will assume there is no Heaven, in order to make the calculations less complex (as the argument and its refutation still work without it).

Let $R_0$ be Christianity, $G_0$ the Christian God, $E(G_0)$ the hypothesis that the Christian God exists, and $B_0$ the belief in Christianity. The overline operator will be used to denote an opposite: $\overline{B_0}$ is a non-belief in Christianity and $\overline{E(G_0)}$ is the hypothesis that the Christian God doesn't exist.

The decision matrix becomes the following:

| |$E(G_0)$|$\overline{E(G_0)}$|Expected<br>gain|
|:-:|:----------:|:------------------:|:-----:|
|$B_0$|$-C$|$-C$|$-C$|
|$\overline{B_0}$|$−∞$|$0$|$−∞$|

Where $C$ is a constant (and thus irrelevant in regards to infinity).

Note that the expected gain is calculated based on the probabilities for $E(G_0)$ and $\overline{E(G_0)}$, hence why believing yields $-C$ and not $-2C$ (probabilities add up to 1). Additionally, changing the probabilities doesn't change the final result (we assume a non-zero probability for both columns). In other words, even if there is a 0.000001% chance of the Christian God existing, it would be better to believe.

Let $R$ be the set of all religions $\{R_0,\ R_1,\ \cdots,\ R_n\}$, where $R_x$ has the following properties for any $x$:

- $R_x$ defines an afterlife with a Hell, which is eternal torture (represented as $-\infty$ gain).
- $R_x$ has defined a set of criterias that must be met for a belief ($B_x$) in it. That religion states that, if that belief is respected ($B_x$ is true), the soul will cease to exist (gain of 0); if that belief is not respected, the soul will go to Hell.
- $R_x$ has an exclusivity clause; it states that it is not possible to believe in $R_x$ and in any other religion in $R$ at the same time. One can only believe in at most one of the religions in $R$.
- $R_x$ defines a God ($G_x$), who will, according to the religion, oversee the process of "judgement" in the afterlife: putting the soul into Hell, or make it cease to exist, according to whether the soul held the belief $B_x$. Note that actions can also count as necessary for belief (eg, a religion can define belief as doing 5 prayers per day; a soul who would only do 4 per day, despite genuinely believing in $G_x$, would still go to Hell).
- $E(G_x)$ is the possibility that $R_x$ is true and $G_x$ exists, where $0 < P(E(G_x)) < 1$. In normal terms, there is a non-zero chance that $R_x$ is true, but not 100%, as the whole point of this argument is about religions which cannot be proved nor refuted.

Taking $R_0$ to be Christianity, $R_1$ to be Islam, and $R_2$ to be Mormonism, we get the following decision matrix if we only consider the set of those three religions, where $\overline{E}$ denotes the possibility that none of the Gods exist, and $\overline{B}$ denotes the belief in no God (atheism):

|     |$E(G_0)$|$E(G_1)$|$E(G_2)$|$\overline{E}$|Expected<br>gain|
|:----:|:---:|:---:|:---:|:---:|:---:|
|$B_0$|$-C$|$-∞$|$-∞$|$-C$|$-∞$|
|$B_1$|$−∞$|$-C$|$−∞$|$-C$|$-∞$|
|$B_2$|$−∞$|$-∞$|$-C$|$-C$|$-∞$|
|$\overline{B}$|$−∞$|$−∞$|$−∞$|$0$|$−∞$|

Well, it looks like we're doomed no matter what we do. But doing math with infinities is pretty hard, and it contradicts the intuitive view: it is better to believe in one of $R_{\{0,1,2\}}$ than to not believe at all, as believing gives us *some* chance of escaping Hell.

To get around that, mathematicians came up with [hyperreal numbers](https://en.wikipedia.org/wiki/Hyperreal_number), which is a way of doing math with infinities. If we postulate that Hell would yield $-\omega$ gain, where $\omega$ is a hyperreal number (greater than any finite number), and assume equal probability for each column, we get:


|     |$E(G_0)$|$E(G_1)$|$E(G_2)$|$\overline{E}$|Expected gain|
|:----:|:---:|:---:|:---:|:---:|:---:|
|$B_0$|$-C$|$-\omega$|$-\omega$|$-C$|$-\frac{2}{4}\omega-\frac{2}{4}C$|
|$B_1$|$−\omega$|$-C$|$−\omega$|$-C$|$-\frac{2}{4}\omega-\frac{2}{4}C$|
|$B_2$|$−\omega$|$-\omega$|$-C$|$-C$|$-\frac{2}{4}\omega-\frac{2}{4}C$|
|$\overline{B}$|$−\omega$|$−\omega$|$−\omega$|$0$|$−\frac{3}{4}\omega$|

This is congruent with the intuitive result: on average, believing in any of those three religions would yield $-\frac{2}{4}\omega-\frac{2}{4}C$ gain, but not believing in any would yield $−\frac{3}{4}\omega$, and the overall result ($B_x > \overline{B}$) wouldn't change no matter what probabilities we assign to each column (as all are non-zero). Therefore, believing would be the best choice.

Even when considering all religions, believing would still get us a better chance of avoiding Hell than non-believing. The "argument from inconsistent revelations", as it is called, is thus not enough to refute Pascal's wager; we must think outside the box.

## The evil Gods

What we must consider is that a religion is defined by its holy book, and it may not be the truth; we ought to postulate the existence of "evil Gods", for whom lying is a possibility.

For each $R_x$, having a god $G_x$ sending souls to Hell if they do not meet $B_x$ and making them cease to exist if they do meet $B_x$, we can postulate that the God of $R_x$ is actually the opposite (represented as $\overline{G_x}$): sending souls to Hell if they *do* meet $B_x$, making them cease to exist otherwise. In other words, God could be a shy teenager who would punish you for worshipping him.

This isn't far-fetched, as many religions assume the existence of Satan or a similar God-tier evil entity. And as [this essay](https://infidels.org/library/modern/richard-carrier-heaven/) argues, this could also be the work of a good entity.

For the rest of this essay, to not make calculations too complex, we will only consider $R_0$, but the calculations also apply for all of $R$.

The decision matrix thus becomes, again assuming equal probabilities:

|              |$E(G_0)$ |$E(\overline{G_0})$|$\overline{E}$|Expected gain|
|:------------:|:-------:|:-----------------:|:------------:|:---:|
|$B_0$         |$-C$      |$-\omega$          |$-C$          |$-\frac{1}{3}\omega-\frac{2}{3}C$|
|$\overline{B}$|$−\omega$|$0$               |$0$          |$−\frac{1}{3}\omega$|

Something interesting happens: since atheists are punished by $G_x$ and believers are punished by $\overline{G_x}$, believers get no advantage in the infinity department, and it all comes down to the earthly life gains, where atheists win.

Adding more religions does not change the result: for each $G_x$, there is a $\overline{G_x}$. Thus, every column $E(G_x)$ is "cancelled out" by $E(\overline{G_x})$, leaving out the $\overline{E}$ column (no God exists) where atheists end up advantageous.

## The equal probabilities

The hardest part of the refutation, however, is to prove that we have to assume that an evil God has the same probability of existing as a good God; that is, $P(E(G_x)) = P(E(\overline{G_x}))$. If that equality were not true, then the balance would shift to one side or the other.

Consider the following situation.

There is a bag with an unknown, non-zero, possibly infinite number of balls ($0 < n ≤ \infty$). You know that balls can be red or blue. <Footnote text="Colors were chosen deliberately."/> You do not know anything else about the balls and what proportions are red or blue.

Picking a ball at random from the bag, what is the chance that it is a blue ball?

At first glance, this question seems impossible to answer. And yet, this is exactly the problem we are dealing with. Gods can be good or evil<Footnote text='As defined earlier, a "good" God will send non-believers to Hell, whereas an "evil" God will send believers to Hell. I do not believe that a God who sends anyone but the most hardened criminals to Hell could be called "good".'/>, and we assume that a God has been assigned to overseeing our universe, but we have no idea of the probability that a God can be good or evil.

Going back to our balls, let us first assume there are 100 balls in the bag. The following possibilities thus arise:

- $P_0$. There are 0% of blue balls and 100% of red balls.
- $P_1$. There are 1% of blue balls and 99% of red balls.
- ...
- $P_{99}$. There are 99% of blue balls and 1% of red balls.
- $P_{100}$. There are 100% of blue balls and 0% of red balls.

In the absence of any factor to make a possibility more likely than the others, we must assume that every possibility is equally likely; and averaging them out yields an expected 50% of each color, making each color equally likely.

This can be generalized to an arbitrary number of balls and colors. In the case of 2 balls with 3 possible colors (blue, red, and green), the possibilities are the following:

|P|Blue|Red|Green|
|:-:|:-:|:-:|:-:|
|0|100%|0%|0%|
|1|50%|50%|0%|
|2|50%|0%|50%|
|3|0%|100%|0%|
|4|0%|50%|50%|
|5|0%|0%|100%|

Averaging each column yields 33% for each.

We could even go meta by enumerating the possibilities for each possibility, which, as seen above, would also yield an equal probability for each possibility. The general rule is called the [Principle of Insufficient Reason](https://en.wikipedia.org/wiki/Principle_of_indifference) and has been proved by Bernoulli and Laplace.

The Principle of Insufficient Reason states that:

**In the absence of known probabilities, we must assume equal probabilities for each possibility.**

## Cats vs Pitbulls

One can argue, however, that although it is true that a God can be good or evil, it intuitively seems as though it is more likely that God is good, rather than evil.

Unfortunately, this intuition is purely cultural and not based in any mathematical truth; as humans have a tendency to anthropomorphize everything, and God is no exception, we will imagine God as being good because generally, humans are indeed good. (Additionally, it brings more hope to think that a good God watches over us, rather than an evil God plotting to destroy us.)

However, God is not human, and so we cannot transpose our knowledge about humans to God.

Moreover, we cannot use epistemic knowledge to tilt the balance to one side or the other: a common refutation to the [problem of evil](https://en.wikipedia.org/wiki/Problem_of_evil) is that God can be good nevertheless, as God has access to knowledge we don't have, and thus we cannot judge him. But this argument works both ways: as we cannot judge God, we cannot say he is good any more than we can say he is evil. Just like an amateur trying to judge the chess move of a grandmaster, we are completely unable to determine whether God could be good or evil.

Consider a situation where you go to a friend's house. You sit on the couch, and their pet comes next to the couch. In general, you will feel much more at ease if your friend has a cat, rather than if your friend has a pitbull. Why is that?

It simply is because, although cats can be angry (there are reports of cats clawing other people for no reason), and pitbulls can be docile and calm, a cat is generally docile while a pitbull is more likely to tear your arm off.

Therefore, we must ask ourselves: is God a cat, or a pitbull? Is a God more likely to be good, or more likely to be evil?

As stated in the previous section, we can't know, and we are forced to assume equal likelihood for both options. We would need a sample size to figure that out (3-5, or even 1, would be enough): if we find that 99% of Gods are evil, we would be forced to assume that our God is likely to be evil as well. But we don't even know if there is *a* God, let alone multiple Gods.

As we do not know anything about whether God is good or evil, we are forced to assume the principle of insufficient reason and assign equal probabilities to those two possibilities, which as we have seen, puts atheism at an advantage.

## The unescapable symmetry

The reader will note that we have arbitrarily restricted God to two possibilities: either he is good, or evil. But there are many more possibilities. For example, maybe God is evil but his judgement machine is broken, and puts non-believers into Hell. Since we now have three possibilities (God is good, God is evil, God is evil but judgement machine broke), and two of those possibilities favor believers over non-believers, believing would give you a 67% chance of escaping Hell vs 33% for atheism.

However, one can easily come up with a fourth possibility: God is good, but his judgement machine is broken, and puts believers into Hell. Those four possibilities restore the symmetry and confer no advantage to either believers or non-believers.

If we generalize this principle, we get the following:

**For any God $\pmb{G_x}$ which would put believers into Hell (for any reason), one can imagine a God $\pmb{\overline{G_x}}$ which would do the exact opposite.**

In fact, we can bring Heaven back into our considerations, as well as any other potential reward (finite or infinite), and state the following:

**For any religion $\pmb{R_x}$ and any God $\pmb{G_x}$ that would confer a gain $\pmb{g}$ upon the completion of a set of actions, one can imagine a religion $\pmb{\overline{R_x}}$ and a God $\pmb{\overline{G_x}}$ that would confer the opposite gain, $\pmb{-g}$, upon the completion of the very same set of actions.**

In other words, for any conception of God that someone can have, I can conceive of a God that would behave the exact opposite way.

And because we don't know anything about Gods (and those are beings that are generally postulated to be beyond human comprehension in many ways), our only limit is our imagination. If I can conceive of a God that follows a certain behavior, and it does not clash with what we already know about Gods (which is nothing, barring the definition stated in this essay that they have power over what happens to our soul in the afterlife), then it has to be considered as a possibility.

Therefore, all the columns in Pascal's Wager regarding Gods cancel out, as any God is met with its opposite, just like every positive number is met with a negative number; and we are simply left with the single column of "no God exists", which makes our reality the only thing that matters, and where we cannot use the Principle of Insufficient Reason, because we *do* know things about our reality and are not in a complete lack of knowledge.

In conclusion, Pascal's Wager does not work; not only does it not state which religion to believe in, it makes the implicit assumption that a God cannot punish you for believing in itself, which has no reason to be true, and thus is a possibility that must be considered. Once we consider that, atheism becomes the most advantageous position.
