// Estado da aplicação
const appState = {
  isLoggedIn: false,
  userToken: null,
  userEmail: null,
  stats: {
    total: 0,
    malicious: 0
  }
};

// URLs CORRETAS da API
const API_BASE_URL = "https://backvalidador-14.onrender.com/api";
const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  VALIDATE: `${API_BASE_URL}/validate`,
  VALIDATE_AUTH: `${API_BASE_URL}/validate-auth`,
  GEMINI: `${API_BASE_URL}/gemini/analyze`,
  STATS: `${API_BASE_URL}/stats`
};

// Elementos do DOM
const elements = {
  loginBtn: document.getElementById('loginBtn'),
  loginModal: document.getElementById('loginModal'),
  loginForm: document.getElementById('loginForm'),
  cancelLoginBtn: document.getElementById('cancelLoginBtn'),
  loginSubmitBtn: document.getElementById('loginSubmitBtn'),
  loginMessage: document.getElementById('loginMessage'),
  userMenu: document.getElementById('userMenu'),
  userEmail: document.getElementById('userEmail'),
  logoutBtn: document.getElementById('logoutBtn'),
  formLinks: document.getElementById('form-links'),
  validateBtn: document.getElementById('validateBtn'),
  validationResult: document.getElementById('validationResult'),
  maliciousResult: document.getElementById('maliciousResult'),
  maliciousStatus: document.getElementById('maliciousStatus'),
  maliciousDetails: document.getElementById('maliciousDetails'),
  geminiResult: document.getElementById('geminiResult'),
  categoryResult: document.getElementById('categoryResult'),
  summaryResult: document.getElementById('summaryResult'),
  loginPrompt: document.getElementById('loginPrompt'),
  showLoginBtn: document.getElementById('showLoginBtn'),
  modeToggle: document.getElementById('modeToggle'),
  statTotal: document.getElementById('stat-total'),
  statMaliciosos: document.getElementById('stat-maliciosos'),
  // Elementos de registro
  showRegisterBtn: document.getElementById('showRegisterBtn'),
  registerModal: document.getElementById('registerModal'),
  registerForm: document.getElementById('registerForm'),
  cancelRegisterBtn: document.getElementById('cancelRegisterBtn'),
  registerSubmitBtn: document.getElementById('registerSubmitBtn'),
  showLoginFromRegisterBtn: document.getElementById('showLoginFromRegisterBtn'),
  registerMessage: document.getElementById('registerMessage')
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  loadRealStatistics();
});

function initializeApp() {
  // Verificar se há token salvo
  const savedToken = localStorage.getItem('userToken');
  const savedEmail = localStorage.getItem('userEmail');
  
  if (savedToken && savedEmail) {
    appState.isLoggedIn = true;
    appState.userToken = savedToken;
    appState.userEmail = savedEmail;
    updateUIForLogin();
  }
}

function setupEventListeners() {
  // Login
  elements.loginBtn.addEventListener('click', showLoginModal);
  elements.cancelLoginBtn.addEventListener('click', hideLoginModal);
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.showLoginBtn.addEventListener('click', showLoginModal);
  elements.logoutBtn.addEventListener('click', handleLogout);
  
  // Registro
  elements.showRegisterBtn.addEventListener('click', showRegisterModal);
  elements.cancelRegisterBtn.addEventListener('click', hideRegisterModal);
  elements.registerForm.addEventListener('submit', handleRegister);
  elements.showLoginFromRegisterBtn.addEventListener('click', showLoginFromRegister);
  
  // Validação de links
  elements.formLinks.addEventListener('submit', handleLinkValidation);
  
  // Tema
  elements.modeToggle.addEventListener('change', toggleTheme);
}

// Função para carregar estatísticas REAIS da API
async function loadRealStatistics() {
  try {
    const response = await fetch(ENDPOINTS.STATS);
    if (response.ok) {
      const data = await response.json();
      appState.stats.total = data.total || 0;
      appState.stats.malicious = data.malicious || 0;
      updateStatisticsDisplay();
    }
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}

function updateStatisticsDisplay() {
  elements.statTotal.textContent = appState.stats.total;
  elements.statMaliciosos.textContent = appState.stats.malicious;
}

// Funções de Login
function showLoginModal() {
  elements.loginModal.classList.remove('hidden');
  elements.loginForm.reset();
  hideMessage();
}

function hideLoginModal() {
  elements.loginModal.classList.add('hidden');
  hideMessage();
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showMessage('Por favor, preencha todos os campos', 'error');
    return;
  }
  
  elements.loginSubmitBtn.disabled = true;
  elements.loginSubmitBtn.textContent = 'Entrando...';
  
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      // Login bem-sucedido
      appState.isLoggedIn = true;
      appState.userToken = data.token;
      appState.userEmail = data.email || email;
      
      // Salvar no localStorage
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userEmail', appState.userEmail);
      
      updateUIForLogin();
      hideLoginModal();
      showMessage('Login realizado com sucesso!', 'success');
      
    } else {
      showMessage(data.error || 'Erro no login', 'error');
    }
  } catch (error) {
    showMessage('Erro de conexão. Tente novamente.', 'error');
    console.error('Login error:', error);
  } finally {
    elements.loginSubmitBtn.disabled = false;
    elements.loginSubmitBtn.textContent = 'Entrar';
  }
}

// Funções de Registro
function showRegisterModal() {
  elements.registerModal.classList.remove('hidden');
  elements.registerForm.reset();
  hideRegisterMessage();
  hideLoginModal();
}

function hideRegisterModal() {
  elements.registerModal.classList.add('hidden');
  hideRegisterMessage();
}

function showLoginFromRegister() {
  hideRegisterModal();
  showLoginModal();
}

async function handleRegister(e) {
  e.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (!email || !password) {
    showRegisterMessage('Por favor, preencha todos os campos', 'error');
    return;
  }
  
  if (password.length < 6) {
    showRegisterMessage('A senha deve ter pelo menos 6 caracteres', 'error');
    return;
  }
  
  elements.registerSubmitBtn.disabled = true;
  elements.registerSubmitBtn.textContent = 'Registrando...';
  
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showRegisterMessage('Registro realizado com sucesso! Faça login.', 'success');
      setTimeout(() => {
        hideRegisterModal();
        showLoginModal();
      }, 2000);
    } else {
      // Mensagem mais amigável para email duplicado
      const errorMsg = data.error || 'Erro no registro';
      if (errorMsg.includes("já está em uso") || errorMsg.includes("duplicate") || errorMsg.includes("already exists")) {
        showRegisterMessage('Este email já está cadastrado. Tente fazer login ou use outro email.', 'error');
      } else {
        showRegisterMessage(errorMsg, 'error');
      }
    }
  } catch (error) {
    showRegisterMessage('Erro de conexão. Tente novamente.', 'error');
    console.error('Register error:', error);
  } finally {
    elements.registerSubmitBtn.disabled = false;
    elements.registerSubmitBtn.textContent = 'Registrar';
  }
}

function showRegisterMessage(message, type) {
  elements.registerMessage.textContent = message;
  elements.registerMessage.className = `message ${type}`;
  elements.registerMessage.classList.remove('hidden');
  
  setTimeout(hideRegisterMessage, 5000);
}

function hideRegisterMessage() {
  elements.registerMessage.classList.add('hidden');
}

function handleLogout() {
  appState.isLoggedIn = false;
  appState.userToken = null;
  appState.userEmail = null;
  
  localStorage.removeItem('userToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('lastValidatedUrl');
  
  updateUIForLogout();
  showMessage('Logout realizado com sucesso!', 'success');
}

function updateUIForLogin() {
  elements.loginBtn.classList.add('hidden');
  elements.userMenu.classList.remove('hidden');
  elements.userEmail.textContent = appState.userEmail;
  elements.loginPrompt.classList.add('hidden');
}

function updateUIForLogout() {
  elements.loginBtn.classList.remove('hidden');
  elements.userMenu.classList.add('hidden');
  elements.geminiResult.classList.add('hidden');
  
  if (!elements.validationResult.classList.contains('hidden')) {
    elements.loginPrompt.classList.remove('hidden');
  }
}

// Função de Validação
async function handleLinkValidation(e) {
  e.preventDefault();
  
  const url = document.getElementById('url').value.trim();
  if (!url) {
    alert('Por favor, insira uma URL');
    return;
  }
  
  if (!isValidUrl(url)) {
    alert('Por favor, insira uma URL válida (ex: https://exemplo.com)');
    return;
  }
  
  elements.validateBtn.disabled = true;
  elements.validateBtn.textContent = 'Validando...';
  
  try {
    let response;
    
    if (appState.isLoggedIn && appState.userToken) {
      // Usuário logado: usar validate-auth
      response = await fetch(ENDPOINTS.VALIDATE_AUTH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${appState.userToken}`
        },
        body: JSON.stringify({ url })
      });
    } else {
      // Usuário não logado: usar validate normal
      response = await fetch(ENDPOINTS.VALIDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
    }
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Exibir resultados
    displayValidationResults(data);
    
    // Atualizar estatísticas
    await loadRealStatistics();
    
  } catch (error) {
    console.error('Validation error:', error);
    displayErrorResult('Erro na validação: ' + error.message);
  } finally {
    elements.validateBtn.disabled = false;
    elements.validateBtn.textContent = 'Validar Link';
  }
}

// Função para exibir resultados
function displayValidationResults(data) {
  elements.validationResult.classList.remove('hidden');
  
  let maliciousData, geminiData;
  
  if (data.maliciousAnalysis && data.geminiAnalysis) {
    // Usuário logado - resposta completa
    maliciousData = data.maliciousAnalysis;
    geminiData = data.geminiAnalysis;
  } else {
    // Usuário não logado - apenas dados maliciosos
    maliciousData = data;
    geminiData = null;
  }
  
  // Exibir análise de segurança
  displayMaliciousResult(maliciousData);
  
  // Exibir análise Gemini se disponível
  if (geminiData && appState.isLoggedIn) {
    displayGeminiResult(geminiData);
  } else if (appState.isLoggedIn) {
    elements.geminiResult.innerHTML = '<p>⚠️ Análise detalhada não disponível</p>';
    elements.geminiResult.classList.remove('hidden');
  } else {
    showLoginPrompt();
  }
}

function displayMaliciousResult(result) {
  elements.maliciousStatus.innerHTML = `
    <strong>${result.message}</strong>
    <br><small>Confiança: ${result.confidence}% | Risco: ${result.riskLevel}</small>
  `;
  
  elements.maliciousDetails.textContent = result.details;
  
  elements.maliciousResult.className = 'malicious-result';
  if (result.isMalicious === false) {
    elements.maliciousResult.classList.add('safe');
  } else if (result.isMalicious === true) {
    elements.maliciousResult.classList.add('malicious');
  } else {
    elements.maliciousResult.classList.add('unknown');
  }
}

function displayGeminiResult(data) {
  elements.geminiResult.classList.remove('hidden');
  elements.loginPrompt.classList.add('hidden');
  
  elements.categoryResult.innerHTML = `
    <strong>🏷️ Categoria:</strong> ${data.category || 'Não identificada'}
  `;
  elements.summaryResult.innerHTML = `
    <strong>📝 Resumo:</strong> ${data.summary || 'Nenhum resumo disponível'}
    ${data.keywords ? `<br><strong>🔑 Keywords:</strong> ${data.keywords}` : ''}
  `;
}

function displayErrorResult(message) {
  elements.validationResult.classList.remove('hidden');
  elements.maliciousStatus.innerHTML = '<strong>❌ Erro na Validação</strong>';
  elements.maliciousDetails.textContent = message;
  elements.maliciousResult.className = 'malicious-result unknown';
  elements.geminiResult.classList.add('hidden');
  elements.loginPrompt.classList.add('hidden');
}

function showLoginPrompt() {
  if (!appState.isLoggedIn) {
    elements.loginPrompt.classList.remove('hidden');
  }
  elements.geminiResult.classList.add('hidden');
}

// Função auxiliar para validar URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Funções utilitárias
function showMessage(message, type) {
  elements.loginMessage.textContent = message;
  elements.loginMessage.className = `message ${type}`;
  elements.loginMessage.classList.remove('hidden');
  
  setTimeout(hideMessage, 5000);
}

function hideMessage() {
  elements.loginMessage.classList.add('hidden');
}

function toggleTheme() {
  if (elements.modeToggle.checked) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
}

// Expor estado global para debugging
window.appState = appState;