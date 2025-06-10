// ==============================
//         APP STATE
// ==============================
let appData = {
    exerciseHistory: [],
    workoutHistory: [],
    settings: {
        units: "lbs", // kg or lbs
        theme: "light",
        difficulty: "beginner", // beginner, intermediate, advanced
        themeHue: 210, // Default hue for theme colors
    },
};
let currentWorkout = {};
let currentCalendarDate = new Date();
let currentUnit = appData.settings.units;
let datePickerInstance = null;
let progressChartInstance = null;
let consistency = appData.workoutHistory.map((workout) => workout.date);

// ==============================
//         DATA GENERATION
// ==============================
function generateDemoData(difficulty = "beginner") {
    // Clear existing data
    appData.exerciseHistory = {};
    appData.workoutHistory = [];

    const allowedDifficulties = {
        beginner: ["beginner"],
        intermediate: ["beginner", "intermediate"],
        advanced: ["beginner", "intermediate", "advanced"],
    }[difficulty];

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 89); // 90 days ago

    const workoutTypes = ["full", "push", "pull"];
    const rpeOptions = ["Easy", "Moderate", "Hard", "Very Hard", "Max Effort"];

    for (let i = 0; i < 90; i++) {
        const workoutDate = new Date(startDate);
        workoutDate.setDate(startDate.getDate() + i);
        const dateMillis = workoutDate.getTime(); // <-- store as millis

        // Cycle through workout types
        const type = workoutTypes[i % workoutTypes.length];
        // Alternate goal every 6 workouts
        const goal = Math.floor(i / 6) % 2 === 0 ? "hypertrophy" : "power";

        // Select exercises for the workout
        const getRandomExercise = (exType) => {
            const filtered = exercises.filter(
                (e) =>
                    e.type === exType &&
                    allowedDifficulties.includes(e.difficulty)
            );
            if (filtered.length === 0) return null;
            return filtered[Math.floor(Math.random() * filtered.length)];
        };

        let workoutPlan = [];
        let parts = {};

        if (type === "full") {
            workoutPlan = [
                getRandomExercise("explosive"),
                getRandomExercise("knee-dominant"),
                getRandomExercise("hip-dominant"),
                getRandomExercise("horizontal-push"),
                getRandomExercise("horizontal-pull"),
                getRandomExercise("vertical-push"),
                getRandomExercise("vertical-pull"),
                getRandomExercise("core"),
            ].filter(Boolean);

            parts = {
                explosive: workoutPlan[0]?.flavor,
                kneeDominant: workoutPlan[1]?.flavor,
                hipDominant: workoutPlan[2]?.flavor,
                horizontalPush: workoutPlan[3]?.flavor,
                horizontalPull: workoutPlan[4]?.flavor,
                verticalPush: workoutPlan[5]?.flavor,
                verticalPull: workoutPlan[6]?.flavor,
                core: workoutPlan[7]?.flavor,
            };
        } else if (type === "push") {
            workoutPlan = [
                getRandomExercise("explosive"),
                getRandomExercise("knee-dominant"),
                getRandomExercise("hip-dominant"),
                getRandomExercise("horizontal-push"),
                getRandomExercise("vertical-push"),
                getRandomExercise("core"),
            ].filter(Boolean);

            parts = {
                explosive: workoutPlan[0]?.flavor,
                kneeDominant: workoutPlan[1]?.flavor,
                hipDominant: workoutPlan[2]?.flavor,
                horizontalPush: workoutPlan[3]?.flavor,
                verticalPush: workoutPlan[4]?.flavor,
                core: workoutPlan[5]?.flavor,
            };
        } else if (type === "pull") {
            workoutPlan = [
                getRandomExercise("explosive"),
                getRandomExercise("knee-dominant"),
                getRandomExercise("hip-dominant"),
                getRandomExercise("horizontal-pull"),
                getRandomExercise("vertical-pull"),
                getRandomExercise("core"),
            ].filter(Boolean);

            parts = {
                explosive: workoutPlan[0]?.flavor,
                kneeDominant: workoutPlan[1]?.flavor,
                hipDominant: workoutPlan[2]?.flavor,
                horizontalPull: workoutPlan[3]?.flavor,
                verticalPull: workoutPlan[4]?.flavor,
                core: workoutPlan[5]?.flavor,
            };
        }

        // Add to workoutHistory
        appData.workoutHistory.push({
            type,
            goal,
            date: dateMillis, // <-- store as millis
            parts,
        });

        // For each exercise, add a log to exerciseHistory
        workoutPlan.forEach((ex) => {
            if (!ex) return;
            if (!appData.exerciseHistory[ex.id])
                appData.exerciseHistory[ex.id] = [];
            // Simulate 2-4 sets per exercise
            const numSets = Math.floor(Math.random() * 3) + 2;
            for (let s = 0; s < numSets; s++) {
                // Simulate weight and reps
                let baseWeight = 10;
                if (ex.name.toLowerCase().includes("barbell")) baseWeight = 30;
                else if (ex.name.toLowerCase().includes("dumbbell"))
                    baseWeight = 15;
                else if (ex.name.toLowerCase().includes("cable"))
                    baseWeight = 20;
                else if (
                    ex.name.toLowerCase().includes("pullup") ||
                    ex.name.toLowerCase().includes("pushup")
                )
                    baseWeight = 0;
                else if (ex.name.toLowerCase().includes("bodyweight"))
                    baseWeight = 0;
                else baseWeight = 10 + Math.floor(Math.random() * 20);

                // Add some variation
                let weight = baseWeight + Math.floor(Math.random() * 10);
                let reps =
                    ex.reps && !isNaN(parseInt(ex.reps))
                        ? parseInt(ex.reps)
                        : 8 + Math.floor(Math.random() * 5);
                let rpe =
                    rpeOptions[Math.floor(Math.random() * rpeOptions.length)];

                appData.exerciseHistory[ex.id].push({
                    date: dateMillis, // <-- store as millis
                    weight,
                    reps,
                    rpe,
                    id: Date.now() + Math.floor(Math.random() * 10000),
                });
            }
        });
    }
    saveData();
    updateCalendarDisplay();
    displayProgress();
}

// ==============================
//         UTILITY FUNCTIONS
// ==============================
const getExerciseById = (id) => {
    return exercises.find((ex) => ex.id === id);
};

const shuffleArray = (a) => {
    const newArr = [...a];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const parseTotalSets = (setsString) => {
    if (!setsString) return 3;
    if (setsString.includes("-")) {
        return parseInt(setsString.split("-")[1], 10);
    }
    return parseInt(setsString, 10);
};

fullBodyBtn.addEventListener("mousedown", function (e) {
    // Secret event: Ctrl + right-click
    if (e.ctrlKey && e.button === 2) {
        generateDemoData("beginner");
        console.log("Demo History Saved");
        updateCalendarDisplay();
    }
    // Normal left-click
    if (e.button === 0) {
        generateWorkout("full");
    }
});
// Prevent context menu on ctrl+right-click
fullBodyBtn.addEventListener("contextmenu", function (e) {
    if (e.ctrlKey) e.preventDefault();
});

function getSuggestedWeight(exerciseId) {
    const logs = appData.exerciseHistory[exerciseId];
    let weight = null;
    let rpe = null;
    if (logs && logs.length > 0) {
        // Use the most recent log
        weight = parseFloat(logs[0].weight);
        rpe = logs[0].rpe;
    }
    // If no history, use a default based on exercise type
    if (!weight || isNaN(weight)) {
        const ex = getExerciseById(exerciseId);
        if (!ex) return "";
        if (ex.name.toLowerCase().includes("dumbbell")) weight = 10;
        else if (ex.name.toLowerCase().includes("barbell")) weight = 20;
        else if (ex.name.toLowerCase().includes("cable")) weight = 15;
        else weight = 10;
    } else {
        // Adjust based on RPE
        if (currentUnit === "lbs") {
            if (rpe === "Easy") weight += 10;
            else if (rpe === "Moderate") weight += 5;
            // Hard, Very Hard, Max Effort: no increase
        } else {
            if (rpe === "Easy") weight += 5;
            else if (rpe === "Moderate") weight += 2.5;
            // Hard, Very Hard, Max Effort: no increase
        }
    }
    // Round to nearest 2.5kg or 5lbs
    if (currentUnit === "lbs") {
        weight = Math.round((weight * KG_TO_LBS) / 5) * 5;
        return weight;
    } else {
        weight = Math.round(weight / 2.5) * 2.5;
        return weight;
    }
}

// ==============================
//         WORKOUT GENERATION & DISPLAY
// ==============================
const generateWorkout = (type) => {
    let workoutGoal =
        appData?.workoutHistory?.[appData.workoutHistory.length - 1]?.goal ||
        "hypertrophy";
    if (appData.workoutHistory && appData.workoutHistory.length > 2) {
        let cycleTotal = 0;
        lastThreeWorkouts = appData.workoutHistory.slice(-3);
        lastThreeWorkouts.forEach((workout) => {
            if (workout.type === "full" && workout.goal === workoutGoal)
                cycleTotal += 2;
            if (
                (workout.type === "pull" || workout.type == "pull") &&
                workout.goal === workoutGoal
            )
                cycleTotal += 1;
        });
        if (cycleTotal > 2) {
            workoutGoal = workoutGoal === "power" ? "hypertrophy" : "power";
        }
    }

    const allowedDifficulties = {
        beginner: ["beginner"],
        intermediate: ["beginner", "intermediate"],
        advanced: ["beginner", "intermediate", "advanced"],
    }[appData.settings?.difficulty];

    const getRandomExerciseByType = (t) => {
        const filtered = exercises.filter(
            (e) => e.type === t && allowedDifficulties.includes(e.difficulty)
        );
        if (filtered.length === 0) return null;
        return shuffleArray(filtered)[0];
    };

    let workoutPlan = [];
    workoutPlan.push({
        id: "warmup",
        name: "General Warmup",
        type: "warmup",
        description:
            "5-10 minutes of light cardio (jogging, cycling) and dynamic stretching (leg swings, arm circles).",
    });

    if (type === "full") {
        workoutPlan.push(
            ...[
                getRandomExerciseByType("explosive"),
                getRandomExerciseByType("knee-dominant"),
                getRandomExerciseByType("hip-dominant"),
                getRandomExerciseByType("horizontal-push"),
                getRandomExerciseByType("horizontal-pull"),
                getRandomExerciseByType("vertical-push"),
                getRandomExerciseByType("vertical-pull"),
                getRandomExerciseByType("core"),
            ]
        );
        currentWorkout = {
            type: "full",
            goal: workoutGoal,
            date: currentCalendarDate.toLocaleDateString("en-US"),
            parts: {
                explosive: workoutPlan[0].flavor,
                kneeDominant: workoutPlan[1].flavor,
                hipDominant: workoutPlan[2].flavor,
                horizontalPush: workoutPlan[3].flavor,
                horizontalPull: workoutPlan[4].flavor,
                verticalPush: workoutPlan[5].flavor,
                verticalPull: workoutPlan[6].flavor,
                core: workoutPlan[7].flavor,
            },
        };
    } else if (type === "push") {
        workoutPlan.push(
            ...[
                getRandomExerciseByType("explosive"),
                getRandomExerciseByType("knee-dominant"),
                getRandomExerciseByType("hip-dominant"),
                getRandomExerciseByType("horizontal-push"),
                getRandomExerciseByType("vertical-push"),
                getRandomExerciseByType("core"),
            ]
        );
        currentWorkout = {
            type: "push",
            goal: workoutGoal,
            date: currentCalendarDate.toLocaleDateString("en-US"),
            parts: {
                explosive: workoutPlan[0].flavor,
                kneeDominant: workoutPlan[1].flavor,
                hipDominant: workoutPlan[2].flavor,
                horizontalPush: workoutPlan[3].flavor,
                verticalPush: workoutPlan[4].flavor,
                core: workoutPlan[5].flavor,
            },
        };
    } else if (type === "pull") {
        workoutPlan.push(
            ...[
                getRandomExerciseByType("explosive"),
                getRandomExerciseByType("knee-dominant"),
                getRandomExerciseByType("hip-dominant"),
                getRandomExerciseByType("horizontal-pull"),
                getRandomExerciseByType("vertical-pull"),
                getRandomExerciseByType("core"),
            ]
        );

        currentWorkout = {
            type: "pull",
            goal: workoutGoal,
            date: currentCalendarDate.toLocaleDateString("en-US"),
            parts: {
                explosive: workoutPlan[0].flavor,
                kneeDominant: workoutPlan[1].flavor,
                hipDominant: workoutPlan[2].flavor,
                horizontalPull: workoutPlan[3].flavor,
                verticalPull: workoutPlan[4].flavor,
                core: workoutPlan[5].flavor,
            },
        };
    }
    displayWorkout(workoutPlan.filter(Boolean));
};

const displayWorkout = (workout) => {
    workoutDisplay.innerHTML =
        workout.length > 1
            ? ""
            : "<p>No exercises found for your level. Try a different workout type or change your difficulty level in settings.</p>";
    workout.forEach((ex) => {
        const card = document.createElement("div");
        card.className = "exercise-card";
        card.dataset.exerciseId = ex.id;

        if (ex.type === "warmup") {
            card.innerHTML = `
                            <div class="exercise-card-header"><h3>${ex.name}</h3></div>
                            <p class="exercise-details">${ex.description}</p>
                            <button class="btn btn-log warmup-complete-btn" style="margin-top: auto;">Mark Complete</button>
                        `;
        } else {
            const totalSets = parseTotalSets(ex.sets);
            const suggestedWeight = ex.id ? getSuggestedWeight(ex.id) : "";
            card.innerHTML = `
    <div class="exercise-card-header">
        <div class="exercise-card-title"><h3>${ex.name}</h3></div>
    </div>
    <button 
        class="exercise-info-btn damion-regular" 
        onclick="showDescriptionModal(${ex.id})" 
        aria-label="Show description">
            <img src="img/info.svg" />
    </button>
    <div class="exercise-details">
        <div class="rep-recommendation">Reps: ${ex.reps}</div>
        <div class="sets-tracker"><span class="completed-sets">0</span>/${totalSets} sets</div>
    </div>
    <form class="log-form" onsubmit="event.preventDefault();logProgress('${ex.id}', this);">
        <input type="number" step="any" class="weight-input" placeholder="Weight in ${currentUnit}" value="${suggestedWeight}" required>
        <input type="number" placeholder="Reps" required>
        <select required>
            <option value="">-- RPE --</option>
            <option value="Easy">Easy</option><option value="Moderate">Moderate</option>
            <option value="Hard">Hard</option><option value="Very Hard">Very Hard</option>
            <option value="Max Effort">Max Effort</option>
        </select>
        <button type="submit" class="btn btn-log">Log Set</button>
    </form>`;
        }
        workoutDisplay.appendChild(card);
    });

    const warmupBtn = document.querySelector(".warmup-complete-btn");
    if (warmupBtn) {
        warmupBtn.addEventListener("click", () => {
            const warmupCard = warmupBtn.closest(".exercise-card");
            warmupCard.classList.add("completed");
            setTimeout(() => warmupCard.remove(), 500);
        });
    }
    updateUnitUI();
};

const showDescriptionModal = (exerciseId) => {
    const exercise = getExerciseById(exerciseId);
    if (!exercise) return;

    descriptionModalTitle.textContent = exercise.name;
    descriptionModalBody.textContent =
        exercise.description || "No description available.";

    descriptionModal.style.display = "flex";
    document.body.classList.add("modal-open");
};

const logProgress = (exerciseId, form) => {
    const weightInput = form.querySelector(".weight-input");
    let weightInKg = parseFloat(weightInput.value);
    if (currentUnit === "lbs") {
        weightInKg = weightInKg / KG_TO_LBS;
    }
    if (!appData.exerciseHistory[exerciseId])
        appData.exerciseHistory[exerciseId] = [];
    appData.exerciseHistory[exerciseId].unshift({
        date: Date.now(), // <-- store as millis since epoch
        weight: weightInKg,
        reps: form.children[1].value,
        rpe: form.children[2].value,
        id: Date.now(),
    });
    saveData();

    const card = document.querySelector(
        `.exercise-card[data-exercise-id="${exerciseId}"]`
    );
    if (card) {
        const completedSetsEl = card.querySelector(".completed-sets");
        const trackerText = card.querySelector(".sets-tracker").textContent;
        const totalSets = parseInt(trackerText.split("/")[1], 10);

        let completedCount = parseInt(completedSetsEl.textContent, 10) + 1;
        completedSetsEl.textContent = completedCount;

        if (completedCount >= totalSets) {
            card.classList.add("completed");
            setTimeout(() => {
                card.remove();
                if (
                    document.querySelectorAll(
                        "#workout-display .exercise-card[data-exercise-id]:not(.completed)"
                    ).length === 0
                ) {
                    workoutDisplay.innerHTML =
                        "<p>Workout Complete! Great job!</p>";
                    appData.workoutHistory.push(currentWorkout);
                    saveData();
                }
            }, 500);
        }
    }

    displayProgress(exerciseSelect.value);
    SnackBar({
        message: "Set Logged!  " + getRandomEncouragement(),
        fixed: true,
        status: "green",
    });
    form.reset();
};

// ==============================
//         PROGRESS LOGIC
// ==============================
const createLogListItem = (log, exerciseId) => {
    const li = document.createElement("li");
    const exercise = getExerciseById(Number(exerciseId));

    if (!exercise) {
        console.warn(
            `Data mismatch: Could not find exercise with ID: ${exerciseId}. Skipping log item. Please clear local storage if this persists.`
        );
        return document.createDocumentFragment();
    }

    const weight = parseFloat(log.weight) || 0;
    const displayWeight =
        currentUnit === "lbs"
            ? (weight * KG_TO_LBS).toFixed(1)
            : weight.toFixed(1);

    const details = document.createElement("span");
    details.innerHTML = `</strong> ${displayWeight} ${currentUnit} x ${
        log.reps
    } reps <span class="rpe-tag">(${log.rpe || "N/A"})</span>`;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-log-btn";
    deleteBtn.setAttribute("aria-label", "Delete log entry");
    deleteBtn.dataset.logId = log.id;
    deleteBtn.dataset.exerciseId = exerciseId;
    deleteBtn.appendChild(
        document.getElementById("trash-icon-template").content.cloneNode(true)
    );

    li.appendChild(details);
    li.appendChild(deleteBtn);
    return li;
};

function setArrowDirection(arrowEl, direction) {
    if (direction === "down") {
        arrowEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
    } else {
        arrowEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
    }
}

const displayProgress = (filterExerciseId = "all") => {
    if (!appData?.exerciseHistory) return;

    if (progressChartInstance) {
        progressChartInstance.destroy();
        progressChartInstance = null;
    }
    chartCanvas.style.display = "none";

    progressLog.innerHTML = "";
    let allLogs = [];

    Object.entries(appData.exerciseHistory).forEach(([exerciseId, logs]) => {
        exerciseId = Number.parseInt(exerciseId);
        if (getExerciseById(Number(exerciseId))) {
            if (
                filterExerciseId === "all" ||
                exerciseId === Number.parseInt(filterExerciseId)
            ) {
                const logsWithMeta = logs.map((log) => ({
                    ...log,
                    exerciseId,
                }));
                allLogs.push(...logsWithMeta);
            }
        }
    });

    if (allLogs.length === 0) {
        progressLog.innerHTML = "<p>No history for this selection.</p>";
        return;
    }

    // Group logs by date, then by exercise
    const logsByDate = {};
    allLogs.forEach((log) => {
        // Convert millis to YYYY-MM-DD string for grouping
        const dateStr = new Date(log.date).toISOString().split("T")[0];
        if (!logsByDate[dateStr]) logsByDate[dateStr] = {};
        if (!logsByDate[dateStr][log.exerciseId])
            logsByDate[dateStr][log.exerciseId] = [];
        logsByDate[dateStr][log.exerciseId].push(log);
    });

    // Sort dates descending
    const sortedDates = Object.keys(logsByDate).sort(
        (a, b) => new Date(b) - new Date(a)
    );

    sortedDates.forEach((date) => {
        // Date panel
        const datePanel = document.createElement("div");
        datePanel.className = "log-entry-group collapsible-panel";

        const dateHeader = document.createElement("div");
        dateHeader.className = "log-date-header collapsible-header";
        dateHeader.tabIndex = 0;
        dateHeader.innerHTML = `
            <span>${new Date(date + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })}</span>
            <span class="collapsible-arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </svg>
            </span>
        `;
        datePanel.appendChild(dateHeader);

        const exercisesContainer = document.createElement("div");
        exercisesContainer.className = "collapsible-content";

        // Group by exercise
        const exerciseIds = Object.keys(logsByDate[date]);
        exerciseIds.forEach((exerciseId) => {
            const exIdNum = Number(exerciseId);
            const exercise = getExerciseById(exIdNum);
            if (!exercise) return;

            // Exercise panel
            const exercisePanel = document.createElement("div");
            exercisePanel.className = "exercise-collapsible-panel";

            const exerciseHeader = document.createElement("div");
            exerciseHeader.className = "exercise-collapsible-header";
            exerciseHeader.tabIndex = 0;
            exerciseHeader.innerHTML = `
                <span>${exercise.name}</span>
                <span class="collapsible-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
                    </svg>
                </span>
            `;
            exercisePanel.appendChild(exerciseHeader);

            const logsList = document.createElement("ul");
            logsList.className = "exercise-collapsible-content";
            logsByDate[date][exIdNum].forEach((log) => {
                logsList.appendChild(createLogListItem(log, exIdNum));
            });

            exercisePanel.appendChild(logsList);
            exercisesContainer.appendChild(exercisePanel);

            // Exercise expand/collapse
            exerciseHeader.addEventListener("click", () => {
                logsList.classList.toggle("collapsed");
                const arrow =
                    exerciseHeader.querySelector(".collapsible-arrow");
                setArrowDirection(
                    arrow,
                    logsList.classList.contains("collapsed") ? "right" : "down"
                );
            });
            exerciseHeader.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") exerciseHeader.click();
            });
        });

        datePanel.appendChild(exercisesContainer);
        progressLog.appendChild(datePanel);

        // Date expand/collapse
        dateHeader.addEventListener("click", () => {
            exercisesContainer.classList.toggle("collapsed");
            const arrow = dateHeader.querySelector(".collapsible-arrow");
            setArrowDirection(
                arrow,
                exercisesContainer.classList.contains("collapsed")
                    ? "right"
                    : "down"
            );
        });
        dateHeader.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") dateHeader.click();
        });
    });

    if (filterExerciseId !== "all") {
        displayProgressChart(filterExerciseId);
    }
};

const displayProgressChart = (exerciseId) => {
    const logs = appData.exerciseHistory[exerciseId] || [];
    if (logs.length < 1) return;

    const volumeByDate = logs.reduce((acc, log) => {
        const date = new Date(log.date);
        const dateStr = date.toISOString().split("T")[0];
        if (!acc[dateStr]) acc[dateStr] = 0;
        const weightInCurrentUnit =
            currentUnit === "lbs" ? log.weight * KG_TO_LBS : log.weight;
        acc[dateStr] += weightInCurrentUnit * parseInt(log.reps, 10);
        return acc;
    }, {});

    const chartData = Object.entries(volumeByDate)
        .map(([date, volume]) => ({ x: date, y: volume }))
        .sort((a, b) => new Date(a.x) - new Date(b.x));

    if (chartData.length < 2) return;

    chartCanvas.style.display = "block";
    const ctx = chartCanvas.getContext("2d");

    const textColor = getComputedStyle(
        document.documentElement
    ).getPropertyValue("--text-color");
    const primaryColor = getComputedStyle(
        document.documentElement
    ).getPropertyValue("--primary-color");
    const borderColor = getComputedStyle(
        document.documentElement
    ).getPropertyValue("--border-color");

    progressChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [
                {
                    label: `Total Daily Volume (${currentUnit})`,
                    data: chartData,
                    borderColor: primaryColor,
                    backgroundColor: chroma(primaryColor).alpha(0.2).hex(),
                    fill: true,
                    tension: 0.1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "day",
                        tooltipFormat: "MMM d, yyyy",
                    },
                    title: {
                        display: true,
                        text: "Date",
                        color: textColor,
                    },
                    ticks: { color: textColor },
                    grid: { color: borderColor },
                },
                y: {
                    title: {
                        display: true,
                        text: `Total Volume (Weight x Reps)`,
                        color: textColor,
                    },
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: borderColor },
                },
            },
            plugins: {
                legend: { labels: { color: textColor } },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return ` Volume: ${context.parsed.y.toFixed(
                                0
                            )} ${currentUnit}`;
                        },
                    },
                },
            },
        },
    });
};

const deleteLogEntry = (exerciseId, logIdStr) => {
    if (!confirm("Are you sure you want to delete this set?")) return;
    if (!appData.exerciseHistory[exerciseId]) return;
    const logId = parseInt(logIdStr, 10);
    let dateOfDeletedLog = "";
    const logIndex = appData.exerciseHistory[exerciseId].findIndex(
        (log) => log.id === logId
    );

    if (logIndex > -1) {
        dateOfDeletedLog = appData.exerciseHistory[exerciseId][logIndex].date;
        appData.exerciseHistory[exerciseId].splice(logIndex, 1);
    } else {
        return;
    }

    if (appData.exerciseHistory[exerciseId].length === 0)
        delete appData.exerciseHistory[exerciseId];

    const isAnyLogInHistory = Object.values(appData.exerciseHistory)
        .flat()
        .some((log) => log.date === dateOfDeletedLog);
    if (!isAnyLogInHistory) {
        const consistencyIndex = consistency.indexOf(dateOfDeletedLog);
        if (consistencyIndex > -1) consistency.splice(consistencyIndex, 1);
    }

    saveData();
    displayProgress(exerciseSelect.value);
    renderCalendar();
    if (workoutModal.style.display === "flex") {
        showWorkoutModalForDate(dateOfDeletedLog);
    }
};

const populateExerciseSelect = () => {
    exerciseSelect.innerHTML =
        '<option value="all">-- Show All / Select for Graph --</option>';
    const sortedExercises = [...exercises]
        .filter((e) => e.type !== "warmup")
        .sort((a, b) => a.name.localeCompare(b.name));
    sortedExercises.forEach((ex) => {
        const option = document.createElement("option");
        option.value = ex.id;
        // Count the number of logs for this exercise
        const logCount = appData?.exerciseHistory?.[ex.id]?.length || 0;
        option.textContent = ex.name + (logCount > 0 ? ` (${logCount})` : "");
        if (logCount > 0) {
            option.classList.add("has-history");
        }
        exerciseSelect.appendChild(option);
    });
};

// ==============================
//         UNIT & UI HELPERS
// ==============================
const setUnit = (unit) => {
    appData.settings.units = unit;
    saveData();
    updateUnitUI();
    displayProgress(exerciseSelect.value);
};

const updateUnitUI = () => {
    unitKgBtn.classList.toggle("active", appData?.settings?.units === "kg");
    unitLbsBtn.classList.toggle("active", appData?.settings?.units === "lbs");
    document.querySelectorAll(".weight-input").forEach((input) => {
        input.placeholder = `Weight in ${currentUnit}`;
    });
};
// ==============================
//         CALENDAR LOGIC
// ==============================
const updateCalendarDisplay = () => {
    datePickerInstance.setDate(currentCalendarDate, true);
    renderCalendar();
};
const goToToday = () => {
    currentCalendarDate = new Date();
    updateCalendarDisplay();
};
const renderCalendar = () => {
    calendarGrid.innerHTML = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const month = currentCalendarDate.getMonth(),
        year = currentCalendarDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();
    ["S", "M", "T", "W", "T", "F", "S"].forEach((d) => {
        const el = document.createElement("div");
        el.className = "day-name";
        el.textContent = d;
        calendarGrid.appendChild(el);
    });
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarGrid.appendChild(document.createElement("div"));
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement("div");
        dayEl.className = "day";
        const dayNumber = document.createElement("span");
        dayNumber.className = "day-number";
        dayNumber.textContent = i;
        dayEl.appendChild(dayNumber);
        const date = new Date(year, month, i);
        const dateString = date.toISOString().split("T")[0];
        if (
            appData.workoutHistory?.some((workout) => {
                const workoutDateString = new Date(workout.date)
                    .toISOString()
                    .split("T")[0];
                return workoutDateString === dateString;
            })
        ) {
            dayEl.classList.add("has-workout", "clickable-day");
            dayEl.dataset.date = dateString;
        }
        if (date.getTime() === today.getTime()) dayEl.classList.add("today");
        calendarGrid.appendChild(dayEl);
    }
};

// ==============================
//         MODAL LOGIC
// ==============================
const showWorkoutModalForDate = (dateString) => {
    const date = new Date(dateString);
    modalTitle.textContent = `Workout for ${date.toLocaleDateString(date, {
        weekday: "long",
        month: "long",
        day: "numeric",
    })}`;
    let logsForDay = [];
    Object.entries(appData.exerciseHistory).forEach(([exerciseId, logs]) => {
        const exercise = getExerciseById(Number(exerciseId));
        if (exercise) {
            logs.forEach((log) => {
                // To compare if a log is on a given day:
                const logDay = new Date(log.date).toISOString().split("T")[0];
                if (logDay === dateString) {
                    logsForDay.push({
                        ...log,
                        exerciseId: exerciseId,
                    });
                }
            });
        }
    });

    if (logsForDay.length === 0) {
        modalBody.innerHTML = "<br /><p>No sets were logged on this day.</p>";
    } else {
        // Sort logs by date/time, then by exerciseId for grouping
        logsForDay.sort((a, b) => {
            if (a.date !== b.date) return a.date - b.date;
            return a.exerciseId - b.exerciseId;
        });

        modalBody.innerHTML = "";
        let lastExerciseId = null;

        let groupDiv;
        let groupHeader;
        let repList;
        logsForDay.forEach((log, idx) => {
            const exercise = getExerciseById(Number(log.exerciseId));
            if (!exercise) return;

            // Start a new group if this is a new exercise or the first log
            if (log.exerciseId !== lastExerciseId) {
                // Exercise group container
                groupDiv = document.createElement("div");
                groupDiv.className = `modal-exercise-group`;

                // Exercise header
                groupHeader = document.createElement("div");
                groupHeader.className = "modal-exercise-header";
                groupHeader.textContent = exercise.name;
                groupDiv.appendChild(groupHeader);

                // div for this group
                repList = document.createElement("div");
                repList.className = "modal-exercise-log-list";
                groupDiv.appendChild(repList);
                modalBody.appendChild(groupDiv);
            }

            // Always append to the last group's ul
            repList.appendChild(createLogListItem(log, log.exerciseId));
            lastExerciseId = log.exerciseId;
        });
        // No need to append the list at the end, it's already in the groupDiv
    }
    workoutModal.style.display = "flex";
    document.body.classList.add("modal-open");
};

const closeWorkoutModal = () => {
    workoutModal.style.display = "none";
    if (descriptionModal.style.display !== "flex") {
        document.body.classList.remove("modal-open");
    }
};

const closeDescriptionModal = () => {
    descriptionModal.style.display = "none";
    if (workoutModal.style.display !== "flex") {
        document.body.classList.remove("modal-open");
    }
};

// ==============================
//         THEME & ICONS
// ==============================
const updateThemeColors = (hue, isDark) => {
    const root = document.documentElement;
    const baseColor = chroma.hsl(hue, 0.8, 0.55);

    if (isDark) {
        const primary = baseColor.brighten(0.5).saturate(0.5);
        root.style.setProperty("--primary-color", primary.hex());
        root.style.setProperty(
            "--primary-text",
            primary.luminance() > 0.5 ? "#000" : "#FFF"
        );
        root.style.setProperty("--bg-color", chroma.hsl(hue, 0.2, 0.1).hex());
        root.style.setProperty("--card-bg", chroma.hsl(hue, 0.2, 0.15).hex());
        root.style.setProperty(
            "--text-color",
            chroma.hsl(hue, 0.15, 0.85).hex()
        );
        root.style.setProperty(
            "--secondary-color",
            chroma.hsl(hue, 0.1, 0.6).hex()
        );
        root.style.setProperty(
            "--border-color",
            chroma.hsl(hue, 0.2, 0.25).hex()
        );
        root.style.setProperty(
            "--log-header-bg",
            chroma.hsl(hue, 0.2, 0.25).hex()
        );
        root.style.setProperty("--danger-color", "#e57373");
    } else {
        const primary = baseColor.darken(0.2).saturate(0.5);
        root.style.setProperty("--primary-color", primary.hex());
        root.style.setProperty(
            "--primary-text",
            primary.luminance() > 0.5 ? "#000" : "#FFF"
        );
        root.style.setProperty("--bg-color", chroma.hsl(hue, 0.3, 0.96).hex());
        root.style.setProperty("--card-bg", "#ffffff");
        root.style.setProperty(
            "--text-color",
            chroma.hsl(hue, 0.2, 0.25).hex()
        );
        root.style.setProperty(
            "--secondary-color",
            chroma.hsl(hue, 0.1, 0.5).hex()
        );
        root.style.setProperty(
            "--border-color",
            chroma.hsl(hue, 0.25, 0.9).hex()
        );
        root.style.setProperty(
            "--log-header-bg",
            chroma.hsl(hue, 0.25, 0.92).hex()
        );
        root.style.setProperty("--danger-color", "#dc3545");
    }

    const success = chroma.hsl((hue + 120) % 360, 0.6, isDark ? 0.6 : 0.5);
    root.style.setProperty("--success-color", success.hex());
    root.style.setProperty("--workout-indicator", success.hex());
    root.style.setProperty(
        "--today-border",
        root.style.getPropertyValue("--primary-color")
    );
};

const applyTheme = () => {
    const hue = localStorage.getItem("powerTrainerHue") || "210";
    const isDark = document.body.classList.contains("dark-mode");
    updateThemeColors(hue, isDark);
    updateThemeToggleIcon();
    if (progressChartInstance) {
        displayProgress(exerciseSelect.value);
    }
};

const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem(
        "powerTrainerTheme",
        document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
    applyTheme();
};

const updateIcons = () => {
    settingsBtn.innerHTML = "";
    settingsBtn.style.backgroundImage = "url('img/settings.svg')";
};

const updateThemeToggleIcon = () => {
    if (document.body.classList.contains("dark-mode")) {
        themeToggle.style.backgroundImage = "url('img/sun.svg')";
        themeToggle.setAttribute("aria-label", "Switch to light mode");
    } else {
        themeToggle.style.backgroundImage = "url('img/moon.svg')";
        themeToggle.setAttribute("aria-label", "Switch to dark mode");
    }
};

// ==============================
//         APP INIT & EVENT BINDINGS
// ==============================
const init = () => {
    loadData();
    updateIcons();
    updateUnitUI();
    populateExerciseSelect();
    displayProgress("all");
    updateThemeToggleIcon();

    datePickerInstance = flatpickr("#date-picker", {
        dateFormat: "F Y",
        defaultDate: currentCalendarDate,
        onChange: function (selectedDates) {
            currentCalendarDate = selectedDates[0] || new Date();
            renderCalendar();
        },
    });

    settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle("active");
    });
    themeToggle.addEventListener("click", toggleTheme);
    hueSlider.addEventListener("input", (e) => {
        localStorage.setItem("powerTrainerHue", e.target.value);
        applyTheme();
    });
    todayBtn.addEventListener("click", goToToday);
    unitKgBtn.addEventListener("click", () => setUnit("kg"));
    unitLbsBtn.addEventListener("click", () => setUnit("lbs"));
    difficultySelect.addEventListener("change", (e) => {
        currentDifficulty = e.target.value;
        saveData();
    });

    calendarGrid.addEventListener("click", (e) => {
        const day = e.target.closest(".clickable-day");
        if (day) showWorkoutModalForDate(day.dataset.date);
    });

    const logAndModalClickListener = (e) => {
        const deleteButton = e.target.closest(".delete-log-btn");
        if (deleteButton) {
            const { exerciseId, logId } = deleteButton.dataset;
            if (exerciseId && logId) deleteLogEntry(exerciseId, logId);
        }
    };
    progressLog.addEventListener("click", logAndModalClickListener);
    workoutModal.addEventListener("click", logAndModalClickListener);

    workoutModalCloseBtn.addEventListener("click", closeWorkoutModal);
    descriptionModalCloseBtn.addEventListener("click", closeDescriptionModal);
    workoutModal.addEventListener("click", (e) => {
        if (e.target === workoutModal) closeWorkoutModal();
    });
    descriptionModal.addEventListener("click", (e) => {
        if (e.target === descriptionModal) closeDescriptionModal();
    });
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (workoutModal.style.display === "flex") closeWorkoutModal();
            if (descriptionModal.style.display === "flex")
                closeDescriptionModal();
        }
    });
    window.addEventListener("click", (e) => {
        if (
            !settingsMenu.contains(e.target) &&
            !settingsBtn.contains(e.target)
        ) {
            settingsMenu.classList.remove("active");
        }
    });
    settingsMenu.addEventListener("click", (e) => e.stopPropagation());
    updateCalendarDisplay();
};

document.addEventListener("DOMContentLoaded", init);
