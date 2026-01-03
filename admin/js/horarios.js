// ==========================================
// HORÁRIOS - JAVASCRIPT SIMPLIFICADO
// ==========================================

let AppState, elements;

const WEEKDAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  AppState = {
    selectedDay: null,
    schedule: {
      0: [], // Domingo
      1: [], // Segunda
      2: [], // Terça
      3: [], // Quarta
      4: [], // Quinta
      5: [], // Sexta
      6: []  // Sábado
    },
    blockedDates: []
  };
  
  elements = {
    sidebarToggle: document.getElementById('sidebarToggle'),
    adminSidebar: document.getElementById('adminSidebar'),
    logoutBtn: document.getElementById('logoutBtn'),
    weekdayBtns: document.querySelectorAll('.weekday-btn'),
    scheduleTitle: document.getElementById('scheduleTitle'),
    scheduleSubtitle: document.getElementById('scheduleSubtitle'),
    scheduleContent: document.getElementById('scheduleContent'),
    blockDate: document.getElementById('blockDate'),
    blockReason: document.getElementById('blockReason'),
    addBlockDate: document.getElementById('addBlockDate'),
    blockedDatesList: document.getElementById('blockedDatesList')
  };
  
  loadSavedData();
  setupEventListeners();
  updateWeekdayCounts();
  
  console.log('Gerenciar Horários carregado!');
});

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  elements.sidebarToggle.addEventListener('click', () => {
    elements.adminSidebar.classList.toggle('open');
  });
  
  elements.logoutBtn.addEventListener('click', () => AuthService.logout());
  
  elements.weekdayBtns.forEach(btn => {
    btn.addEventListener('click', () => selectDay(parseInt(btn.dataset.day)));
  });
  
  elements.addBlockDate.addEventListener('click', addBlockedDate);
}

// ==========================================
// SELECT DAY
// ==========================================

function selectDay(day) {
  AppState.selectedDay = day;
  
  // Update visual
  elements.weekdayBtns.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.day) === day);
  });
  
  // Update title
  elements.scheduleTitle.textContent = `${WEEKDAY_NAMES[day]}`;
  elements.scheduleSubtitle.textContent = `Gerencie os horários de atendimento`;
  
  // Render schedule
  renderDaySchedule(day);
}

// ==========================================
// RENDER DAY SCHEDULE
// ==========================================

function renderDaySchedule(day) {
  const slots = AppState.schedule[day] || [];
  
  let html = '';
  
  // Add Time Form
  html += `
    <div class="add-time-form">
      <h3 class="add-time-form-title">➕ Adicionar Horário</h3>
      <div class="add-time-fields">
        <div class="form-group">
          <label class="form-label">Das</label>
          <input type="time" class="form-input" id="timeStart" value="09:00">
        </div>
        <div class="form-group">
          <label class="form-label">Até</label>
          <input type="time" class="form-input" id="timeEnd" value="10:00">
        </div>
        <button class="btn btn-primary" onclick="addTimeSlot()">
          ➕ Adicionar
        </button>
      </div>
    </div>
  `;
  
  // Time Slots List
  if (slots.length > 0) {
    html += `<div class="time-slots-list">`;
    
    // Sort by start time
    const sortedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start));
    
    sortedSlots.forEach((slot, index) => {
      const duration = calculateDuration(slot.start, slot.end);
      html += `
        <div class="time-slot-item">
          <div>
            <span class="time-slot-time">${slot.start} - ${slot.end}</span>
            <span class="time-slot-duration">(${duration})</span>
          </div>
          <div class="time-slot-actions">
            <button class="btn-icon btn-icon-delete" onclick="removeTimeSlot(${index})" title="Remover">
              🗑️
            </button>
          </div>
        </div>
      `;
    });
    
    html += `</div>`;
  } else {
    html += `
      <div class="schedule-empty" style="padding: var(--spacing-xl);">
        <div class="schedule-empty-icon">🕐</div>
        <h3 class="schedule-empty-title">Nenhum horário cadastrado</h3>
        <p class="schedule-empty-description">Adicione horários usando o formulário acima</p>
      </div>
    `;
  }
  
  // Copy from another day
  html += `
    <div class="copy-from-section">
      <h4 class="copy-from-title">📋 Ou copiar horários de outro dia</h4>
      <div class="copy-from-fields">
        <div class="form-group">
          <select class="form-select" id="copyFromDay">
            <option value="">Selecione um dia</option>
            ${WEEKDAY_NAMES.map((name, i) => {
              if (i !== day && AppState.schedule[i].length > 0) {
                return `<option value="${i}">${name} (${AppState.schedule[i].length} horários)</option>`;
              }
              return '';
            }).join('')}
          </select>
        </div>
        <button class="btn btn-secondary" onclick="copyFromDay()">
          📋 Copiar
        </button>
      </div>
    </div>
  `;
  
  elements.scheduleContent.innerHTML = html;
}

// ==========================================
// ADD TIME SLOT
// ==========================================

function addTimeSlot() {
  const start = document.getElementById('timeStart').value;
  const end = document.getElementById('timeEnd').value;
  
  if (!start || !end) {
    Notifications.error('Preencha os horários de início e fim');
    return;
  }
  
  if (start >= end) {
    Notifications.error('O horário de fim deve ser maior que o de início');
    return;
  }
  
  // Check for conflicts
  const conflicts = AppState.schedule[AppState.selectedDay].some(slot => {
    return (start >= slot.start && start < slot.end) || 
           (end > slot.start && end <= slot.end) ||
           (start <= slot.start && end >= slot.end);
  });
  
  if (conflicts) {
    Notifications.error('Este horário conflita com um horário já cadastrado');
    return;
  }
  
  // Add slot
  AppState.schedule[AppState.selectedDay].push({ start, end });
  
  saveData();
  renderDaySchedule(AppState.selectedDay);
  updateWeekdayCounts();
  
  Notifications.success('Horário adicionado!');
}

// ==========================================
// REMOVE TIME SLOT
// ==========================================

function removeTimeSlot(index) {
  if (!confirm('Tem certeza que deseja remover este horário?')) return;
  
  AppState.schedule[AppState.selectedDay].splice(index, 1);
  
  saveData();
  renderDaySchedule(AppState.selectedDay);
  updateWeekdayCounts();
  
  Notifications.success('Horário removido!');
}

// ==========================================
// COPY FROM DAY
// ==========================================

function copyFromDay() {
  const fromDay = document.getElementById('copyFromDay').value;
  
  if (!fromDay) {
    Notifications.error('Selecione um dia para copiar');
    return;
  }
  
  const fromDayInt = parseInt(fromDay);
  const slots = AppState.schedule[fromDayInt];
  
  if (slots.length === 0) {
    Notifications.error('O dia selecionado não tem horários');
    return;
  }
  
  if (!confirm(`Copiar ${slots.length} horário(s) de ${WEEKDAY_NAMES[fromDayInt]}?\n\nIsso substituirá os horários atuais.`)) {
    return;
  }
  
  AppState.schedule[AppState.selectedDay] = JSON.parse(JSON.stringify(slots));
  
  saveData();
  renderDaySchedule(AppState.selectedDay);
  updateWeekdayCounts();
  
  Notifications.success(`${slots.length} horário(s) copiado(s)!`);
}

// ==========================================
// BLOCKED DATES
// ==========================================

function addBlockedDate() {
  const date = elements.blockDate.value;
  const reason = elements.blockReason.value || 'Sem motivo especificado';
  
  if (!date) {
    Notifications.error('Selecione uma data');
    return;
  }
  
  // Check if already blocked
  if (AppState.blockedDates.some(b => b.date === date)) {
    Notifications.warning('Esta data já está bloqueada');
    return;
  }
  
  AppState.blockedDates.push({
    date,
    reason,
    createdAt: new Date().toISOString()
  });
  
  elements.blockDate.value = '';
  elements.blockReason.value = '';
  
  saveData();
  renderBlockedDates();
  
  Notifications.success('Data bloqueada!');
}

function removeBlockedDate(date) {
  if (!confirm('Tem certeza que deseja desbloquear esta data?')) return;
  
  AppState.blockedDates = AppState.blockedDates.filter(b => b.date !== date);
  
  saveData();
  renderBlockedDates();
  
  Notifications.success('Data desbloqueada!');
}

function renderBlockedDates() {
  if (AppState.blockedDates.length === 0) {
    elements.blockedDatesList.innerHTML = `
      <div class="schedule-empty">
        <div class="schedule-empty-icon">📅</div>
        <h3 class="schedule-empty-title">Nenhuma data bloqueada</h3>
        <p class="schedule-empty-description">As datas bloqueadas aparecerão aqui</p>
      </div>
    `;
    return;
  }
  
  const sorted = [...AppState.blockedDates].sort((a, b) => a.date.localeCompare(b.date));
  
  elements.blockedDatesList.innerHTML = sorted.map(block => `
    <div class="blocked-date-item">
      <div class="blocked-date-info">
        <div class="blocked-date-date">
          📅 ${formatDate(block.date)}
        </div>
        <div class="blocked-date-reason">${block.reason}</div>
      </div>
      <button class="btn-icon btn-icon-delete" onclick="removeBlockedDate('${block.date}')" title="Desbloquear">
        ✓ Desbloquear
      </button>
    </div>
  `).join('');
}

// ==========================================
// UPDATE COUNTS
// ==========================================

function updateWeekdayCounts() {
  elements.weekdayBtns.forEach(btn => {
    const day = parseInt(btn.dataset.day);
    const count = AppState.schedule[day].length;
    const countEl = btn.querySelector('.weekday-count');
    countEl.textContent = `${count} ${count === 1 ? 'horário' : 'horários'}`;
  });
}

// ==========================================
// SAVE & LOAD
// ==========================================

function saveData() {
  localStorage.setItem('schedule_data', JSON.stringify({
    schedule: AppState.schedule,
    blockedDates: AppState.blockedDates
  }));
}

function loadSavedData() {
  try {
    const saved = localStorage.getItem('schedule_data');
    if (saved) {
      const data = JSON.parse(saved);
      AppState.schedule = data.schedule || AppState.schedule;
      AppState.blockedDates = data.blockedDates || [];
      renderBlockedDates();
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

// ==========================================
// UTILS
// ==========================================

function calculateDuration(start, end) {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const diff = endMinutes - startMinutes;
  
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// Expor funções globalmente
window.addTimeSlot = addTimeSlot;
window.removeTimeSlot = removeTimeSlot;
window.copyFromDay = copyFromDay;
window.removeBlockedDate = removeBlockedDate;