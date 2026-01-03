// ==========================================
// LOGIN - JAVASCRIPT
// ==========================================

// Elementos DOM
const elements = {
  form: document.getElementById('loginForm'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  remember: document.getElementById('remember'),
  submitBtn: document.getElementById('submitBtn')
};

let isSubmitting = false;

// ==========================================
// VERIFICAR SE JÁ ESTÁ LOGADO
// ==========================================

// Verificar se já está autenticado
if (AuthService.isAuthenticated()) {
  // Redirecionar para dashboard
  window.location.href = 'index.html';
}

// ==========================================
// ENVIO DO FORMULÁRIO
// ==========================================

elements.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (isSubmitting) return;
  
  isSubmitting = true;
  elements.submitBtn.classList.add('loading');
  elements.submitBtn.disabled = true;
  
  try {
    const email = elements.email.value.trim();
    const password = elements.password.value;
    const remember = elements.remember.checked;
    
    // Validar campos
    if (!email || !password) {
      Notifications.error('Por favor, preencha todos os campos.');
      return;
    }
    
    // Tentar fazer login
    // TODO: Integrar com Firebase Authentication
    const user = await AuthService.login(email, password, remember);
    
    if (user) {
      Notifications.success('Login realizado com sucesso!');
      
      // Aguardar um pouco para mostrar a notificação
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    }
    
  } catch (error) {
    console.error('Erro no login:', error);
    
    // Mensagens de erro específicas
    let errorMessage = 'Erro ao fazer login. Tente novamente.';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Email ou senha incorretos.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Notifications.error(errorMessage);
    
  } finally {
    isSubmitting = false;
    elements.submitBtn.classList.remove('loading');
    elements.submitBtn.disabled = false;
  }
});

// ==========================================
// VALIDAÇÃO EM TEMPO REAL
// ==========================================

elements.email.addEventListener('input', () => {
  const email = elements.email.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email && !emailRegex.test(email)) {
    elements.email.classList.add('is-invalid');
  } else {
    elements.email.classList.remove('is-invalid');
  }
});

elements.password.addEventListener('input', () => {
  const password = elements.password.value;
  
  if (password && password.length < 6) {
    elements.password.classList.add('is-invalid');
  } else {
    elements.password.classList.remove('is-invalid');
  }
});

// ==========================================
// ENTER KEY
// ==========================================

elements.password.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    elements.form.dispatchEvent(new Event('submit'));
  }
});

console.log('Página de login carregada!');