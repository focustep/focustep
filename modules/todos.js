import { tr } from './i18n.js';
import { uid, todayKey, dateKey } from './helpers.js';
import { playSoftClick, playChime } from './sound.js';

let todos = [];
let saveTimeout = null;
let lastAddedId = null;
let onTodosChangedCallback = null;

export function setOnTodosChanged(cb) {
  onTodosChangedCallback = cb;
}

export function getTodos() {
  return todos;
}

function autoResizeTextarea(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

export function renderTodos() {
  const todoList = document.getElementById('todo-list');
  const focusTodoList = document.getElementById('focus-todo-list');
  const targets = [todoList, focusTodoList].filter(Boolean);
  if (targets.length === 0) return;

  targets.forEach(function(listEl) {
    if (todos.length === 0) {
      listEl.innerHTML = '<p class="todo-empty">' + tr().todoEmpty + '</p>';
      return;
    }

    listEl.innerHTML = '';
    todos.forEach(function(item) {
      const row = document.createElement('div');
      row.className = 'todo-item' + (item.done ? ' checked' : '');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = item.done;
      cb.addEventListener('change', function() {
        item.done = cb.checked;
        renderTodos();
        playSoftClick();
        scheduleSave();
      });

      const text = document.createElement('textarea');
      text.className = 'todo-text';
      text.rows = 1;
      text.value = item.text;
      text.setAttribute('aria-label', 'Reja matni');

      text.addEventListener('input', function() {
        autoResizeTextarea(text);
        item.text = text.value;
        scheduleSave();
      });

      text.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          text.blur();
        }
      });

      const remove = document.createElement('button');
      remove.className = 'todo-remove';
      remove.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      remove.setAttribute('aria-label', "O'chirish");
      remove.addEventListener('click', function() {
        row.classList.add('leaving');
        row.addEventListener('transitionend', function() {
          todos = todos.filter(function(t){ return t.id !== item.id; });
          renderTodos();
          scheduleSave();
        }, { once: true });
      });

      row.appendChild(cb);
      row.appendChild(text);
      row.appendChild(remove);
      listEl.appendChild(row);

      requestAnimationFrame(function() {
        autoResizeTextarea(text);
      });

      if (item.id === lastAddedId) {
        row.classList.add('appear');
        requestAnimationFrame(function() {
          requestAnimationFrame(function(){ row.classList.remove('appear'); });
        });
      }
    });
  });
}

export function scheduleSave() {
  const saveInfo = document.getElementById('save-info');
  const focusSaveInfo = document.getElementById('focus-save-info');
  clearTimeout(saveTimeout);
  if (saveInfo) saveInfo.textContent = tr().saving;
  if (focusSaveInfo) focusSaveInfo.textContent = tr().saving;

  saveTimeout = setTimeout(function() {
    try {
      localStorage.setItem(todayKey('notes'), JSON.stringify(todos));
      if (saveInfo) saveInfo.textContent = tr().saved;
      if (focusSaveInfo) focusSaveInfo.textContent = tr().saved;
    } catch(e) {
      if (saveInfo) saveInfo.textContent = tr().saveError;
      if (focusSaveInfo) focusSaveInfo.textContent = tr().saveError;
    }
    if (typeof onTodosChangedCallback === 'function') {
      onTodosChangedCallback(dateKey(new Date()));
    }
  }, 400);
}

export function addTodo(customText, fromSource = 'main') {
  let val = '';
  if (typeof customText === 'string' && customText.trim()) {
    val = customText.trim();
  } else {
    const inputId = fromSource === 'focus' ? 'focus-todo-input' : 'todo-input';
    const input = document.getElementById(inputId) || document.getElementById('todo-input') || document.getElementById('focus-todo-input');
    if (input) {
      val = input.value.trim();
      input.value = '';
      input.style.height = '';
    }
  }

  if (!val) return;
  const newItem = { id: uid(), text: val, done: false };
  todos.push(newItem);
  lastAddedId = newItem.id;
  renderTodos();
  playChime('phase');
  scheduleSave();
}

export function loadNotes() {
  try {
    const raw = localStorage.getItem(todayKey('notes'));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) todos = parsed;
    }
  } catch(e){}
  renderTodos();
}

export function initTodos() {
  const todoAddBtn = document.getElementById('todo-add-btn');
  const todoInput = document.getElementById('todo-input');

  if (todoAddBtn) todoAddBtn.addEventListener('click', () => addTodo(null, 'main'));
  if (todoInput) {
    todoInput.addEventListener('input', () => autoResizeTextarea(todoInput));
    todoInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addTodo(null, 'main');
      }
    });
  }

  const focusTodoAddBtn = document.getElementById('focus-todo-add-btn');
  const focusTodoInput = document.getElementById('focus-todo-input');

  if (focusTodoAddBtn) focusTodoAddBtn.addEventListener('click', () => addTodo(null, 'focus'));
  if (focusTodoInput) {
    focusTodoInput.addEventListener('input', () => autoResizeTextarea(focusTodoInput));
    focusTodoInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addTodo(null, 'focus');
      }
    });
  }

  window.addEventListener('resize', function() {
    document.querySelectorAll('.todo-text, #todo-input, #focus-todo-input').forEach(autoResizeTextarea);
  });

  loadNotes();
}
