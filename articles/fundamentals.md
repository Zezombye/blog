<script setup>
import Question from "../components/Question.vue";

function clearAll() {
    for (let key of Object.keys(localStorage)) {
        if (key.startsWith("fundamentals-q-")) {
            localStorage.removeItem(key);
        }
    }
    window.location.reload();
}

</script>

# The Fundamentals: Things to ask at the start of a relationship

This is a concise summary of lists I’ve found on the internet as well as the very good book “[101 Questions To Ask Before You Get Engaged](https://www.amazon.com/101-Questions-Ask-Before-Engaged/dp/0736913947)”.

Except those questions are the kind of questions to ask at the start, not years down the line. Potential incompatibilities must be rooted out as early as possible.

Those are not “questions to get to know each other”, you can find that elsewhere on the internet. These are all things that could be dealbreakers or hard compromises, and are, at the very least, things you and your partner must know about each other before deciding to commit to a relationship.

For the tests (political compass, attachment styles, etc) do them before the date if possible, and study what the results mean (what the libertarian/authoritarian axis is, or an avoidant attachment style.) Of course, keep in mind that those are just internet tests, not professional diagnoses.

Try to make this not an interview but a “podcast date”. The questions provide topics as a starting point and the conversation will eventually drift off, until the current topic comes to a natural close and you can move on to the next question. You’ll need multiple dates to get to the end of the list, and that’s fine. Just make sure to eventually answer all questions.

Some questions may be too sensitive to answer just yet, especially if you’ve just met. That’s also fine. Take note of these to answer later on when trust is built.

Also consider [36 questions that lead to love](/36-questions-that-lead-to-love.pdf) as a way of knowing each other. I recommend doing the very basics first (religion, children, relationships) with questions that have the highest probability of being dealbreakers while not being sensitive, then doing the 36 questions, then proceeding with the rest.

You can check the questions you have answered to keep track of what to ask. <button class="btn" @click="clearAll()">Clear All</button>

Roughly organized from least to most sensitive/personal:

## 1. Religion

a. <Question id="5791c035-988c-4faf-b42a-fe79c7a8eaa3" t="Are you religious or spiritual? Why or why not?"/>
b. <Question id="c1fc7ebf-02cc-4bec-9516-37886c4987b7" t="Is your religion (or lack of) compatible with your partner?"/>
c. <Question id="d427d1ae-65ff-44da-b057-866282d1e6b9" t="What has been your spiritual journey so far and what future do you foresee for it?"/>

## 2. Children

a. <Question id="ba2ba258-5a7d-4d6c-a572-666b597da8e4" t="Do you want children? If so, how many and when? Why or why not?"/>
b. <Question id="e09d4ac6-ff88-4b52-a20f-c86381a77297" t="Are you open to adoption?"/>
c. <Question id="5df68aa8-000e-4e36-849d-6a1205880088" t="What experience have you had with parenting (could be babysitting, younger siblings…)?"/>
d. <Question id="e9e8b52a-9039-435b-908f-c31355a4f691" t="How will you raise your children in general, especially compared to your childhood? Regarding discipline, education, technology..."/>
e. <Question id="a67c125a-e7b1-454f-ae0e-0feed0333c3e" t="(If your religious views differ) How do you envision us raising our children under our different religions?"/>

## 3. Relationships

a. <Question id="42628990-ec65-4c0e-bc81-ff32f975fd34" t="What is your idea of a perfect, healthy relationship?"/>
b. <Question id="e20ab7ca-ab8f-4a0a-8f21-03ff8d03a6d7" t="What is your idea of a perfect boyfriend/girlfriend? Which qualities are required and which faults are dealbreakers?"/>
c. <Question id="d3c4c593-6924-4a37-a879-9fb4b62b5a28" t="What are 5 principles you think are required for a good relationship?"/>
d. <Question id="a3fedef8-66af-4d62-a397-9923537acb8a" t="How do you view the day-to-day life of our relationship? How often should we talk or do things together?"/>
e. <Question id="699a39a4-c419-4cb0-a4c4-6ec9bd9e217d" t="What is the dynamic of the relationship you want? (Traditional gender roles, equal relationship…)"/>
f. <Question id="4f9a5e32-f715-4273-9bb1-870491ff6e91" t="Do you believe in the institution of marriage?"/>
g. <Question id="3521f981-5ebb-4583-8b33-f18d9c1afa25" t="What do you define as cheating? Is watching porn cheating? Kissing someone else (even a friend) on the cheek/mouth?"/>
h. <Question id="f07fdadd-d8be-4660-b627-1a2c619139ed" t="What are your feelings on sexual exclusivity and monogamy?"/>
i. <Question id="b23f4984-df82-45ea-8330-057349f94ef6" t="Do you believe some things in a relationship should be kept private? Why or why not?"/>
j. <Question id="1c793e2a-cfac-4697-828a-ecb24e62c4a7" t="What are your love languages? (https://5lovelanguages.com/quizzes/love-language)"/>
k. <Question id="680075ff-5ba5-4fe3-89d3-93aa7be564ce" t="What are your views on friends of the same sex? Do either of you already have friends of the same sex? Are both of you comfortable with that?"/>
l. <Question id="460eb55d-ccb6-4ad4-864d-da0c8336d970" t="How many relationships have you had thus far, when, and how long did they last?"/>
m. <Question id="b80a29c1-c813-470d-8296-5defa93689ef" t="Why did you break up with your exes?"/>
n. <Question id="051f1136-e541-4da4-b850-6bd2ba862a2c" t="What have you learned about yourself from previous romantic relationships? What mistakes did you make and what did you do right?"/>
o. <Question id="e5586f38-d956-4eff-8f97-3065ab1c1399" t="What is your attachment style? (https://quiz.attachmentproject.com/)"/>
p. <Question id="eb87fd4d-f81f-495e-be0f-78cbbbabdf58" t="How do you feel about your partner quizzing you on all kinds of sensitive and personal subjects?"/>
q. <Question id="53e75487-9e10-450e-a0e6-a76091e15806" t="What are 5 reasons why someone would date you and 3 reasons they wouldn’t?"/>

## 4. Personality

a. <Question id="f6c132d8-fc32-4751-908c-a06191de814f" t="Who are the people in your life that have influenced you the most, and in what way?"/>
b. <Question id="72b64b7e-a070-4898-9b6e-490ccb2d44f8" t="What shows, movies, books etc have made an impact on your life and in what way?"/>
c. <Question id="f68bd8fb-bfe6-4199-bee4-e85f3931dce1" t="What is your MBTI? (https://www.16personalities.com/) (This shouldn’t be a dealbreaker no matter the answer, but helps understand your partner.)"/>
d. <Question id="22b0bb60-9c39-481e-b912-8f13a771676c" t="What are your interests and hobbies and which ones do your partner not care about or wouldn’t do with you?"/>
e. <Question id="4b22136e-f833-416f-847d-35ccfe830ef4" t="Would you want to live more rurally or in the city?"/>
f. <Question id="089a7c04-c032-4d22-952e-bc43b0c2e7d9" t="Ten years from now, where would you like to be emotionally, spiritually, economically, and relationship-wise?"/>
g. <Question id="9d37b255-d1aa-4cae-b088-28975d1a7d7e" t="Are you more emotional or rational?"/>
h. <Question id="8befab37-260e-4b2a-8d75-958eb96c8a1f" t="What parts of yourself would you never change?"/>
i. <Question id="a070edcc-615d-45e3-a88c-2f7789046204" t="What is a summary of your life story?"/>
j. <Question id="cb453c59-466c-493d-8524-0c2157522e26" t="What makes it easy for you to be open and vulnerable, and what makes it difficult?"/>

## 5. Pets
a. <Question id="3d80f9b0-7b52-40aa-8e7d-ff3a8e601105" t="What kinds of pets would you be ok with? Dog, cat, rabbit, turtle, goldfish, hamster, lizard, snake, tarantula…?"/>
b. <Question id="67e64ad2-791e-4f6c-a3cf-59edd9e06acb" t="Are you allergic to any pets?"/>
c. <Question id="5e87b7d8-a5e0-4384-827f-7f8d89125919" t="Are you ok with having pets while raising children?"/>
d. <Question id="9086ff87-c94a-47ec-afc9-bda4e26c6e40" t="(If you both want a pet) Who would be the primary caretaker and how would we split financial and practical responsibilities?"/>

## 6. Money
a. <Question id="7cd3eed4-7cf4-4bf1-a107-ee4736d16a3a" t="Are you materialistic?"/>
b. <Question id="5d38bd52-4c63-4bca-ab37-eeb7e7640531" t="How do you handle money? Do you have any problems with money?"/>
c. <Question id="831f0b8b-fd81-44f7-85af-48c6e0aee3c7" t="How would we handle our finances (jointly, separately, both)?"/>
d. <Question id="b596d1be-2b7e-4d45-9af2-b7af5608cf42" t="Have you ever been bankrupt or close to bankrupt? Are you in debt?"/>
e. <Question id="f98f2c3a-d019-4c86-9b94-56e8ea60e016" t="What is your employment history and how would it look in the future? How far into your career do you want to get?"/>

## 7. Sex
a. <Question id="53200dd6-5e82-44a2-99df-6d824e4580f2" t="What are your views on sex in general?"/>
b. <Question id="427caa8c-c303-48f2-a1c7-34958d9f7e15" t="How often do you expect to have sex?"/>
c. <Question id="638d637a-1c40-4c55-9be8-93873ea07873" t="What are you willing to do? (Oral sex, BDSM…)"/>
d. <Question id="c82c24ab-96d6-4865-8133-b40eaa45fd9c" t="What is your sexual history?"/>

## 8. Family & friends
a. <Question id="bd662be6-1206-4a8f-9b67-c1f3c33da991" t="What family do you have? How many siblings?"/>
b. <Question id="0be6b373-6233-4991-bee6-71e95194362d" t="Who are your current friends?"/>
c. <Question id="8792f8f4-6c8a-4b0d-866a-03c7ac78bcb3" t="How do you feel about having friends and family over? How often?"/>
d. <Question id="bae6fc75-91b0-4651-b54c-512802f374e6" t="What kind of relationship do you want me to have with your family?"/>
e. <Question id="9f2dc0dd-7a01-4cbb-b176-54581ac4564e" t="How important are holidays and traditions to you and your family?"/>
f. <Question id="8af00958-ac92-4053-a986-bdb5e152b21a" t="What is your relationship with your mother, father, siblings, and extended family?"/>
g. <Question id="5abe1cc5-c52e-43c5-8961-3dbdc56d4718" t="How important is your parents’ approval to you?"/>
h. <Question id="6ecd1522-595b-4de4-a12f-b3d9ca2eaaba" t="Do your parents respect boundaries?"/>
i. <Question id="f9b92fec-eb47-432f-9f75-6321a9f6e2b1" t="What type of relationship did your parents have with your ex?"/>

## 9. Politics
a. <Question id="2e850782-8458-4c21-adca-3bd034879c86" t="Where do you fall on the political compass? (https://www.politicalcompass.org/test)"/>
b. <Question id="9fad42f6-9119-4cfd-a3eb-9b3fbb0222ee" t="How do you evaluate the next 20+ years of the country you want to live in? Do you think it is overall trending upwards or downwards?"/>
c. <Question id="dfdcec4a-5667-45ac-83d6-65b629059aa9" t="Which candidate did you vote for in the last election, if any? (Careful about tribalism. Don’t rule out your partner just because they didn’t vote for your candidate, but evaluate what brought them to vote for them.)"/>
d. <Question id="eae20505-a674-476b-89b9-0b08d4a9e593" t="How involved are you in politics?"/>
e. <Question id="9e828e0c-ff9d-4926-8e03-07acc5d8ffdf" t="What is your stance on abortion and why?"/>
f. <Question id="d8d5aa5d-dd03-4993-888b-c808d5064c94" t="What do you think of the Covid-19 pandemic? Did you get the vaccine?"/>

## 10. Health
a. <Question id="6244464d-daf1-40a4-9d47-dadba1b2f2d0" t="What is your relationship to fitness and food?"/>
b. <Question id="24af8f9a-9a4c-4a4f-ab31-2468caf07967" t="Do you have any STDs?"/>
c. <Question id="4a3a4cec-7b95-4f39-868c-e6d8466cb50c" t="Do you have any addiction? (To porn, gambling, drugs, alcohol, video games, social media…) What have you done so far to fight it?"/>
d. <Question id="eccf9be8-07a8-4187-9f5a-4fad5b5c7acd" t="Do you have any chronic illness that significantly impacts your life, or any kind of disability (autism, ADHD, infertility, BPD…)?"/>
e. <Question id="9d4537ba-c991-4cde-8cbd-87cc716f0803" t="Do you have any trauma? (From childhood, past relationships…)"/>
f. <Question id="4aefb9e4-52fc-495b-9fba-88118e8b6108" t="How is your mental health currently?"/>
