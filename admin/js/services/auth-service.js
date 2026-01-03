// ==========================================
// AUTH SERVICE
// Serviço para autenticação de usuários
// ==========================================

const AuthService = {
  /**
   * Usuário atual (cache)
   */
  currentUser: null,

  /**
   * Chave para localStorage
   */
  STORAGE_KEY: 'admin_auth_token',
  USER_KEY: 'admin_user_data',

  /**
   * Realiza login
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {boolean} remember - Lembrar usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  async login(email, password, remember = false) {
    try {
      // TODO: Integrar com Firebase Authentication
      // const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      // const user = userCredential.user;
      
      // Por enquanto, simulação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de usuário para desenvolvimento
      if (email === 'admin@exemplo.com' && password === 'admin123') {
        const user = {
          uid: 'mock-uid-123',
          email: email,
          displayName: 'Lucimari Carvalho',
          photoURL: null
        };
        
        // Salvar no localStorage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(this.STORAGE_KEY, 'mock-token-123');
        storage.setItem(this.USER_KEY, JSON.stringify(user));
        
        this.currentUser = user;
        return user;
      } else {
        throw { code: 'auth/wrong-password', message: 'Email ou senha incorretos' };
      }
      
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  /**
   * Realiza logout
   */
  async logout() {
    try {
      // TODO: Integrar com Firebase
      // await firebase.auth().signOut();
      
      // Limpar localStorage e sessionStorage
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      
      this.currentUser = null;
      
      // Redirecionar para login
      window.location.href = 'login.html';
      
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  },

  /**
   * Verifica se usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = localStorage.getItem(this.STORAGE_KEY) || 
                  sessionStorage.getItem(this.STORAGE_KEY);
    return !!token;
  },

  /**
   * Obtém usuário atual
   * @returns {Object|null} Dados do usuário
   */
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const userData = localStorage.getItem(this.USER_KEY) || 
                     sessionStorage.getItem(this.USER_KEY);
    
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
        return null;
      }
    }
    
    return null;
  },

  /**
   * Obtém token de autenticação
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(this.STORAGE_KEY) || 
           sessionStorage.getItem(this.STORAGE_KEY);
  },

  /**
   * Verifica e redireciona se não autenticado
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /**
   * Atualiza dados do usuário
   * @param {Object} userData - Novos dados do usuário
   */
  updateUser(userData) {
    this.currentUser = { ...this.currentUser, ...userData };
    
    const storage = localStorage.getItem(this.USER_KEY) ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));
  }
};

// Exportar para uso global
window.AuthService = AuthService;