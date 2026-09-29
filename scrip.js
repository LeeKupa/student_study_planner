// Student Study Planner - JavaScript
// Stores tasks in localStorage so they persist between browser sessions.

const STORAGE_KEY = 'studyPlannerTasks';

let tasks = loadTasks();

// ---------- DOM References ----------
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const subjectInput = document.getElementById('task-subject');
const deadlineInput = document.getElementById('task-deadline');
const taskList = document.getElementById('task-list');
const completedList = document.getElementById('completed-list');
const emptyMsg = document.getElementById('empty-msg');
const emptyCompleted = document.getElementById('empty-completed');
const clearBtn = document.getElementById('clear-all');

// ---------- Storage ----------
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Helpers ----------
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

function daysUntil(iso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Overdue by ${Math.abs(diff)} day(s)`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  return `Due in ${diff} days`;
}

// ---------- Rendering ----------
function render() {
  taskList.innerHTML = '';
  completedList.innerHTML = '';

  const pending = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  // Sort pending by deadline ascending
  pending.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  pending.forEach(task => taskList.appendChild(createTaskElement(task)));
  completed.forEach(task => completedList.appendChild(createTaskElement(task)));

  emptyMsg.style.display = pending.length ? 'none' : 'block';
  emptyCompleted.style.display = completed.length ? 'none' : 'block';
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.done ? ' done' : '');

  const info = document.createElement('div');
  info.className = 'task-info';

  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;

  const meta = document.createElement('div');
  meta.className = 'task-meta';
  meta.textContent = `${task.subject} • ${formatDate(task.deadline)} • ${daysUntil(task.deadline)}`;

  info.appendChild(title);
  info.appendChild(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = task.done ? '↩️' : '✅';
  toggleBtn.title = task.done ? 'Mark as not done' : 'Mark as completed';
  toggleBtn.addEventListener('click', () => toggleTask(task.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = 'Delete task';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  actions.appendChild(toggleBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(info);
  li.appendChild(actions);
  return li;
}

// ---------- Actions ----------
function addTask(e) {
  e.preventDefault();

  const newTask = {
    id: Date.now().toString(),
    title: titleInput.value.trim(),
    subject: subjectInput.value.trim(),
    deadline: deadlineInput.value,
    done: false
  };

  if (!newTask.title || !newTask.subject || !newTask.deadline) return;

  tasks.push(newTask);
  saveTasks();
  render();
  form.reset();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearAll() {
  if (confirm('Delete all tasks? This cannot be undone.')) {
    tasks = [];
    saveTasks();
    render();
  }
}

// ---------- Events ----------
form.addEventListener('submit', addTask);
clearBtn.addEventListener('click', clearAll);

// ---------- Initial Render ----------
render();
