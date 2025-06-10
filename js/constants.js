// ==============================
//         DATA & CONFIG
// ==============================
const KG_TO_LBS = 2.20462;

// ==============================
//         OTHER
// ==============================
const getRandomEncouragement = () => {
    const which = Math.floor(Math.random() * cutsieGymPhrases.length);
    return cutsieGymPhrases[which];
};

const cutsieGymPhrases = [
    "Peachy keen, lifting machine!",
    "That was neat, time to repeat!",
    "Swole is the goal, you sweet soul!",
    "You're crushing it, cupcake!",
    "Ain't nothin but a peanut!",
    "Okay, you little nugget of strength, let's go again!",
    "That set was a chef's kiss! Let's cook up another.",
    "You're one tough cookie! Time for the next batch.",
    "Go get 'em, tiny tiger!",
    "Unleash the beastie!",
    "Energizer Bunny&trade; mode: ACTIVATED!",
    "Look at you go, you little firecracker! Light it up again!",
    "You're a superstar! Time for your encore.",
    "That was magic! Let's make some more.",
    "Again! Again!",
    "Okay, powerhouse, power up for the next one!",
    "You've got this, sweet pea!",
    "My hero! To the next set!",
    "Even the dumbbells are blushing! On to the next!",
    "Flex-tastic! What's next on the agenda?",
    "Solid set, man. Run it back.",
    "That's the one. Again.",
    "Pure power. Load it up again.",
    "Clean reps. Let's get another.",
    "Owned that set. Time for the next round.",
    "Engine's hot. Let's keep that momentum.",
    "Moving like a freight train. Next stop!",
    "That was pure diesel. Fuel up for another.",
    "You're a workhorse, brother. Let's get back to it.",
    "Warrior status. Time to re-engage.",
    "You're a titan. Crush the next one.",
    "Conquered that set. On to the next battle.",
    "Forged in iron. Let's fire up another.",
    "That was savage. Let's go again.",
    "Brick by brick. Stack another one on.",
    "That's how you build it. Next layer.",
    "Boss-level effort. Let's see it again.",
    "Leave it all on the floor. Let's go.",
    "You're in the zone. Stay there.",
    "All you, man. Keep that fire.",
    "That's the standard. Let's raise it.",
    "Heck of a set. Let's see that again.",
    "Unstoppable. What's next?",
    "Do or do not. There is no try.",
    "One more round.",
    "Are you not entertained?!",
    "There is no spoon.",
    "That's my secret, Cap: I'm always angry.",
    "To infinity... and beyond!",
    "What we do in life, echoes in eternity.",
    "Why do we fall? So we can learn to pick ourselves up.",
    "Clear eyes, full hearts, can't lose.",
    "Get busy livin', or get busy dyin'.",
    "The obstacle is the way.",
    "Suffer the pain of discipline or suffer the pain of regret.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "The iron never lies to you.",
    "He who sweats more in training bleeds less in war.",
    "The only person you are destined to become is the person you decide to be.",
    "Fortune favors the bold.",
    "Don't stop when you're tired. Stop when you're done.",
    "The credit belongs to the man who is actually in the arena.",
    "Do not pray for an easy life, pray for the strength to endure a difficult one.",
    "The body achieves what the mind believes.",
    "Discipline equals freedom.",
    "The best way out is always through.",
    "A smooth sea never made a skilled sailor.",
    "It is not the mountain we conquer, but ourselves.",
    "He who has a why to live can bear almost any how.",
    "Victory is reserved for those who are willing to pay its price.",
    "Our greatest glory is not in never falling, but in rising every time we fall.",
    "Become the hardest working person you know.",
    "Today I will do what others won't, so tomorrow I can do what others can't.",
];

// ==============================
//         DOM ELEMENTS
// ==============================
const settingsBtn = document.getElementById("settings-btn");
const settingsMenu = document.getElementById("settings-menu");
const themeToggle = document.getElementById("theme-toggle");
const hueSlider = document.getElementById("hue-slider");
const workoutDisplay = document.getElementById("workout-display");
const exerciseSelect = document.getElementById("exercise-select");
const progressLog = document.getElementById("progress-log");
const calendarGrid = document.getElementById("calendar-grid");
const todayBtn = document.getElementById("today-btn");
const datePickerInput = document.getElementById("date-picker");

const workoutModal = document.getElementById("workout-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const workoutModalCloseBtn = workoutModal.querySelector(".modal-close-btn");

const descriptionModal = document.getElementById("description-modal");
const descriptionModalTitle = document.getElementById(
    "description-modal-title"
);
const descriptionModalBody = document.getElementById("description-modal-body");
const descriptionModalCloseBtn =
    descriptionModal.querySelector(".modal-close-btn");

const unitKgBtn = document.getElementById("unit-kg");
const unitLbsBtn = document.getElementById("unit-lbs");
const chartCanvas = document.getElementById("progress-chart");
const difficultySelect = document.getElementById("difficulty-select");
const fullBodyBtn = document.getElementById("full-body-btn");
