<script setup>
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
    <main>
        <CodeBlock lang="overpy">
            {{`
            #!optimizeForSize

            rule "enums":
                @Event eachPlayer
                @Condition eventPlayer.isHoldingButton(Button.INTERACT)
                @Condition A
                A = Team.ALL
                B = Hero.BRIGITTE
                C = Map.BLACK_FOREST_WINTER
                D = getCurrentGamemode() == Gamemode.ASSAULT
                E = Button.INTERACT
                owo = b"test \\nescape\\z\\u432443"
                "String with entities: a\\&black_square;b\\&fullwidth_space;c"
                if A and Ofds.RSQRE:
                    goto loc+1234
                elif Razte:
                    goto owo
                elif uwu:
                    goto Owo
                else:
                    goto A
                F = eventPlayer.isHoldingButton(Button.INTERACT)
                uwu:
                Owo:
                eventPlayer.startForcingButton(Button.MELEE)
                eventPlayer.startForcingHero(Hero.ANA)
                wait(0.016, Wait.ABORT_WHEN_FALSE)
            `}}
        </CodeBlock>
        <TheWelcome />
    </main>
</template>
