// ==========================================
// VALIDATORS
// Funções para validação de dados de formulários
// ==========================================

const Validators = {
  /**
   * Valida CPF
   * @param {string} cpf - CPF a ser validado
   * @returns {boolean} true se válido
   */
  validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  },

  /**
   * Formata CPF
   * @param {string} cpf - CPF a ser formatado
   * @returns {string} CPF formatado (000.000.000-00)
   */
  formatCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  /**
   * Valida telefone/WhatsApp
   * @param {string} phone - Telefone a ser validado
   * @returns {boolean} true se válido
   */
  validatePhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    // Aceita 10 ou 11 dígitos (com ou sem 9)
    return phone.length === 10 || phone.length === 11;
  },

  /**
   * Formata telefone
   * @param {string} phone - Telefone a ser formatado
   * @returns {string} Telefone formatado
   */
  formatPhone(phone) {
    phone = phone.replace(/[^\d]/g, '');
    
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  },

  /**
   * Valida email
   * @param {string} email - Email a ser validado
   * @returns {boolean} true se válido
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida nome completo
   * @param {string} name - Nome a ser validado
   * @returns {boolean} true se válido (tem pelo menos 2 palavras)
   */
  validateFullName(name) {
    const trimmed = name.trim();
    const words = trimmed.split(/\s+/);
    return words.length >= 2 && trimmed.length >= 5;
  },

  /**
   * Valida idade mínima
   * @param {Date} birthdate - Data de nascimento
   * @param {number} minAge - Idade mínima (padrão: 18)
   * @returns {boolean} true se tem idade mínima
   */
  validateMinAge(birthdate, minAge = 18) {
    const age = DateUtils.calculateAge(birthdate);
    return age >= minAge;
  },

  /**
   * Valida se campo está preenchido
   * @param {string} value - Valor do campo
   * @returns {boolean} true se não está vazio
   */
  required(value) {
    return value && value.toString().trim().length > 0;
  },

  /**
   * Valida tamanho mínimo
   * @param {string} value - Valor a ser validado
   * @param {number} minLength - Tamanho mínimo
   * @returns {boolean} true se atende o mínimo
   */
  minLength(value, minLength) {
    return value && value.length >= minLength;
  },

  /**
   * Valida tamanho máximo
   * @param {string} value - Valor a ser validado
   * @param {number} maxLength - Tamanho máximo
   * @returns {boolean} true se não excede o máximo
   */
  maxLength(value, maxLength) {
    return !value || value.length <= maxLength;
  },

  /**
   * Sanitiza string (remove caracteres perigosos)
   * @param {string} str - String a ser sanitizada
   * @returns {string} String sanitizada
   */
  sanitize(str) {
    if (!str) return '';
    return str.trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
};

// Exportar para uso global
window.Validators = Validators;