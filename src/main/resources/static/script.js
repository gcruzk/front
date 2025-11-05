// URL base da API (ajuste para sua configuração real)
const API_BASE_URL = 'https://backvalidador-14.onrender.com/';
const API_VALIDATE = `${API_BASE_URL}/validate`;
const API_STATS = `${API_BASE_URL}/stats`;

// Atualiza as estatísticas ao carregar a página
function atualizarEstatisticas() {
  fetch(API_STATS)
    .then(resp => resp.json())
    .then(data => {
      document.getElementById("stat-total").textContent = data.total ?? "-";
      document.getElementById("stat-maliciosos").textContent = data.malicious ?? "-";
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

  fetch(API_VALIDATE, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ url })
  })
  .then(resp => {
    if (!resp.ok) throw new Error('Erro na resposta da API');
    return resp.json();
  })
  .then(data => {
    alert('Resultado: ' + data.status);
    atualizarEstatisticas();
    document.getElementById('url').value = "";
  })
  .catch(err => {
    alert('Erro ao validar link: ' + err.message);
  });
});

// Atualiza estatísticas ao iniciar
atualizarEstatisticas();
