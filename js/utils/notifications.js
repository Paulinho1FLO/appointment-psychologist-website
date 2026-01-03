// ==========================================
// NOTIFICATIONS
// Sistema de notificações toast
// ==========================================

const Notifications = {
  /**
   * Container para as notificações
   */
  container: null,

  /**
   * Inicializa o sistema de notificações
   */
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
      `;
      document.body.appendChild(this.container);
    }
  },

  /**
   * Mostra uma notificação
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo (success, error, warning, info)
   * @param {number} duration - Duração em ms (padrão: 5000)
   */
  show(message, type = 'info', duration = 5000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
      success: { bg: '#E8F5EE', border: '#7CC6A5', text: '#5FA988' },
      error: { bg: '#FDEAE8', border: '#E8998D', text: '#D97D6F' },
      warning: { bg: '#FEF3E2', border: '#F4B860', text: '#D97706' },
      info: { bg: '#E8F1F4', border: '#4A90A4', text: '#3A7285' }
    };

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const color = colors[type] || colors.info;
    
    toast.style.cssText = `
      background: ${color.bg};
      border-left: 4px solid ${color.border};
      color: ${color.text};
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    toast.innerHTML = `
      <span style="font-size: 20px; flex-shrink: 0;">${icons[type]}</span>
      <span style="flex: 1; font-size: 14px; line-height: 1.5;">${message}</span>
      <button style="
        background: none;
        border: none;
        color: ${color.text};
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">×</button>
    `;

    // Adicionar animação CSS
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Fechar ao clicar no X ou no toast
    const closeToast = () => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          this.container.removeChild(toast);
        }
      }, 300);
    };

    toast.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      closeToast();
    });

    toast.addEventListener('click', closeToast);

    this.container.appendChild(toast);

    // Auto-remover após duração
    if (duration > 0) {
      setTimeout(closeToast, duration);
    }

    return toast;
  },

  /**
   * Mostra notificação de sucesso
   * @param {string} message - Mensagem
   * @param {number} duration - Duração em ms
   */
  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  },

  /**
   * Mostra notificação de erro
   * @param {string} message - Mensagem
   * @param {number} duration - Duração em ms
   */
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  },

  /**
   * Mostra notificação de aviso
   * @param {string} message - Mensagem
   * @param {number} duration - Duração em ms
   */
  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  },

  /**
   * Mostra notificação informativa
   * @param {string} message - Mensagem
   * @param {number} duration - Duração em ms
   */
  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  },

  /**
   * Remove todas as notificações
   */
  clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
};

// Exportar para uso global
window.Notifications = Notifications;