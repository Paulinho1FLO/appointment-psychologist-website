// ==========================================
// DASHBOARD - JAVASCRIPT
// ==========================================

// Elementos DOM
const elements = {
  // User info
  userName: document.getElementById('userName'),
  userEmail: document.getElementById('userEmail'),
  logoutBtn: document.getElementById('logoutBtn'),
  
  // Header
  currentDate: document.getElementById('currentDate'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  adminSidebar: document.getElementById('adminSidebar'),
  adminMain: document.getElementById('adminMain'),
  
  // Stats
  statToday: document.getElementById('statToday'),
  statWeek: document.getElementById('statWeek'),
  statPending: document.getElementById('statPending'),
  statConfirmed: document.getElementById('statConfirmed'),
  monthTotal: document.getElementById('monthTotal'),
  monthConfirmed: document.getElementById('monthConfirmed'),
  
  // Lists
  recentAppointments: document.getElementById('recentAppointments'),
  upcomingSessions: document.getElementById('upcomingSessions'),
  calendarOverview: document.getElementById('calendarOverview')
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticação
  if (!AuthService.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }
  
  // Carregar dados do usuário
  loadUserData();
  
  // Atualizar data atual
  updateCurrentDate();
  
  // Carregar estatísticas
  await loadStatistics();
  
  // Carregar agendamentos recentes
  await loadRecentAppointments();
  
  // Carregar próximas sessões
  await loadUpcomingSessions();
  
  // Renderizar calendário
  renderCalendarOverview();
  
  console.log('Dashboard carregado!');
});

// ==========================================
// USER DATA
// ==========================================

function loadUserData() {
  const user = AuthService.getCurrentUser();
  
  if (user) {
    elements.userName.textContent = user.displayName || 'Usuário';
    elements.userEmail.textContent = user.email;
  }
}

function updateCurrentDate() {
  const now = new Date();
  const formatted = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  elements.currentDate.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// ==========================================
// SIDEBAR TOGGLE
// ==========================================

elements.sidebarToggle.addEventListener('click', () => {
  elements.adminSidebar.classList.toggle('open');
  elements.adminMain.classList.toggle('expanded');
});

// ==========================================
// LOGOUT
// ==========================================

elements.logoutBtn.addEventListener('click', async () => {
  try {
    await AuthService.logout();
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    Notifications.error('Erro ao sair. Tente novamente.');
  }
});

// ==========================================
// STATISTICS
// ==========================================

async function loadStatistics() {
  try {
    // TODO: Buscar dados reais do Firebase
    // const stats = await AppointmentService.getStatistics();
    
    // Mock de dados
    const stats = {
      today: 3,
      week: 12,
      pending: 5,
      confirmed: 15,
      monthTotal: 28,
      monthConfirmed: 24
    };
    
    // Atualizar elementos
    animateNumber(elements.statToday, stats.today);
    animateNumber(elements.statWeek, stats.week);
    animateNumber(elements.statPending, stats.pending);
    animateNumber(elements.statConfirmed, stats.confirmed);
    animateNumber(elements.monthTotal, stats.monthTotal);
    animateNumber(elements.monthConfirmed, stats.monthConfirmed);
    
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

/**
 * Anima número de 0 até valor final
 */
function animateNumber(element, target, duration = 1000) {
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// ==========================================
// RECENT APPOINTMENTS
// ==========================================

async function loadRecentAppointments() {
  try {
    // TODO: Buscar dados reais do Firebase
    // const appointments = await AppointmentService.getRecent(5);
    
    // Mock de dados
    const appointments = [
      {
        id: '1',
        fullName: 'Maria Silva',
        date: '2024-01-15',
        time: '14:00',
        status: 'pendente',
        whatsapp: '11999999999'
      },
      {
        id: '2',
        fullName: 'João Santos',
        date: '2024-01-15',
        time: '15:00',
        status: 'confirmado',
        whatsapp: '11988888888'
      },
      {
        id: '3',
        fullName: 'Ana Costa',
        date: '2024-01-16',
        time: '10:00',
        status: 'pendente',
        whatsapp: '11977777777'
      }
    ];
    
    if (appointments.length === 0) {
      elements.recentAppointments.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <h3 class="empty-state-title">Nenhum agendamento</h3>
          <p class="empty-state-description">Você ainda não tem agendamentos recentes.</p>
        </div>
      `;
      return;
    }
    
    // Renderizar lista
    elements.recentAppointments.innerHTML = appointments.map(apt => `
      <div class="appointment-item status-${apt.status}" onclick="viewAppointment('${apt.id}')">
        <div class="appointment-avatar">${apt.fullName.charAt(0)}</div>
        <div class="appointment-details">
          <div class="appointment-name">${apt.fullName}</div>
          <div class="appointment-datetime">
            <span>📅 ${DateUtils.formatDate(new Date(apt.date))}</span>
            <span>🕐 ${apt.time}</span>
          </div>
        </div>
        <div class="appointment-status ${apt.status}">
          ${apt.status}
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
    elements.recentAppointments.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3 class="empty-state-title">Erro ao carregar</h3>
        <p class="empty-state-description">Ocorreu um erro ao carregar os agendamentos.</p>
      </div>
    `;
  }
}

// ==========================================
// UPCOMING SESSIONS
// ==========================================

async function loadUpcomingSessions() {
  try {
    // TODO: Buscar sessões confirmadas de hoje e amanhã
    
    // Mock de dados
    const sessions = [
      {
        id: '1',
        fullName: 'João Santos',
        time: '15:00',
        date: new Date(),
        whatsapp: '11988888888'
      },
      {
        id: '2',
        fullName: 'Carlos Oliveira',
        time: '16:00',
        date: new Date(Date.now() + 86400000), // Amanhã
        whatsapp: '11966666666'
      }
    ];
    
    if (sessions.length === 0) {
      return; // Empty state já está no HTML
    }
    
    elements.upcomingSessions.innerHTML = sessions.map(session => {
      const isToday = DateUtils.isToday(session.date);
      const dateLabel = isToday ? 'Hoje' : 'Amanhã';
      
      return `
        <div class="session-item">
          <div class="session-time">
            🕐 ${dateLabel} às ${session.time}
          </div>
          <div class="session-patient">${session.fullName}</div>
          <div class="session-contact">
            📱 ${Validators.formatPhone(session.whatsapp)}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Erro ao carregar sessões:', error);
  }
}

// ==========================================
// CALENDAR OVERVIEW
// ==========================================

function renderCalendarOverview() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Primeiro dia do mês
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  let html = '';
  
  // Headers dos dias da semana
  const dayHeaders = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  dayHeaders.forEach(day => {
    html += `<div class="calendar-mini-header">${day}</div>`;
  });
  
  // Dias do mês anterior (para preencher)
  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div class="calendar-mini-day disabled"></div>`;
  }
  
  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = DateUtils.isToday(date);
    const isPast = DateUtils.isPast(date);
    const hasAppointments = Math.random() > 0.7; // Mock - TODO: verificar no Firebase
    
    const classes = [
      'calendar-mini-day',
      isToday ? 'today' : '',
      isPast ? 'disabled' : '',
      hasAppointments ? 'has-appointments' : ''
    ].filter(Boolean).join(' ');
    
    html += `<div class="${classes}">${day}</div>`;
  }
  
  elements.calendarOverview.innerHTML = `
    <div class="calendar-mini-grid">
      ${html}
    </div>
  `;
}

// ==========================================
// VIEW APPOINTMENT
// ==========================================

function viewAppointment(id) {
  // Redirecionar para página de agendamentos com ID
  window.location.href = `agenda.html?id=${id}`;
}

// Expor para uso global
window.viewAppointment = viewAppointment;