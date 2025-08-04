<template>
    <div class="all-articles">
        <h2 v-if="page.frontmatter.layout !== 'home'">Other articles</h2>
        <VPFeatures class="VPHomeFeatures" :features="filteredFeaturedArticles2"/>
        <div class="other-articles-features-wrapper">
            <VPFeatures class="VPHomeFeatures features-row" :features="filteredFeaturedArticles.slice(0, 3)"/>
            <VPFeatures class="VPHomeFeatures features-row" :features="filteredFeaturedArticles.slice(3)"/>
        </div>
        <div class="other-articles-container-wrapper">
            <div class="other-articles-container">
                <ArticleGroup title="Other projects" :articles="otherProjectsArticles.filter(article => article.url !== currentPagePath)"/>
                <ArticleGroup title="Other essays" :articles="otherEssaysArticles.filter(article => article.url !== currentPagePath)"/>
            </div>
        </div>
    </div>
</template>

<script setup>

import { VPFeatures } from 'vitepress/theme';
import { useData } from 'vitepress';
import { computed } from 'vue';

const { page } = useData();

const currentPagePath = computed(() => page.value.relativePath.replace(".md", ""));
console.log("currentPagePath:", currentPagePath.value);
//console.log(page);


let featuredArticles = [
    {
        title: "OverPy",
        details: "Creating a programming language to make the Overwatch Workshop usable",
        link: "/overpy",
        icon: {
            src: "/overpy-hero.svg"
        }
    }, {
        title: "OverWordle",
        details: "Pushing the Overwatch Workshop to its limits by making a multiplayer Wordle",
        link: "/overwordle",
        icon: {
            src: "/overwordle-hero.png"
        }
    }, {
        title: "Workshop shenanigans",
        details: "Exploiting the Overwatch Workshop with Unicode tricks to bypass sanitization",
        link: "/workshopshenanigans",
        icon: {
            src: "/workshopshenanigans-hero.png"
        }
    }, {
        title: "Why the purpose of life is happiness",
        details: "A philosophical essay and a tutorial on introspection",
        link: "/purpose",
        icon: {
            src: "/purpose-hero.jpeg"
        }
    }, {
        title: "\"What's the best move on the board?\"",
        details: "The mindset that is required to win",
        link: "/bestmove",
        icon: {
            src: "/bestmove-hero.png"
        }
    }, {
        title: "Why I view relationships like a business",
        details: "The way to avoid ending up like the 80%",
        link: "/relationships",
        icon: {
            src: "/relationships-hero.jpg"
        }
    }
];

//If width >= 1280px, articles must be shown 3 per row, but the rows must be kept (first row is overwatch, second row is self-improvement).
//Use a dummy article to force the grid to be 3 per row and have all articles the same size, while potentially having the first row have 2 articles and the second row have 3 articles.
const filteredFeaturedArticles = computed(() => featuredArticles.map(article => {
    //console.log(article, `/${currentPagePath.value}`);
    if (article.link === `/${currentPagePath.value}`) {
        return {
            ...article,
            link: "/404",
        };
    }
    return article;
}));

//If width < 1280px, the normal VPHomeFeatures is shown, but if there are only 5 articles, the grid gets all ugly (4 per row instead of 2).
//Add a dummy article at the end to make it item.grid-6.
const filteredFeaturedArticles2 = computed(() => {
    let result = featuredArticles.filter(article => article.link !== `/${currentPagePath.value}`);
    if (result.length < 6) {
        result.push({link: "/404", title: "Placeholder", details: "You shouldn't see this."});
    }
    return result;
})

let otherProjectsArticles = [
    {url: "chariotwars", title: "Chariot Wars"},
    {url: "sokoban", title: "Sokoban"},
    {url: "setupscripts", title: "Linux/Windows Setup Scripts"}
];

let otherEssaysArticles = [
    {url: "noproof", title: "There is no known proof for God"},
    {url: "pascalswager", title: "Refuting Pascal's Wager"}
];

</script>

<style scoped>

.other-articles-features-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.VPHomeFeatures.features-row {
    display: none;
}
@media (min-width: 1280px) {
    .VPHomeFeatures {
        display: none;
    }
    .VPHomeFeatures.features-row {
        display: unset;
    }
}

h2 {
    @media (min-width: 960px) {
        max-width: 752px;
    }
    @media (min-width: 1280px) {
        max-width: 1104px;
    }
    @media (min-width: 960px) {
        border-top: 1px solid var(--vp-c-divider); 
        margin-top: 44px;
    }
    padding-top: 44px; 
    width: 100%;
    text-align: center;
    font-size: 32px;
    line-height: 40px;
    letter-spacing: normal;
    font-weight: 600;
    padding-bottom: 44px;
    @media (max-width: 959px) {
        padding-bottom: 40px;
    }
}

.all-articles {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 128px;
    @media (max-width: 639px) {
        margin-bottom: 44px;
    }
}

.other-articles-container {
    display: flex; 
    row-gap: 20px; 
    column-gap: 40px; 
    justify-content: center; 
    flex-wrap: wrap; 
    border-top: 1px solid var(--vp-c-divider); 
    padding-top: 44px; 
    margin-top: 44px; 
    width:100%;
    margin-left: 2px;
    margin-right: 2px;
}
.other-articles-container-wrapper {
    max-width: 1280px;
    padding: 0 24px;
    @media (min-width: 640px) {
        padding: 0 48px;
    }
    @media (min-width: 960px) {
        padding: 0 64px;
    }
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
