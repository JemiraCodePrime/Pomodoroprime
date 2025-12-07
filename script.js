// ========================================
// GESTION DES ONGLETS
// ========================================
// Cette section gère la navigation entre les 3 onglets (To-Do, Pomodoro, Calculatrice)

// Sélection de tous les boutons d'onglets dans la navigation
const tabBtns = document.querySelectorAll(".tab-btn");
// Sélection de tous les contenus d'onglets
const tabContents = document.querySelectorAll(".tab-content");

// Pour chaque bouton d'onglet, on ajoute un gestionnaire de clic
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Récupération de l'identifiant de l'onglet cible via l'attribut data-tab
    const targetTab = btn.dataset.tab;

    // Retirer la classe "active" de tous les boutons et contenus
    // Cela désactive visuellement tous les onglets
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Ajouter la classe "active" au bouton cliqué et à son contenu correspondant
    // Cela active visuellement l'onglet sélectionné
    btn.classList.add("active");
    document.getElementById(targetTab).classList.add("active");
  });
});

// ========================================
// TO-DO LIST
// ========================================
// Gestion complète de la liste de tâches avec ajout, suppression, et sauvegarde

// Sélection des éléments DOM nécessaires pour la to-do list
const taskInput = document.getElementById("taskInput"); // Champ de saisie
const addBtn = document.getElementById("addBtn"); // Bouton d'ajout
const taskList = document.getElementById("taskList"); // Liste des tâches
const emptyState = document.getElementById("emptyState"); // Message quand liste vide
const taskCount = document.getElementById("taskCount"); // Compteur de tâches

// Tableau qui stockera toutes les tâches
let tasks = [];
// Chargement des tâches sauvegardées au démarrage
loadTasks();

// Ajout d'événements : clic sur le bouton ou appui sur Entrée
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

/**
 * Fonction pour ajouter une nouvelle tâche
 * Crée un objet tâche avec un ID unique, le texte et un état "non complété"
 */
function addTask() {
  // Récupération et nettoyage du texte saisi
  const taskText = taskInput.value.trim();

  // Si le champ est vide, on remet juste le focus et on quitte
  if (taskText === "") {
    taskInput.focus();
    return;
  }

  // Création d'un objet tâche avec :
  // - id unique basé sur le timestamp
  // - texte de la tâche
  // - état complété à false
  const task = {
    id: Date.now(),
    text: taskText,
    completed: false,
  };

  // Ajout de la tâche au tableau
  tasks.push(task);
  // Sauvegarde dans localStorage
  saveTasks();
  // Rafraîchissement de l'affichage
  renderTasks();
  // Réinitialisation du champ de saisie
  taskInput.value = "";
  taskInput.focus();
}

/**
 * Suppression d'une tâche par son ID
 * Utilise filter() pour créer un nouveau tableau sans la tâche supprimée
 */
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

/**
 * Basculer l'état complété/non complété d'une tâche
 * Trouve la tâche par son ID et inverse son état
 */
function toggleTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

/**
 * Rendu de toutes les tâches dans le DOM
 * Vide d'abord la liste puis recrée chaque élément
 */
function renderTasks() {
  // Vider complètement la liste HTML
  taskList.innerHTML = "";

  // Si aucune tâche, afficher le message d'état vide
  if (tasks.length === 0) {
    emptyState.style.display = "block";
    updateTaskCount();
    return;
  }

  // Masquer le message d'état vide
  emptyState.style.display = "none";

  // Pour chaque tâche, créer un élément <li> avec :
  // - une checkbox pour marquer complété
  // - le texte de la tâche
  // - un bouton de suppression
  tasks.forEach((task) => {
    const li = document.createElement("li");
    // Ajoute la classe "completed" si la tâche est terminée
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
            <div class="task-content">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                Supprimer
            </button>
        `;
    taskList.appendChild(li);
  });

  // Mise à jour du compteur
  updateTaskCount();
}

/**
 * Met à jour l'affichage du compteur de tâches
 * Affiche le nombre total et le nombre de tâches terminées
 */
function updateTaskCount() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  if (total === 0) {
    taskCount.textContent = "0 tâche";
  } else {
    // Gère correctement le pluriel en français
    taskCount.textContent = `${total} tâche${
      total > 1 ? "s" : ""
    } · ${completed} terminée${completed > 1 ? "s" : ""}`;
  }
}

/**
 * Sauvegarde les tâches dans localStorage
 * Utilise JSON.stringify pour convertir le tableau en texte
 */
function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (e) {
    console.error("Erreur de sauvegarde:", e);
  }
}

/**
 * Charge les tâches depuis localStorage au démarrage
 * Utilise JSON.parse pour reconvertir le texte en tableau
 */
function loadTasks() {
  try {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      tasks = JSON.parse(saved);
      renderTasks();
    }
  } catch (e) {
    console.error("Erreur de chargement:", e);
    tasks = [];
  }
}

/**
 * Échappe les caractères HTML pour éviter les injections XSS
 * Convertit les caractères spéciaux en entités HTML sécurisées
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// POMODORO TIMER
// ========================================
// Chronomètre de productivité avec technique Pomodoro (25 min travail / 5 min pause)

// Sélection des éléments DOM du timer
const timerDisplay = document.getElementById("timerDisplay"); // Affichage MM:SS
const timerMode = document.getElementById("timerMode"); // "Travail" ou "Pause"
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const presetBtns = document.querySelectorAll(".preset-btn"); // Boutons 25min, 5min, 15min
const sessionCountEl = document.getElementById("sessionCount");
const progressCircle = document.querySelector(".progress-ring-circle"); // Cercle de progression SVG

// Variables d'état du timer
let timerInterval = null; // Référence à l'intervalle setInterval
let timeLeft = 25 * 60; // Temps restant en secondes (25 minutes par défaut)
let totalTime = 25 * 60; // Temps total de la session
let isRunning = false; // Le timer est-il en cours ?
let currentMode = "work"; // Mode actuel : "work" ou "break"
let sessionCount = loadSessionCount(); // Nombre de sessions complétées

// Configuration du cercle de progression SVG
const radius = 120; // Rayon du cercle
const circumference = 2 * Math.PI * radius; // Périmètre du cercle (pour le calcul du stroke-dasharray)
progressCircle.style.strokeDasharray = circumference; // Définit la longueur totale du trait
progressCircle.style.strokeDashoffset = 0; // Commence avec le cercle complet

// Création dynamique d'un dégradé SVG pour le cercle de progression
const svg = document.querySelector(".progress-ring");
const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
const gradient = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "linearGradient"
);
gradient.setAttribute("id", "gradient");
gradient.innerHTML = `
    <stop offset="0%" style="stop-color:#667eea"/>
    <stop offset="100%" style="stop-color:#764ba2"/>
`;
defs.appendChild(gradient);
svg.insertBefore(defs, svg.firstChild);

// Affichage initial du nombre de sessions
updateSessionDisplay();

// Gestionnaires d'événements pour les boutons du timer
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// Pour chaque bouton preset (25min, 5min, 15min)
presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // On ne peut pas changer de preset si le timer est en cours
    if (isRunning) return;

    // Mise à jour visuelle : retirer "active" de tous, ajouter au bouton cliqué
    presetBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // Récupération des données du preset
    const minutes = parseInt(btn.dataset.minutes);
    currentMode = btn.dataset.mode; // "work" ou "break"
    totalTime = minutes * 60; // Conversion en secondes
    timeLeft = totalTime;

    // Mise à jour de l'affichage
    updateTimerDisplay();
    updateProgressCircle();
    updateModeDisplay();
  });
});

/**
 * Démarre le timer
 * Lance un intervalle qui décrémente chaque seconde
 */
function startTimer() {
  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;

  // setInterval exécute la fonction toutes les 1000ms (1 seconde)
  timerInterval = setInterval(() => {
    timeLeft--; // Décrémente le temps restant
    updateTimerDisplay(); // Met à jour l'affichage
    updateProgressCircle(); // Met à jour le cercle de progression

    // Quand le timer atteint 0
    if (timeLeft <= 0) {
      pauseTimer(); // Arrête le timer
      playSound(); // Joue un son de notification

      // Si on était en mode travail, on incrémente le compteur de sessions
      if (currentMode === "work") {
        sessionCount++;
        saveSessionCount();
        updateSessionDisplay();
      }

      // Alerte pour informer l'utilisateur
      alert(
        currentMode === "work"
          ? "Session terminée ! Prenez une pause."
          : "Pause terminée ! Retour au travail."
      );
    }
  }, 1000);
}

/**
 * Met le timer en pause
 * Arrête l'intervalle et réactive le bouton start
 */
function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval); // Annule l'intervalle
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

/**
 * Réinitialise le timer à sa valeur de départ
 * Remet le temps restant au temps total
 */
function resetTimer() {
  pauseTimer(); // D'abord mettre en pause
  timeLeft = totalTime; // Remettre au temps initial
  updateTimerDisplay();
  updateProgressCircle();
}

/**
 * Met à jour l'affichage du temps au format MM:SS
 * Utilise padStart pour toujours avoir 2 chiffres
 */
function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60); // Division entière pour les minutes
  const seconds = timeLeft % 60; // Modulo pour les secondes restantes
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Met à jour le cercle de progression SVG
 * Calcule le strokeDashoffset en fonction du temps restant
 */
function updateProgressCircle() {
  const progress = timeLeft / totalTime; // Ratio entre 0 et 1
  const offset = circumference - progress * circumference; // Calcul de l'offset
  progressCircle.style.strokeDashoffset = offset;
}

/**
 * Met à jour le texte du mode (Travail / Pause)
 */
function updateModeDisplay() {
  timerMode.textContent = currentMode === "work" ? "Travail" : "Pause";
}

/**
 * Met à jour l'affichage du compteur de sessions
 */
function updateSessionDisplay() {
  sessionCountEl.textContent = sessionCount;
}

/**
 * Sauvegarde le compteur de sessions dans localStorage
 */
function saveSessionCount() {
  localStorage.setItem("pomodoroSessions", sessionCount.toString());
}

/**
 * Charge le compteur de sessions depuis localStorage
 * Retourne 0 si aucune valeur n'est trouvée
 */
function loadSessionCount() {
  return parseInt(localStorage.getItem("pomodoroSessions") || "0");
}

/**
 * Joue un son de notification simple
 * Utilise l'API Web Audio pour créer un bip sonore
 */
function playSound() {
  // Création d'un contexte audio
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator(); // Générateur de son
  const gainNode = audioContext.createGain(); // Contrôle du volume

  // Connexion : oscillator -> gain -> sortie audio
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Configuration du son : fréquence 800Hz, onde sinusoïdale
  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  // Fade out progressif du volume pour un son plus agréable
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5
  );

  // Démarrage et arrêt du son (durée 0.5 seconde)
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// ========================================
// CALCULATRICE
// ========================================
// Calculatrice complète avec opérations de base et support clavier

// Sélection des éléments DOM de la calculatrice
const calcCurrent = document.getElementById("calcCurrent"); // Affichage principal
const calcPrevious = document.getElementById("calcPrevious"); // Affichage de l'opération précédente
const numberBtns = document.querySelectorAll(".calc-btn.number"); // Boutons 0-9
const operatorBtns = document.querySelectorAll(".calc-btn.operator"); // +, -, ×, ÷, =
const functionBtns = document.querySelectorAll(".calc-btn.function"); // C, ⌫, %

// Variables d'état de la calculatrice
let currentValue = "0"; // Valeur actuellement affichée
let previousValue = ""; // Valeur précédente (avant l'opérateur)
let operation = null; // Opération en cours (add, subtract, multiply, divide)
let shouldResetScreen = false; // Indique si on doit réinitialiser l'écran au prochain chiffre

// Gestionnaires pour les boutons de chiffres
numberBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const number = btn.dataset.number;
    if (number !== undefined) {
      appendNumber(number); // Ajoute un chiffre
    } else if (btn.dataset.action === "decimal") {
      appendDecimal(); // Ajoute un point décimal
    }
  });
});

// Gestionnaires pour les boutons d'opérateurs
operatorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;

    if (action === "equals") {
      calculate(); // Calcule le résultat
    } else {
      setOperation(action); // Définit l'opération (+, -, ×, ÷)
    }
  });
});

// Gestionnaires pour les boutons de fonction
functionBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;

    switch (action) {
      case "clear":
        clear(); // Efface tout
        break;
      case "delete":
        deleteNumber(); // Efface le dernier chiffre
        break;
      case "percent":
        percentage(); // Convertit en pourcentage
        break;
    }
  });
});

/**
 * Ajoute un chiffre à la valeur actuelle
 * Si shouldResetScreen est true, remplace complètement la valeur
 */
function appendNumber(number) {
  if (shouldResetScreen) {
    currentValue = number;
    shouldResetScreen = false;
  } else {
    // Si la valeur actuelle est "0", on remplace, sinon on ajoute
    currentValue = currentValue === "0" ? number : currentValue + number;
  }
  updateDisplay();
}

/**
 * Ajoute un point décimal
 * Empêche d'avoir plusieurs points dans le même nombre
 */
function appendDecimal() {
  if (shouldResetScreen) {
    currentValue = "0.";
    shouldResetScreen = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

/**
 * Définit l'opération à effectuer (+, -, ×, ÷)
 * Si une opération est déjà en cours, calcule d'abord le résultat
 */
function setOperation(op) {
  if (operation !== null) calculate(); // Calcul en chaîne (ex: 5 + 3 + 2)
  operation = op;
  previousValue = currentValue;
  shouldResetScreen = true;
  updatePreviousDisplay();
}

/**
 * Effectue le calcul de l'opération en cours
 * Gère les 4 opérations de base avec protection division par zéro
 */
function calculate() {
  // Ne calcule pas si pas d'opération ou si on attend un nouveau nombre
  if (operation === null || shouldResetScreen) return;

  const prev = parseFloat(previousValue);
  const current = parseFloat(currentValue);

  // Validation des nombres
  if (isNaN(prev) || isNaN(current)) return;

  let result;

  // Effectue l'opération correspondante
  switch (operation) {
    case "add":
      result = prev + current;
      break;
    case "subtract":
      result = prev - current;
      break;
    case "multiply":
      result = prev * current;
      break;
    case "divide":
      // Protection contre la division par zéro
      result = current !== 0 ? prev / current : "Erreur";
      break;
    default:
      return;
  }

  // Mise à jour des valeurs après calcul
  currentValue = result.toString();
  operation = null;
  previousValue = "";
  shouldResetScreen = true;
  updateDisplay();
  updatePreviousDisplay();
}

/**
 * Réinitialise complètement la calculatrice
 * Remet toutes les valeurs à leur état initial
 */
function clear() {
  currentValue = "0";
  previousValue = "";
  operation = null;
  shouldResetScreen = false;
  updateDisplay();
  updatePreviousDisplay();
}

/**
 * Efface le dernier chiffre saisi (fonction backspace)
 * Si un seul chiffre reste, remet à "0"
 */
function deleteNumber() {
  if (currentValue.length === 1 || currentValue === "0") {
    currentValue = "0";
  } else {
    currentValue = currentValue.slice(0, -1); // Enlève le dernier caractère
  }
  updateDisplay();
}

/**
 * Convertit la valeur actuelle en pourcentage (divise par 100)
 */
function percentage() {
  currentValue = (parseFloat(currentValue) / 100).toString();
  updateDisplay();
}

/**
 * Met à jour l'affichage principal de la calculatrice
 */
function updateDisplay() {
  calcCurrent.textContent = currentValue;
}

/**
 * Met à jour l'affichage de l'opération en cours (ligne du haut)
 * Affiche "valeur précédente + opérateur"
 */
function updatePreviousDisplay() {
  if (operation && previousValue) {
    // Mapping des opérations vers leurs symboles
    const operatorSymbols = {
      add: "+",
      subtract: "−",
      multiply: "×",
      divide: "÷",
    };
    calcPrevious.textContent = `${previousValue} ${operatorSymbols[operation]}`;
  } else {
    calcPrevious.textContent = "";
  }
}

// ========================================
// SUPPORT CLAVIER POUR LA CALCULATRICE
// ========================================
// Permet d'utiliser la calculatrice avec le clavier

document.addEventListener("keydown", (e) => {
  // Vérifie si on est bien sur l'onglet calculatrice
  // Ne traite les touches que si la calculatrice est active
  if (!document.getElementById("calculator").classList.contains("active"))
    return;

  // Touches numériques 0-9
  if (e.key >= "0" && e.key <= "9") appendNumber(e.key);
  // Point décimal
  if (e.key === ".") appendDecimal();
  // Opérateurs
  if (e.key === "+") setOperation("add");
  if (e.key === "-") setOperation("subtract");
  if (e.key === "*") setOperation("multiply");
  if (e.key === "/") {
    e.preventDefault(); // Empêche le comportement par défaut du navigateur
    setOperation("divide");
  }
  // Calcul du résultat
  if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    calculate();
  }
  // Effacer tout
  if (e.key === "Escape") clear();
  // Effacer le dernier chiffre
  if (e.key === "Backspace") deleteNumber();
  // Pourcentage
  if (e.key === "%") percentage();
});