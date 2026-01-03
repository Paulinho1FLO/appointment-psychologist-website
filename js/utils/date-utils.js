// ==========================================
// DATE UTILITIES
// Funções para manipulação de datas e fusos horários
// ==========================================

const DateUtils = {
  /**
   * Formata uma data para string legível
   * @param {Date} date - Data a ser formatada
   * @returns {string} Data formatada (ex: "15 de Janeiro de 2024")
   */
  formatDate(date) {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
  },

  /**
   * Formata uma data para string curta
   * @param {Date} date - Data a ser formatada
   * @returns {string} Data formatada (ex: "15/01/2024")
   */
  formatDateShort(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  },

  /**
   * Formata uma hora
   * @param {number} hour - Hora (0-23)
   * @param {number} minute - Minuto (0-59)
   * @returns {string} Hora formatada (ex: "14:30")
   */
  formatTime(hour, minute = 0) {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    return `${h}:${m}`;
  },

  /**
   * Retorna o nome do dia da semana
   * @param {Date} date - Data
   * @returns {string} Nome do dia (ex: "Segunda-feira")
   */
  getDayName(date) {
    const days = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    return days[date.getDay()];
  },

  /**
   * Retorna o nome curto do dia da semana
   * @param {Date} date - Data
   * @returns {string} Nome curto do dia (ex: "Seg")
   */
  getDayNameShort(date) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  },

  /**
   * Verifica se uma data é hoje
   * @param {Date} date - Data a verificar
   * @returns {boolean}
   */
  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  },

  /**
   * Verifica se uma data é no passado
   * @param {Date} date - Data a verificar
   * @returns {boolean}
   */
  isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  },

  /**
   * Verifica se uma data é final de semana
   * @param {Date} date - Data a verificar
   * @returns {boolean}
   */
  isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Domingo ou Sábado
  },

  /**
   * Adiciona dias a uma data
   * @param {Date} date - Data base
   * @param {number} days - Número de dias a adicionar
   * @returns {Date} Nova data
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  /**
   * Adiciona meses a uma data
   * @param {Date} date - Data base
   * @param {number} months - Número de meses a adicionar
   * @returns {Date} Nova data
   */
  addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  /**
   * Retorna o primeiro dia do mês
   * @param {Date} date - Data de referência
   * @returns {Date} Primeiro dia do mês
   */
  getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },

  /**
   * Retorna o último dia do mês
   * @param {Date} date - Data de referência
   * @returns {Date} Último dia do mês
   */
  getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },

  /**
   * Retorna o número de dias no mês
   * @param {Date} date - Data de referência
   * @returns {number} Número de dias
   */
  getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  },

  /**
   * Calcula a idade com base na data de nascimento
   * @param {Date} birthdate - Data de nascimento
   * @returns {number} Idade em anos
   */
  calculateAge(birthdate) {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Converte string de data para objeto Date
   * @param {string} dateString - String de data (YYYY-MM-DD ou DD/MM/YYYY)
   * @returns {Date} Objeto Date
   */
  parseDate(dateString) {
    // Se estiver no formato DD/MM/YYYY
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return new Date(year, month - 1, day);
    }
    // Se estiver no formato YYYY-MM-DD
    return new Date(dateString);
  },

  /**
   * Converte Date para string no formato YYYY-MM-DD
   * @param {Date} date - Data
   * @returns {string} String no formato YYYY-MM-DD
   */
  toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Gera array de horários disponíveis
   * @param {number} startHour - Hora inicial
   * @param {number} endHour - Hora final
   * @param {number} interval - Intervalo em minutos
   * @returns {Array} Array de horários {hour, minute, label}
   */
  generateTimeSlots(startHour = 8, endHour = 18, interval = 60) {
    const slots = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        slots.push({
          hour,
          minute,
          label: this.formatTime(hour, minute)
        });
      }
    }
    
    return slots;
  },

  /**
   * Obtém o nome do fuso horário
   * @param {string} timezone - Código do fuso (ex: America/Sao_Paulo)
   * @returns {string} Nome amigável do fuso
   */
  getTimezoneName(timezone) {
    const timezones = {
      'America/Sao_Paulo': 'Brasília (GMT-3)',
      'America/Manaus': 'Manaus (GMT-4)',
      'America/Rio_Branco': 'Acre (GMT-5)',
      'America/Noronha': 'Fernando de Noronha (GMT-2)'
    };
    
    return timezones[timezone] || timezone;
  }
};

// Exportar para uso global
window.DateUtils = DateUtils;