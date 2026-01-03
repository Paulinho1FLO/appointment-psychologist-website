// ==========================================
// AUTH GUARD
// Proteção de rotas - Verificar autenticação
// ==========================================

/**
 * Verifica autenticação ao carregar página
 * Se não estiver autenticado, redireciona para login
 */
(function() {
  // Não executar na página de login
  const isLoginPage = window.location.pathname.includes('login.html');
  
  if (!isLoginPage) {
    // Verificar autenticação
    if (typeof AuthService !== 'undefined') {
      AuthService.requireAuth();
    } else {
      console.error('AuthService não encontrado!');
      window.location.href = 'login.html';
    }
  }
})();

/**
 * Monitora estado de autenticação
 * TODO: Integrar com Firebase onAuthStateChanged
 */
function initAuthStateListener() {
  // Verificar periodicamente se o token ainda é válido
  setInterval(() => {
    if (!AuthService.isAuthenticated()) {
      console.warn('Sessão expirada. Redirecionando para login...');
      window.location.href = 'login.html';
    }
  }, 60000); // Verificar a cada minuto
}

// Iniciar listener
if (typeof AuthService !== 'undefined') {
  initAuthStateListener();
}

// Exportar para uso global
window.initAuthStateListener = initAuthStateListener;