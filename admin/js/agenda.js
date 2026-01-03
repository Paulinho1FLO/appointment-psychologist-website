// ==========================================
// AGENDA - JAVASCRIPT
// ==========================================

// Criar referências de atalho
let AppState, elements;

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar estado
  AppState = {
    appointments: [],
    filteredAppointments: [],
    selectedAppointments: new Set(),
    currentPage: 1,
    itemsPerPage: 10,
    currentView: 'list',
    filters: {
      search: '',
      status: '',
      dateStart: '',
      dateEnd: ''
    },
    currentAppointmentId: null,
    selectedStatus: null
  };
  
  // Inicializar elementos
  elements = {
    sidebarToggle: document.getElementById('sidebarToggle'),
    adminSidebar: document.getElementById('adminSidebar'),
    logoutBtn: document.getElementById('logoutBtn'),
    searchInput: document.getElementById('searchInput'),
    statusFilter: document.getElementById('statusFilter'),
    dateStart: document.getElementById('dateStart'),
    dateEnd: document.getElementById('dateEnd'),
    clearFilters: document.getElementById('clearFilters'),
    viewToggleBtns: document.querySelectorAll('.view-toggle-btn'),
    listView: document.getElementById('listView'),
    calendarView: document.getElementById('calendarView'),
    tableCount: document.getElementById('tableCount'),
    appointmentsBody: document.getElementById('appointmentsBody'),
    selectAll: document.getElementById('selectAll'),
    pagination: document.getElementById('pagination'),
    exportBtn: document.getElementById('exportBtn'),
    detailSidebar: document.getElementById('detailSidebar'),
    closeSidebar: document.getElementById('closeSidebar'),
    detailContent: document.getElementById('detailContent'),
    bulkActionsBar: document.getElementById('bulkActionsBar'),
    selectedCount: document.getElementById('selectedCount'),
    bulkConfirm: document.getElementById('bulkConfirm'),
    bulkCancel: document.getElementById('bulkCancel'),
    bulkDeselect: document.getElementById('bulkDeselect'),
    statusModal: document.getElementById('statusModal'),
    statusOptions: document.getElementById('statusOptions'),
    cancelStatusChange: document.getElementById('cancelStatusChange'),
    confirmStatusChange: document.getElementById('confirmStatusChange')
  };
  
  await loadAppointments();
  setupEventListeners();
  renderTable();
  
  console.log('Página de agendamentos carregada!');
});

// ==========================================
// LOAD APPOINTMENTS
// ==========================================

async function loadAppointments() {
  try {
    AppState.appointments = generateMockAppointments(25);
    AppState.filteredAppointments = [...AppState.appointments];
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
    Notifications.error('Erro ao carregar agendamentos');
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  elements.sidebarToggle.addEventListener('click', () => {
    elements.adminSidebar.classList.toggle('open');
  });
  
  elements.logoutBtn.addEventListener('click', () => AuthService.logout());
  
  elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
  elements.statusFilter.addEventListener('change', applyFilters);
  elements.dateStart.addEventListener('change', applyFilters);
  elements.dateEnd.addEventListener('change', applyFilters);
  elements.clearFilters.addEventListener('click', clearFilters);
  
  elements.viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  
  elements.selectAll.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.appointment-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = e.target.checked;
      if (e.target.checked) {
        AppState.selectedAppointments.add(cb.dataset.id);
      } else {
        AppState.selectedAppointments.delete(cb.dataset.id);
      }
    });
    updateBulkActions();
  });
  
  elements.closeSidebar.addEventListener('click', closeDetailSidebar);
  elements.bulkConfirm.addEventListener('click', () => bulkUpdateStatus('confirmado'));
  elements.bulkCancel.addEventListener('click', () => bulkUpdateStatus('cancelado'));
  elements.bulkDeselect.addEventListener('click', deselectAll);
  elements.cancelStatusChange.addEventListener('click', closeStatusModal);
  elements.confirmStatusChange.addEventListener('click', confirmStatusChange);
  
  document.querySelectorAll('.status-option').forEach(opt => {
    opt.addEventListener('click', () => selectStatus(opt.dataset.status));
  });
  
  elements.exportBtn.addEventListener('click', exportToCSV);
}

// ==========================================
// FILTERS
// ==========================================

function applyFilters() {
  AppState.filters.search = elements.searchInput.value.toLowerCase();
  AppState.filters.status = elements.statusFilter.value;
  AppState.filters.dateStart = elements.dateStart.value;
  AppState.filters.dateEnd = elements.dateEnd.value;
  
  AppState.filteredAppointments = AppState.appointments.filter(apt => {
    if (AppState.filters.search) {
      const searchText = `${apt.fullName} ${apt.cpf} ${apt.whatsapp}`.toLowerCase();
      if (!searchText.includes(AppState.filters.search)) return false;
    }
    
    if (AppState.filters.status && apt.status !== AppState.filters.status) {
      return false;
    }
    
    if (AppState.filters.dateStart && apt.date < AppState.filters.dateStart) {
      return false;
    }
    if (AppState.filters.dateEnd && apt.date > AppState.filters.dateEnd) {
      return false;
    }
    
    return true;
  });
  
  AppState.currentPage = 1;
  renderTable();
}

function clearFilters() {
  elements.searchInput.value = '';
  elements.statusFilter.value = '';
  elements.dateStart.value = '';
  elements.dateEnd.value = '';
  
  AppState.filters = {
    search: '',
    status: '',
    dateStart: '',
    dateEnd: ''
  };
  
  AppState.filteredAppointments = [...AppState.appointments];
  AppState.currentPage = 1;
  renderTable();
}

// ==========================================
// RENDER TABLE
// ==========================================

function renderTable() {
  const start = (AppState.currentPage - 1) * AppState.itemsPerPage;
  const end = start + AppState.itemsPerPage;
  const pageData = AppState.filteredAppointments.slice(start, end);
  
  elements.tableCount.textContent = `(${AppState.filteredAppointments.length})`;
  
  if (pageData.length === 0) {
    elements.appointmentsBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <h3 class="empty-state-title">Nenhum agendamento encontrado</h3>
            <p class="empty-state-description">Não há agendamentos que correspondam aos filtros selecionados.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  elements.appointmentsBody.innerHTML = pageData.map(apt => `
    <tr class="appointment-row">
      <td>
        <input 
          type="checkbox" 
          class="appointment-checkbox" 
          data-id="${apt.id}"
          ${AppState.selectedAppointments.has(apt.id) ? 'checked' : ''}
          onchange="toggleSelect('${apt.id}')"
        >
      </td>
      <td>
        <strong>${apt.fullName}</strong><br>
        <small style="color: var(--text-secondary);">CPF: ${Validators.formatCPF(apt.cpf)}</small>
      </td>
      <td>${DateUtils.formatDateShort(new Date(apt.date))}</td>
      <td><strong>${apt.time}</strong></td>
      <td>${Validators.formatPhone(apt.whatsapp)}</td>
      <td>
        <span class="badge badge-${apt.status === 'confirmado' ? 'success' : apt.status === 'cancelado' ? 'error' : 'warning'}">
          ${apt.status}
        </span>
      </td>
      <td>
        <div class="table-actions row-actions">
          <button class="btn-icon btn-icon-view" onclick="viewAppointment('${apt.id}')" title="Ver detalhes">👁️</button>
          <button class="btn-icon btn-icon-edit" onclick="openStatusModal('${apt.id}')" title="Alterar status">✏️</button>
          <button class="btn-icon btn-icon-delete" onclick="deleteAppointment('${apt.id}')" title="Excluir">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
  
  renderPagination();
}

// ==========================================
// PAGINATION
// ==========================================

function renderPagination() {
  const totalPages = Math.ceil(AppState.filteredAppointments.length / AppState.itemsPerPage);
  
  if (totalPages <= 1) {
    elements.pagination.innerHTML = '';
    return;
  }
  
  let html = `
    <button class="pagination-btn" onclick="changePage(${AppState.currentPage - 1})" ${AppState.currentPage === 1 ? 'disabled' : ''}>
      ← Anterior
    </button>
  `;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= AppState.currentPage - 1 && i <= AppState.currentPage + 1)) {
      html += `
        <button 
          class="pagination-btn ${i === AppState.currentPage ? 'active' : ''}" 
          onclick="changePage(${i})"
        >
          ${i}
        </button>
      `;
    } else if (i === AppState.currentPage - 2 || i === AppState.currentPage + 2) {
      html += `<span class="pagination-info">...</span>`;
    }
  }
  
  html += `
    <button class="pagination-btn" onclick="changePage(${AppState.currentPage + 1})" ${AppState.currentPage === totalPages ? 'disabled' : ''}>
      Próximo →
    </button>
  `;
  
  elements.pagination.innerHTML = html;
}

function changePage(page) {
  const totalPages = Math.ceil(AppState.filteredAppointments.length / AppState.itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  AppState.currentPage = page;
  renderTable();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// SELECTION
// ==========================================

function toggleSelect(id) {
  if (AppState.selectedAppointments.has(id)) {
    AppState.selectedAppointments.delete(id);
  } else {
    AppState.selectedAppointments.add(id);
  }
  updateBulkActions();
}

function deselectAll() {
  AppState.selectedAppointments.clear();
  document.querySelectorAll('.appointment-checkbox').forEach(cb => cb.checked = false);
  elements.selectAll.checked = false;
  updateBulkActions();
}

function updateBulkActions() {
  const count = AppState.selectedAppointments.size;
  elements.selectedCount.textContent = count;
  
  if (count > 0) {
    elements.bulkActionsBar.classList.add('show');
  } else {
    elements.bulkActionsBar.classList.remove('show');
  }
}

// ==========================================
// DETAIL SIDEBAR
// ==========================================

function viewAppointment(id) {
  const appointment = AppState.appointments.find(a => a.id === id);
  if (!appointment) return;
  
  AppState.currentAppointmentId = id;
  
  elements.detailContent.innerHTML = `
    <div class="detail-section">
      <div class="appointment-status-badge ${appointment.status}">
        ${appointment.status}
      </div>
    </div>
    
    <div class="detail-section">
      <h3 class="detail-section-title">Informações Pessoais</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Nome Completo</div>
          <div class="detail-value large">${appointment.fullName}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">CPF</div>
          <div class="detail-value">${Validators.formatCPF(appointment.cpf)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Data de Nascimento</div>
          <div class="detail-value">${DateUtils.formatDateShort(new Date(appointment.birthdate))}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">WhatsApp</div>
          <div class="detail-value">${Validators.formatPhone(appointment.whatsapp)}</div>
        </div>
      </div>
      <div class="detail-item" style="margin-top: var(--spacing-md);">
        <div class="detail-label">Endereço</div>
        <div class="detail-value">${appointment.address}</div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3 class="detail-section-title">Agendamento</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Data</div>
          <div class="detail-value large">${DateUtils.formatDate(new Date(appointment.date))}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Horário</div>
          <div class="detail-value large">${appointment.time}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Fuso Horário</div>
          <div class="detail-value">${appointment.timezone}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Agendado em</div>
          <div class="detail-value">${new Date(appointment.createdAt).toLocaleString('pt-BR')}</div>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h3 class="detail-section-title">Informações da Consulta</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Primeira vez em terapia?</div>
          <div class="detail-value">${appointment.firstTime === 'sim' ? '✅ Sim' : '❌ Não'}</div>
        </div>
      </div>
      <div class="detail-item" style="margin-top: var(--spacing-md);">
        <div class="detail-label">Motivo do atendimento</div>
        <div class="detail-notes-box">
          <p class="detail-notes-text">${appointment.reason}</p>
        </div>
      </div>
    </div>
    
    <div class="detail-actions">
      <button class="btn btn-primary btn-block" onclick="openStatusModal('${id}')">
        ✏️ Alterar Status
      </button>
      <a href="https://wa.me/55${appointment.whatsapp}" target="_blank" class="btn btn-secondary btn-block">
        💬 Contatar via WhatsApp
      </a>
      <button class="btn btn-outline btn-block" onclick="deleteAppointment('${id}')">
        🗑️ Excluir Agendamento
      </button>
    </div>
  `;
  
  elements.detailSidebar.classList.add('open');
}

function closeDetailSidebar() {
  elements.detailSidebar.classList.remove('open');
  AppState.currentAppointmentId = null;
}

// ==========================================
// STATUS MODAL
// ==========================================

function openStatusModal(id) {
  AppState.currentAppointmentId = id;
  AppState.selectedStatus = null;
  
  document.querySelectorAll('.status-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  elements.statusModal.classList.remove('hidden');
}

function closeStatusModal() {
  elements.statusModal.classList.add('hidden');
  AppState.currentAppointmentId = null;
  AppState.selectedStatus = null;
}

function selectStatus(status) {
  AppState.selectedStatus = status;
  
  document.querySelectorAll('.status-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  document.querySelector(`.status-option[data-status="${status}"]`).classList.add('selected');
}

async function confirmStatusChange() {
  if (!AppState.selectedStatus) {
    Notifications.warning('Selecione um status');
    return;
  }
  
  try {
    const appointment = AppState.appointments.find(a => a.id === AppState.currentAppointmentId);
    if (appointment) {
      appointment.status = AppState.selectedStatus;
    }
    
    Notifications.success('Status atualizado com sucesso!');
    closeStatusModal();
    renderTable();
    
    if (elements.detailSidebar.classList.contains('open')) {
      viewAppointment(AppState.currentAppointmentId);
    }
    
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    Notifications.error('Erro ao atualizar status');
  }
}

// ==========================================
// BULK ACTIONS
// ==========================================

async function bulkUpdateStatus(status) {
  if (AppState.selectedAppointments.size === 0) return;
  
  const count = AppState.selectedAppointments.size;
  const confirmed = confirm(`Alterar status de ${count} agendamento(s) para "${status}"?`);
  
  if (!confirmed) return;
  
  try {
    AppState.selectedAppointments.forEach(id => {
      const apt = AppState.appointments.find(a => a.id === id);
      if (apt) apt.status = status;
    });
    
    Notifications.success(`${count} agendamento(s) atualizado(s)!`);
    deselectAll();
    renderTable();
    
  } catch (error) {
    console.error('Erro ao atualizar em lote:', error);
    Notifications.error('Erro ao atualizar agendamentos');
  }
}

// ==========================================
// DELETE
// ==========================================

async function deleteAppointment(id) {
  const confirmed = confirm('Tem certeza que deseja excluir este agendamento?');
  if (!confirmed) return;
  
  try {
    AppState.appointments = AppState.appointments.filter(a => a.id !== id);
    AppState.filteredAppointments = AppState.filteredAppointments.filter(a => a.id !== id);
    
    Notifications.success('Agendamento excluído com sucesso!');
    closeDetailSidebar();
    renderTable();
    
  } catch (error) {
    console.error('Erro ao excluir:', error);
    Notifications.error('Erro ao excluir agendamento');
  }
}

// ==========================================
// VIEW SWITCH
// ==========================================

function switchView(view) {
  AppState.currentView = view;
  
  elements.viewToggleBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  
  if (view === 'list') {
    elements.listView.classList.add('active');
    elements.calendarView.classList.remove('active');
  } else {
    elements.listView.classList.remove('active');
    elements.calendarView.classList.add('active');
  }
}

// ==========================================
// EXPORT
// ==========================================

function exportToCSV() {
  const headers = ['Nome', 'CPF', 'Data Nascimento', 'WhatsApp', 'Endereço', 'Data', 'Horário', 'Primeira Vez', 'Motivo', 'Status'];
  const rows = AppState.filteredAppointments.map(apt => [
    apt.fullName,
    apt.cpf,
    apt.birthdate,
    apt.whatsapp,
    apt.address,
    apt.date,
    apt.time,
    apt.firstTime,
    apt.reason,
    apt.status
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agendamentos_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  Notifications.success('Arquivo exportado com sucesso!');
}

// ==========================================
// UTILS
// ==========================================

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function generateMockAppointments(count) {
  const names = ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Oliveira', 'Carla Lima'];
  const statuses = ['pendente', 'confirmado', 'cancelado'];
  const reasons = [
    'Ansiedade e estresse no trabalho',
    'Dificuldades de relacionamento',
    'Autoconhecimento e desenvolvimento pessoal',
    'Depressão e tristeza constante',
    'Problemas familiares'
  ];
  const appointments = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30) - 10);
    
    appointments.push({
      id: `apt-${i}`,
      fullName: names[Math.floor(Math.random() * names.length)],
      cpf: '12345678900',
      birthdate: '1990-01-01',
      whatsapp: '11999999999',
      address: 'São Paulo/SP',
      date: date.toISOString().split('T')[0],
      time: `${9 + Math.floor(Math.random() * 9)}:00`,
      timezone: 'Horário de Brasília',
      firstTime: Math.random() > 0.5 ? 'sim' : 'não',
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date().toISOString()
    });
  }
  
  return appointments;
}

// Expor funções globalmente
window.viewAppointment = viewAppointment;
window.openStatusModal = openStatusModal;
window.deleteAppointment = deleteAppointment;
window.toggleSelect = toggleSelect;
window.changePage = changePage;