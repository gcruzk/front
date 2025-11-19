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


const API_BASE_URL = "https://backvalidador-14.onrender.com";
//local 
//const API_BASE_URL = "http://localhost:8080";

const ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  VALIDATE: `${API_BASE_URL}/api/validate`,
  VALIDATE_AUTH: `${API_BASE_URL}/api/validate-auth`,
  GEMINI: `${API_BASE_URL}/api/gemini/analyze`,
  STATS: `${API_BASE_URL}/api/stats`
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
  geminiDetails: document.getElementById('geminiDetails'),
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
  console.log('🚀 Frontend inicializando...');
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
    console.log('✅ Usuário recuperado do localStorage:', savedEmail);
  }
  
  // Verificar tema salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    elements.modeToggle.checked = true;
    document.body.classList.add('light-mode');
  }
  
  console.log('🎯 Endpoints configurados:', ENDPOINTS);
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
  
  console.log('✅ Event listeners configurados');
}

// Função para carregar estatísticas REAIS da API
async function loadRealStatistics() {
  try {
    console.log('📊 Carregando estatísticas de:', ENDPOINTS.STATS);
    const response = await fetch(ENDPOINTS.STATS);
    if (response.ok) {
      const data = await response.json();
      appState.stats.total = data.total || 0;
      appState.stats.malicious = data.malicious || 0;
      updateStatisticsDisplay();
      console.log('✅ Estatísticas carregadas:', data);
    } else {
      console.error('❌ Erro ao carregar estatísticas:', response.status);
    }
  } catch (error) {
    console.error('❌ Erro ao carregar estatísticas:', error);
  }
}

function updateStatisticsDisplay() {
  elements.statTotal.textContent = appState.stats.total.toLocaleString();
  elements.statMaliciosos.textContent = appState.stats.malicious.toLocaleString();
}

// Funções de Login
function showLoginModal() {
  elements.loginModal.classList.remove('hidden');
  elements.loginForm.reset();
  hideMessage();
  // Auto-focus no email
  setTimeout(() => document.getElementById('email').focus(), 100);
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
  elements.loginSubmitBtn.classList.add('loading');
  
  try {
    console.log('🔐 Tentando login em:', ENDPOINTS.LOGIN);
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('📨 Resposta do login:', data);
    
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
      console.log('✅ Login bem-sucedido para:', email);
      
    } else {
      showMessage(data.error || 'Erro no login. Verifique suas credenciais.', 'error');
    }
  } catch (error) {
    showMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
    console.error('❌ Login error:', error);
  } finally {
    elements.loginSubmitBtn.disabled = false;
    elements.loginSubmitBtn.textContent = 'Entrar';
    elements.loginSubmitBtn.classList.remove('loading');
  }
}

// Funções de Registro
function showRegisterModal() {
  elements.registerModal.classList.remove('hidden');
  elements.registerForm.reset();
  hideRegisterMessage();
  hideLoginModal();
  // Auto-focus no email
  setTimeout(() => document.getElementById('registerEmail').focus(), 100);
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
  elements.registerSubmitBtn.classList.add('loading');
  
  try {
    console.log('📝 Tentando registro em:', ENDPOINTS.REGISTER);
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('📨 Resposta do registro:', data);
    
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
    showRegisterMessage('Erro de conexão. Verifique se o servidor está rodando.', 'error');
    console.error('❌ Register error:', error);
  } finally {
    elements.registerSubmitBtn.disabled = false;
    elements.registerSubmitBtn.textContent = 'Registrar';
    elements.registerSubmitBtn.classList.remove('loading');
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
  console.log('👋 Usuário deslogado');
}

function updateUIForLogin() {
  elements.loginBtn.classList.add('hidden');
  elements.userMenu.classList.remove('hidden');
  elements.userEmail.textContent = appState.userEmail;
  elements.loginPrompt.classList.add('hidden');
  console.log('👤 Interface atualizada para usuário logado');
}

function updateUIForLogout() {
  elements.loginBtn.classList.remove('hidden');
  elements.userMenu.classList.add('hidden');
  elements.geminiResult.classList.add('hidden');
  
  if (!elements.validationResult.classList.contains('hidden')) {
    elements.loginPrompt.classList.remove('hidden');
  }
  console.log('👤 Interface atualizada para usuário deslogado');
}

// Função de Validação - CORRIGIDA
async function handleLinkValidation(e) {
  e.preventDefault();
  
  const url = document.getElementById('url').value.trim();
  if (!url) {
    showMessage('Por favor, insira uma URL', 'error');
    return;
  }
  
  if (!isValidUrl(url)) {
    showMessage('Por favor, insira uma URL válida. Exemplos: https://exemplo.com ou exemplo.com', 'error');
    return;
  }
  
  elements.validateBtn.disabled = true;
  elements.validateBtn.textContent = 'Validando...';
  elements.validateBtn.classList.add('loading');
  
  try {
    const urlToValidate = normalizeUrl(url);
    console.log('🔍 Validando URL:', urlToValidate);
    
    
    const endpoint = appState.isLoggedIn ? ENDPOINTS.VALIDATE_AUTH : ENDPOINTS.VALIDATE;
console.log('🌐 Usando endpoint:', endpoint);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: urlToValidate })
    };
    
    // Adicionar token se estiver logado
    if (appState.isLoggedIn && appState.userToken) {
      requestOptions.headers['Authorization'] = `Bearer ${appState.userToken}`;
      console.log('🔑 Enviando com token de autenticação');
    } else {
      console.log('👤 Usuário não logado - validação básica');
    }
    console.log('🔐 Estado do login:', appState.isLoggedIn);
    console.log('🔑 Token:', appState.userToken);
    
    
    const response = await fetch(endpoint, requestOptions);
    console.log('📨 Resposta da validação - Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro detalhado:', errorText);
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 Dados da validação recebidos:', data);
    
    // Exibir resultados
    displayValidationResults(data);
    
    // Atualizar estatísticas
    await loadRealStatistics();
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    displayErrorResult('Erro na validação: ' + error.message);
  } finally {
    elements.validateBtn.disabled = false;
    elements.validateBtn.textContent = 'Validar Link';
    elements.validateBtn.classList.remove('loading');
  }
}

// Função para exibir resultados
function displayValidationResults(data) {
  elements.validationResult.classList.remove('hidden');
  
  let maliciousData, geminiData;
  
  console.log('🎯 Estrutura dos dados recebidos:', data);
  
  
  if (data.maliciousAnalysis !== undefined) {
    // Resposta com estrutura separada (usuário logado)
    maliciousData = data.maliciousAnalysis || data;
    geminiData = data.geminiAnalysis;
    console.log('📋 Estrutura: maliciousAnalysis + geminiAnalysis');
  } else {
    // Resposta direta (usuário não logado)
    maliciousData = data;
    geminiData = null;
    console.log('📋 Estrutura: resposta direta');
  }
  
  // Exibir análise de segurança
  displayMaliciousResult(maliciousData);
  
  // Exibir análise Gemini se disponível
  if (geminiData && appState.isLoggedIn) {
    console.log('🤖 Exibindo análise Gemini:', geminiData);
    displayGeminiResult(geminiData);
  } else if (appState.isLoggedIn && data.category) {
    // Se os dados do Gemini vierem junto com a resposta principal
    console.log('🤖 Exibindo dados Gemini da resposta principal:', data);
    displayGeminiResult(data);
  } else if (appState.isLoggedIn) {
    console.log('⚠️ Usuário logado mas sem dados Gemini');
    elements.geminiResult.innerHTML = '<p>⚠️ Análise detalhada não disponível no momento</p>';
    elements.geminiResult.classList.remove('hidden');
  } else {
    console.log('🔒 Usuário não logado - mostrando prompt de login');
    showLoginPrompt();
  }
}

function displayMaliciousResult(result) {
  if (!result) {
    elements.maliciousStatus.innerHTML = '<strong>❌ Dados de validação não disponíveis</strong>';
    elements.maliciousDetails.textContent = 'Não foi possível obter informações sobre esta URL.';
    elements.maliciousResult.className = 'malicious-result unknown';
    return;
  }
  
  elements.maliciousStatus.innerHTML = `
    <strong>${result.message || 'Status desconhecido'}</strong>
    <br><small>Confiança: ${result.confidence || 0}% | Nível de Risco: ${result.riskLevel || 'DESCONHECIDO'}</small>
  `;
  
  elements.maliciousDetails.textContent = result.details || 'Nenhum detalhe adicional disponível.';
  
  elements.maliciousResult.className = 'malicious-result';
  if (result.isMalicious === false) {
    elements.maliciousResult.classList.add('safe');
  } else if (result.isMalicious === true) {
    elements.maliciousResult.classList.add('malicious');
  } else {
    elements.maliciousResult.classList.add('unknown');
  }
  
  console.log('🛡️ Análise de segurança exibida:', result);
}

function displayGeminiResult(data) {
  elements.geminiResult.classList.remove('hidden');
  elements.loginPrompt.classList.add('hidden');
  
  console.log("📊 Dados do Gemini para exibição:", data);
  
  if (!data) {
    elements.categoryResult.innerHTML = '<strong>🏷️ Categoria:</strong> Não disponível';
    elements.summaryResult.innerHTML = '<strong>📝 Resumo:</strong> Nenhuma análise disponível';
    elements.geminiDetails.innerHTML = '<div>Informações não disponíveis</div>';
    return;
  }
  
  // Garantir que todos os campos existam
  const category = data.category || 'Não categorizado';
  const summary = data.summary || 'Nenhum resumo disponível';
  const keywords = data.keywords || 'Nenhuma palavra-chave';
  const trustLevel = data.trustLevel || 'Nível de confiança não disponível';
  const characteristics = data.characteristics || 'Características não disponíveis';
  
  elements.categoryResult.innerHTML = `
    <strong>🏷️ Categoria:</strong> ${category}
    ${trustLevel && trustLevel !== 'N/A' ? `<br><strong>🛡️ Nível de Confiança:</strong> ${trustLevel}` : ''}
  `;
  
  elements.summaryResult.innerHTML = `
    <strong>📝 Resumo:</strong> ${summary}
  `;
  
  // Detalhes adicionais do Gemini
  let detailsHTML = '';
  if (keywords && keywords !== 'N/A' && keywords !== 'Nenhuma palavra-chave') {
    detailsHTML += `<div><strong>🔑 Palavras-chave:</strong> ${keywords}</div>`;
  }
  if (characteristics && characteristics !== 'N/A' && characteristics !== 'Características não disponíveis') {
    detailsHTML += `<div><strong>📊 Características:</strong> ${characteristics}</div>`;
  }
  
  elements.geminiDetails.innerHTML = detailsHTML || '<div>Nenhuma informação adicional disponível</div>';
  
  console.log('✅ Análise Gemini exibida com sucesso');
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
    const url = new URL(string);
    // Verificar se tem protocolo válido
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    // Tentar adicionar https:// se não tiver protocolo
    try {
      new URL('https://' + string);
      return true;
    } catch (_) {
      return false;
    }
  }
}

// Função para normalizar URL (adicionar protocolo se necessário)
function normalizeUrl(url) {
  try {
    new URL(url);
    return url; // URL já é válida
  } catch (_) {
    return 'https://' + url; // Adicionar https://
  }
}

// Funções utilitárias
function showMessage(message, type) {
  // Criar mensagem flutuante se não estiver em um modal
  if (elements.loginModal.classList.contains('hidden')) {
    const floatingMessage = document.createElement('div');
    floatingMessage.className = `message ${type}`;
    floatingMessage.textContent = message;
    floatingMessage.style.position = 'fixed';
    floatingMessage.style.top = '20px';
    floatingMessage.style.right = '20px';
    floatingMessage.style.zIndex = '1001';
    floatingMessage.style.maxWidth = '300px';
    
    document.body.appendChild(floatingMessage);
    
    setTimeout(() => {
      document.body.removeChild(floatingMessage);
    }, 5000);
  } else {
    elements.loginMessage.textContent = message;
    elements.loginMessage.className = `message ${type}`;
    elements.loginMessage.classList.remove('hidden');
    
    setTimeout(hideMessage, 5000);
  }
}

function hideMessage() {
  elements.loginMessage.classList.add('hidden');
}

function toggleTheme() {
  if (elements.modeToggle.checked) {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
  }
}

// Expor estado global para debugging
window.appState = appState;
window.ENDPOINTS = ENDPOINTS;
console.log('🚀 Frontend completamente inicializado e pronto!');
