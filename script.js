// Solicitar permiso para notificaciones
if ("Notification" in window) {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

// ===============================
// ORGANIZADOR DE TAREAS
// ===============================

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

let tasks = JSON.parse(localStorage.getItem("studyflow_tasks")) || [];

// Guardar en LocalStorage
function saveTasks() {
    localStorage.setItem("studyflow_tasks", JSON.stringify(tasks));
}

// Renderizar tareas
function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task", `priority-${task.priority}`);

        if (task.completed) {
            taskDiv.classList.add("completed");
        }

        taskDiv.innerHTML = `
            <div class="task-info">
                <strong>${task.title}</strong>
                <small>${task.subject} | ${task.dueDate}</small>
            </div>

            <div class="task-buttons">
                <button onclick="toggleComplete(${task.id})">
                    ${task.completed ? "Desmarcar" : "Completar"}
                </button>
                <button onclick="deleteTask(${task.id})">
                    Eliminar
                </button>
            </div>
        `;

        taskList.appendChild(taskDiv);
    });
}

// Agregar tarea
taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newTask = {
        id: Date.now(),
        title: document.getElementById("title").value,
        subject: document.getElementById("subject").value,
        dueDate: document.getElementById("dueDate").value,
        priority: document.getElementById("priority").value,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
});

// Eliminar tarea
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Marcar como completada
function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

// Cargar tareas al iniciar
renderTasks();


// ===============================
// POMODORO
// ===============================

const timeDisplay = document.getElementById("time");
const modeDisplay = document.getElementById("mode");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

let studyTime = 25 * 60;
let breakTime = 5 * 60;
let currentTime = studyTime;
let timerInterval = null;
let isStudyMode = true;

// ===============================
// SONIDO POMODORO
// ===============================

function playSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine"; // sonido suave
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // tono
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime); // volumen bajo

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3); // duración 0.3 segundos
}

// Actualizar visual
function updateDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;

    timeDisplay.textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
}

// Iniciar temporizador
function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        currentTime--;

if (currentTime <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;

    playSound(); // 🔔 sonido

    if (Notification.permission === "granted") {
        new Notification(
            isStudyMode 
                ? "Tiempo de estudio terminado 📚"
                : "Tiempo de descanso terminado ☕"
        );
    }

    isStudyMode = !isStudyMode;
    currentTime = isStudyMode ? studyTime : breakTime;
    modeDisplay.textContent = isStudyMode
        ? "Modo estudio"
        : "Modo descanso";

    startTimer();
}

        updateDisplay();
    }, 1000);
}

// Reiniciar temporizador
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isStudyMode = true;
    currentTime = studyTime;
    modeDisplay.textContent = "Modo estudio";
    updateDisplay();
}

startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);

// Inicializar contador
updateDisplay();