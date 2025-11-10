// Estado da aplicação
const appState = {
  isLoggedIn: false,
  userToken: null,
  userEmail: null,
  stats: {
    total: 95,
    malicious: 37
  }
};

// URLs da API (ajuste conforme seu backend)
const API_BASE_URL = "https://backvalidador-14.onrender.com/urls";
const ENDPOINTS = {
  LOGIN: `${API_BASE}/auth/login`,
  VALIDATE: `https://backvalidador-14.onrender.com/urls/validate`,
  GEMINI: `${API_BASE}/gemini/analyze`
};

// Elementos do DOM
const elements = {
  loginBtn: document.getElementById('loginBtn'),
  loginModal: document.getElementById('loginModal'),
  loginForm: document.getElementById('loginForm'),
  cancelLoginBtn: document.getElementById('cancelLoginBtn'),
  loginSubmitBtn: document.getElementById('loginSubmitBtn'),
  loginMessage: document.getElementById('loginMessage'),
  userProfile: document.getElementById('userProfile'),
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
  statMaliciosos: document.getElementById('stat-maliciosos')
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
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
  
  // Carregar estatísticas iniciais
  loadStatistics();
}

function setupEventListeners() {
  // Login
  elements.loginBtn.addEventListener('click', showLoginModal);
  elements.cancelLoginBtn.addEventListener('click', hideLoginModal);
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.showLoginBtn.addEventListener('click', showLoginModal);
  elements.logoutBtn.addEventListener('click', handleLogout);
  
  // Validação de links
  elements.formLinks.addEventListener('submit', handleLinkValidation);
  
  // Tema
  elements.modeToggle.addEventListener('change', toggleTheme);
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
      appState.userEmail = email;
      
      // Salvar no localStorage
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userEmail', email);
      
      updateUIForLogin();
      hideLoginModal();
      showMessage('Login realizado com sucesso!', 'success');
      
      // Se houver uma validação pendente, buscar análise do Gemini
      const lastUrl = localStorage.getItem('lastValidatedUrl');
      if (lastUrl) {
        await fetchGeminiAnalysis(lastUrl);
      }
    } else {
      showMessage(data.message || 'Erro no login', 'error');
    }
  } catch (error) {
    showMessage('Erro de conexão. Tente novamente.', 'error');
    console.error('Login error:', error);
  } finally {
    elements.loginSubmitBtn.disabled = false;
    elements.loginSubmitBtn.textContent = 'Entrar';
  }
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
  
  // Esconder prompt de login se estiver visível
  elements.loginPrompt.classList.add('hidden');
  
  // Se já houver um resultado, buscar análise do Gemini
  const lastUrl = localStorage.getItem('lastValidatedUrl');
  if (lastUrl) {
    fetchGeminiAnalysis(lastUrl);
  }
}

function updateUIForLogout() {
  elements.loginBtn.classList.remove('hidden');
  elements.userMenu.classList.add('hidden');
  elements.geminiResult.classList.add('hidden');
  
  // Mostrar prompt de login se houver resultado
  if (!elements.validationResult.classList.contains('hidden')) {
    elements.loginPrompt.classList.remove('hidden');
  }
}

// Funções de Validação de Links
async function handleLinkValidation(e) {
  e.preventDefault();
  
  const url = document.getElementById('url').value.trim();
  if (!url) {
    alert('Por favor, insira uma URL');
    return;
  }
  
  elements.validateBtn.disabled = true;
  elements.validateBtn.textContent = 'Validando...';
  
  try {
    // SEMPRE executar validação do isMalicious
    const maliciousResult = await validateWithIsMalicious(url);
    displayMaliciousResult(maliciousResult);
    
    // Atualizar estatísticas
    updateStatistics(maliciousResult);
    
    // Salvar URL para possível análise posterior do Gemini
    localStorage.setItem('lastValidatedUrl', url);
    
    // Se usuário está logado, buscar análise do Gemini também
    if (appState.isLoggedIn) {
      await fetchGeminiAnalysis(url);
    } else {
      showLoginPrompt();
    }
    
  } catch (error) {
    console.error('Validation error:', error);
    displayMaliciousResult({
      isMalicious: 'unknown',
      message: 'Erro na validação',
      details: 'Não foi possível verificar o link'
    });
  } finally {
    elements.validateBtn.disabled = false;
    elements.validateBtn.textContent = 'Validar Link';
  }
}

// Agente isMalicious - SEMPRE executa
async function validateWithIsMalicious(url) {
  // Simulação do agente isMalicious - substitua pela sua implementação real
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random();
      let result;
      
      if (random < 0.6) {
        // 60% de chance de ser seguro
        result = {
          isMalicious: false,
          message: '✅ Link Seguro',
          details: 'Este link foi identificado como seguro para acesso.',
          confidence: (85 + Math.random() * 15).toFixed(1)
        };
      } else if (random < 0.9) {
        // 30% de chance de ser malicioso
        result = {
          isMalicious: true,
          message: '⚠️ Link Potencialmente Malicioso',
          details: 'Recomendamos cautela ao acessar este link.',
          confidence: (70 + Math.random() * 25).toFixed(1)
        };
      } else {
        // 10% de chance de ser desconhecido
        result = {
          isMalicious: 'unknown',
          message: '🔍 Status Desconhecido',
          details: 'Não foi possível determinar a segurança deste link.',
          confidence: (50 + Math.random() * 30).toFixed(1)
        };
      }
      
      resolve(result);
    }, 1500);
  });
}

// Agente Gemini - executa APENAS se usuário estiver logado
async function fetchGeminiAnalysis(url) {
  if (!appState.isLoggedIn || !appState.userToken) {
    showLoginPrompt();
    return;
  }
  
  try {
    // Mostrar loading no Gemini
    elements.geminiResult.classList.remove('hidden');
    elements.categoryResult.innerHTML = '🔄 Analisando com Gemini...';
    elements.summaryResult.innerHTML = '';
    
    const response = await fetch(ENDPOINTS.GEMINI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appState.userToken}`
      },
      body: JSON.stringify({ url })
    });
    
    if (response.ok) {
      const data = await response.json();
      displayGeminiResult(data);
    } else if (response.status === 401) {
      // Token inválido - fazer logout
      handleLogout();
      showLoginPrompt();
    } else {
      throw new Error('Erro na análise do Gemini');
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
    displayGeminiResult({
      category: 'Erro na análise',
      summary: 'Não foi possível obter a análise detalhada do Gemini.'
    });
  }
}

function displayMaliciousResult(result) {
  elements.validationResult.classList.remove('hidden');
  
  // Atualizar status principal
  elements.maliciousStatus.innerHTML = `
    <strong>${result.message}</strong>
    <br><small>Confiança: ${result.confidence}%</small>
  `;
  
  // Atualizar detalhes
  elements.maliciousDetails.textContent = result.details;
  
  // Aplicar classes CSS baseadas no resultado
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
    <strong>📝 Resumo/Keywords:</strong> ${data.summary || 'Nenhum resumo disponível'}
  `;
}

function showLoginPrompt() {
  if (!appState.isLoggedIn) {
    elements.loginPrompt.classList.remove('hidden');
  }
  elements.geminiResult.classList.add('hidden');
}

function updateStatistics(maliciousResult) {
  // Incrementar contador total
  appState.stats.total++;
  elements.statTotal.textContent = appState.stats.total;
  
  // Incrementar contador de maliciosos se for malicioso
  if (maliciousResult.isMalicious === true) {
    appState.stats.malicious++;
    elements.statMaliciosos.textContent = appState.stats.malicious;
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

function loadStatistics() {
  // Carregar estatísticas salvas ou usar padrão
  const savedTotal = localStorage.getItem('statsTotal');
  const savedMalicious = localStorage.getItem('statsMalicious');
  
  if (savedTotal) appState.stats.total = parseInt(savedTotal);
  if (savedMalicious) appState.stats.malicious = parseInt(savedMalicious);
  
  elements.statTotal.textContent = appState.stats.total;
  elements.statMaliciosos.textContent = appState.stats.malicious;
}

// Salvar estatísticas quando a página for fechada
window.addEventListener('beforeunload', function() {
  localStorage.setItem('statsTotal', appState.stats.total);
  localStorage.setItem('statsMalicious', appState.stats.malicious);
});

// Expor estado global para debugging (opcional)
window.appState = appState;