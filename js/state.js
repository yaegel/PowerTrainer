// ==============================
//         DATA STORAGE
// ==============================
const saveData = () => {
    localStorage.setItem("powerTrainerData", JSON.stringify(appData));
};

const loadData = () => {
    appData = JSON.parse(localStorage.getItem("powerTrainerData")) || appData;
    //difficultySelect.value = appData?.settings?.difficulty || "beginner";
    //hueSlider.value = appData?.settings?.themeHue || 210;
    applyTheme();
};
