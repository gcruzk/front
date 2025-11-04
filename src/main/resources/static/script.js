// URLs BASE da API
// script.js - Modifique a URL da API para ser relativa
constAPI_BASE_URL = '/api/urls'; // Agora é relativa
// O resto do código permanece igual...
const produtoForm = document.getElementById('produtoForm');
const produtosList = document.getElementById('produtosList');
// ... todo o resto do seu código JavaScript


const API_VALIDATE = "http://localhost:8080/urls/validate";
const API_STATS = "http://localhost:8080/urls/stats";

// Atualiza as estatísticas ao carregar a página
function atualizarEstatisticas() {
  fetch(API_STATS)
    .then(resp => resp.json())
    .then(data => {
      // Substitua pelo nome dos campos do seu DTO
      // Exemplo: { total: X, malicious: Y }
      document.getElementById("stat-total").textContent = data.total;
      document.getElementById("stat-maliciosos").textContent = data.malicious;
    })
    .catch(err => {
      document.getElementById("stat-total").textContent = "-";
      document.getElementById("stat-maliciosos").textContent = "-";
      console.error("Erro ao buscar estatísticas:", err);
    });
}

// Evento do formulário para enviar link
document.getElementById('form-links').addEventListener('submit', function(e) {
  e.preventDefault();

  let url = document.getElementById('url').value.trim();
  if (!url) {
    alert('Digite um link antes de enviar!');
    return;
  }

  // Requisição POST para validar o link
  fetch(API_VALIDATE, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ url: url })
  })
  .then(resp => resp.json())
  .then(data => {
    // Mostra o resultado ao usuário (pode melhorar para mostrar bonito na tela!)
    alert('Resultado: ' + data.status);
    // Atualiza as estatísticas após validação
    atualizarEstatisticas();
    // Limpa campo
    document.getElementById('url').value = "";
  })
  .catch(err => {
    alert('Erro ao validar link: ' + err);
  });
});

// Atualiza estatísticas ao iniciar
atualizarEstatisticas();
