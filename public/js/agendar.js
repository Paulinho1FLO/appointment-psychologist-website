// ==========================================
// PÁGINA DE AGENDAMENTO - JAVASCRIPT
// ==========================================

// Estado da aplicação
const AppState = {
  currentMonth: new Date(),
  selectedDate: null,
  selectedTime: null,
  selectedTimezone: 'Horário de Brasília',
  availableSlots: [], // Virá do Firebase
  isSubmitting: false
};

// Elementos DOM
const elements = {
  calendarGrid: document.getElementById('calendarGrid'),
  currentMonth: document.getElementById('currentMonth'),
  prevMonth: document.getElementById('prevMonth'),
  nextMonth: document.getElementById('nextMonth'),
  timezone: document.getElementById('timezone'),
  timeSlots: document.getElementById('timeSlots'),
  selectionSummary: document.getElementById('selectionSummary'),
  selectedDate: document.getElementById('selectedDate'),
  selectedTime: document.getElementById('selectedTime'),
  selectedTimezone: document.getElementById('selectedTimezone'),
  form: document.getElementById('appointmentForm'),
  submitBtn: document.getElementById('submitBtn'),
  confirmationModal: document.getElementById('confirmationModal'),
  // Campos do formulário
  fullName: document.getElementById('fullName'),
  cpf: document.getElementById('cpf'),
  birthdate: document.getElementById('birthdate'),
  whatsapp: document.getElementById('whatsapp'),
  address: document.getElementById('address'),
  reason: document.getElementById('reason'),
  termsAccepted: document.getElementById('termsAccepted'),
  ageValidation: document.getElementById('ageValidation')
};

// ==========================================
// CALENDÁRIO
// ==========================================

/**
 * Renderiza o calendário
 */
function renderCalendar() {
  const year = AppState.currentMonth.getFullYear();
  const month = AppState.currentMonth.getMonth();
  
  // Atualizar título
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  elements.currentMonth.textContent = `${months[month]} ${year}`;
  
  // Primeiro e último dia do mês
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  // Limpar grid (mantendo headers)
  const headers = elements.calendarGrid.querySelectorAll('.calendar-day-header');
  elements.calendarGrid.innerHTML = '';
  headers.forEach(header => elements.calendarGrid.appendChild(header));
  
  // Dias do mês anterior (para preencher o início)
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dayElement = createDayElement(day, true, new Date(year, month - 1, day));
    elements.calendarGrid.appendChild(dayElement);
  }
  
  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayElement = createDayElement(day, false, date);
    elements.calendarGrid.appendChild(dayElement);
  }
  
  // Dias do próximo mês (para completar a grid)
  const remainingCells = 42 - elements.calendarGrid.children.length + 7; // 42 = 6 semanas * 7 dias
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day);
    const dayElement = createDayElement(day, true, date);
    elements.calendarGrid.appendChild(dayElement);
  }
  
  // Habilitar/desabilitar botões de navegação
  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  elements.prevMonth.disabled = isCurrentMonth;
}

/**
 * Cria elemento de dia do calendário
 */
function createDayElement(day, otherMonth, date) {
  const dayElement = document.createElement('div');
  dayElement.className = 'calendar-day';
  dayElement.textContent = day;
  
  if (otherMonth) {
    dayElement.classList.add('other-month');
  }
  
  // Marcar hoje
  if (DateUtils.isToday(date)) {
    dayElement.classList.add('today');
  }
  
  // Desabilitar dias passados
  if (DateUtils.isPast(date)) {
    dayElement.classList.add('disabled');
  }
  
  // Desabilitar finais de semana (se aplicável - pode ser configurado)
  // if (DateUtils.isWeekend(date) && !otherMonth) {
  //   dayElement.classList.add('disabled');
  // }
  
  // Marcar dia selecionado
  if (AppState.selectedDate && 
      date.toDateString() === AppState.selectedDate.toDateString()) {
    dayElement.classList.add('selected');
  }
  
  // Click handler
  if (!dayElement.classList.contains('disabled') && !otherMonth) {
    dayElement.addEventListener('click', () => selectDate(date));
  }
  
  return dayElement;
}

/**
 * Seleciona uma data
 */
function selectDate(date) {
  AppState.selectedDate = date;
  AppState.selectedTime = null; // Reset horário ao mudar data
  
  renderCalendar();
  loadAvailableTimeSlots(date);
  updateSelectionSummary();
  validateForm();
}

/**
 * Carrega horários disponíveis para uma data
 * TODO: Integrar com Firebase
 */
function loadAvailableTimeSlots(date) {
  const container = elements.timeSlots;
  container.innerHTML = '<h3>Horários Disponíveis</h3>';
  
  // Por enquanto, horários mockados
  // TODO: Buscar do Firebase usando AvailabilityService
  const slots = DateUtils.generateTimeSlots(9, 18, 60); // 9h às 18h, intervalos de 1h
  
  if (slots.length === 0) {
    container.innerHTML += '<div class="time-slots-empty">Nenhum horário disponível nesta data.</div>';
    return;
  }
  
  const grid = document.createElement('div');
  grid.className = 'time-slots-grid';
  
  slots.forEach(slot => {
    const slotElement = document.createElement('button');
    slotElement.type = 'button';
    slotElement.className = 'time-slot';
    slotElement.textContent = slot.label;
    
    // Marcar como selecionado
    if (AppState.selectedTime === slot.label) {
      slotElement.classList.add('selected');
    }
    
    // Click handler
    slotElement.addEventListener('click', () => selectTime(slot.label));
    
    grid.appendChild(slotElement);
  });
  
  container.appendChild(grid);
}

/**
 * Seleciona um horário
 */
function selectTime(time) {
  AppState.selectedTime = time;
  
  // Atualizar visualização
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.remove('selected');
    if (slot.textContent === time) {
      slot.classList.add('selected');
    }
  });
  
  updateSelectionSummary();
  validateForm();
}

/**
 * Atualiza o resumo da seleção
 */
function updateSelectionSummary() {
  if (AppState.selectedDate && AppState.selectedTime) {
    elements.selectionSummary.classList.remove('hidden');
    elements.selectedDate.textContent = DateUtils.formatDate(AppState.selectedDate);
    elements.selectedTime.textContent = AppState.selectedTime;
    elements.selectedTimezone.textContent = AppState.selectedTimezone || '-';
  } else {
    elements.selectionSummary.classList.add('hidden');
  }
}

// ==========================================
// NAVEGAÇÃO DO CALENDÁRIO
// ==========================================

elements.prevMonth.addEventListener('click', () => {
  AppState.currentMonth = DateUtils.addMonths(AppState.currentMonth, -1);
  renderCalendar();
});

elements.nextMonth.addEventListener('click', () => {
  AppState.currentMonth = DateUtils.addMonths(AppState.currentMonth, 1);
  renderCalendar();
});

// ==========================================
// FUSO HORÁRIO
// ==========================================

elements.timezone.addEventListener('input', (e) => {
  AppState.selectedTimezone = e.target.value;
  updateSelectionSummary();
});

// ==========================================
// VALIDAÇÃO DO FORMULÁRIO
// ==========================================

/**
 * Formata CPF enquanto digita
 */
elements.cpf.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length <= 11) {
    e.target.value = Validators.formatCPF(value);
  }
});

/**
 * Formata telefone enquanto digita
 */
elements.whatsapp.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length <= 11) {
    e.target.value = Validators.formatPhone(value);
  }
});

/**
 * Valida idade ao alterar data de nascimento
 */
elements.birthdate.addEventListener('change', (e) => {
  const birthdate = new Date(e.target.value);
  const isValid = Validators.validateMinAge(birthdate, 18);
  
  if (!isValid) {
    elements.ageValidation.classList.remove('hidden');
    e.target.classList.add('is-invalid');
  } else {
    elements.ageValidation.classList.add('hidden');
    e.target.classList.remove('is-invalid');
  }
  
  validateForm();
});

/**
 * Valida formulário completo
 */
function validateForm() {
  const firstTimeSelected = document.querySelector('input[name="firstTime"]:checked');
  
  const isValid = 
    AppState.selectedDate &&
    AppState.selectedTime &&
    Validators.required(elements.fullName.value) &&
    Validators.validateFullName(elements.fullName.value) &&
    Validators.validateCPF(elements.cpf.value) &&
    elements.birthdate.value &&
    Validators.validateMinAge(new Date(elements.birthdate.value), 18) &&
    Validators.validatePhone(elements.whatsapp.value) &&
    Validators.required(elements.address.value) &&
    Validators.required(elements.timezone.value) &&
    firstTimeSelected &&
    Validators.required(elements.reason.value) &&
    elements.termsAccepted.checked;
  
  elements.submitBtn.disabled = !isValid;
  return isValid;
}

// Validar em tempo real
[elements.fullName, elements.cpf, elements.whatsapp, elements.address, elements.timezone, elements.reason, elements.termsAccepted]
  .forEach(el => {
    el.addEventListener('input', validateForm);
    el.addEventListener('change', validateForm);
  });

// Validar radio buttons
document.querySelectorAll('input[name="firstTime"]').forEach(radio => {
  radio.addEventListener('change', validateForm);
});

// ==========================================
// ENVIO DO FORMULÁRIO
// ==========================================

elements.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!validateForm() || AppState.isSubmitting) {
    return;
  }
  
  AppState.isSubmitting = true;
  elements.submitBtn.classList.add('loading');
  elements.submitBtn.disabled = true;
  
  try {
    const firstTimeSelected = document.querySelector('input[name="firstTime"]:checked');
    
    // Preparar dados do agendamento
    const appointmentData = {
      // Dados pessoais
      fullName: Validators.sanitize(elements.fullName.value),
      cpf: elements.cpf.value.replace(/\D/g, ''),
      birthdate: elements.birthdate.value,
      whatsapp: elements.whatsapp.value.replace(/\D/g, ''),
      address: Validators.sanitize(elements.address.value),
      firstTime: firstTimeSelected ? firstTimeSelected.value : '',
      reason: Validators.sanitize(elements.reason.value),
      
      // Dados do agendamento
      date: DateUtils.toISODate(AppState.selectedDate),
      time: AppState.selectedTime,
      timezone: Validators.sanitize(elements.timezone.value),
      
      // Metadados
      status: 'pendente',
      createdAt: new Date().toISOString(),
      termsAccepted: true
    };
    
    // TODO: Salvar no Firebase
    // await AppointmentService.create(appointmentData);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Agendamento criado:', appointmentData);
    
    // Mostrar modal de confirmação
    showConfirmationModal(appointmentData);
    
    // Notificação de sucesso
    Notifications.success('Agendamento realizado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    Notifications.error('Erro ao realizar agendamento. Tente novamente.');
  } finally {
    AppState.isSubmitting = false;
    elements.submitBtn.classList.remove('loading');
  }
});

/**
 * Mostra modal de confirmação
 */
function showConfirmationModal(data) {
  document.getElementById('confirmName').textContent = data.fullName;
  document.getElementById('confirmDate').textContent = DateUtils.formatDate(AppState.selectedDate);
  document.getElementById('confirmTime').textContent = data.time;
  document.getElementById('confirmWhatsapp').textContent = Validators.formatPhone(data.whatsapp);
  
  elements.confirmationModal.classList.remove('hidden');
  
  // Resetar formulário
  elements.form.reset();
  AppState.selectedDate = null;
  AppState.selectedTime = null;
  renderCalendar();
  elements.selectionSummary.classList.add('hidden');
  elements.timeSlots.innerHTML = '<h3>Horários Disponíveis</h3><div class="time-slots-empty">Selecione uma data para ver os horários disponíveis</div>';
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Renderizar calendário inicial
  renderCalendar();
  
  // Definir timezone padrão
  elements.timezone.value = AppState.selectedTimezone;
  
  // Validação inicial
  validateForm();
  
  console.log('Página de agendamento carregada!');
});