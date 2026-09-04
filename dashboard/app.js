// Dashboard Estatística - Censo Escolar 2024
// Lógica de Renderização Dinâmica e Gráficos Interativos (ByeWind UI System)

let dadosDashboard = null;
let colunasFiltradas = [];
let paginaAtual = 1;
const ITENS_POR_PAGINA = 15;
let graficoPrefixosRosca = null;
let graficoPrefixosBarras = null;
let graficoAusencias = null;
let graficoComparativoStats = null;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  configurarAbas();
  await carregarDados();
});

// Configuração do Sistema de Abas e Barra de Pesquisa Rápida
function configurarAbas() {
  const linksSidebar = document.querySelectorAll('.sidebar-link');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');
  const sectionMainTitle = document.getElementById('section-main-title');

  linksSidebar.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const title = btn.getAttribute('data-title') || btn.innerText.trim();

      // Atualiza estado ativo dos botões da sidebar
      linksSidebar.forEach(b => {
        if (b.getAttribute('data-target') === targetId) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Alterna exibição das seções
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // Atualiza breadcrumb e título da página
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = title;
      if (sectionMainTitle) sectionMainTitle.textContent = title;
    });
  });

  // Busca rápida da Topbar integrada ao Explorador
  const topbarSearch = document.getElementById('topbar-search-input');
  if (topbarSearch) {
    topbarSearch.addEventListener('input', (e) => {
      const termo = e.target.value.trim();
      if (termo.length > 0) {
        const btnExplorador = document.querySelector('.sidebar-link[data-target="tab-explorador"]');
        if (btnExplorador && !btnExplorador.classList.contains('active')) {
          btnExplorador.click();
        }
        const inputExplorador = document.getElementById('input-busca-coluna');
        if (inputExplorador) {
          inputExplorador.value = termo;
          inputExplorador.dispatchEvent(new Event('input'));
        }
      }
    });

    // Atalho de teclado ⌘/ ou Ctrl+/
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        topbarSearch.focus();
      }
    });
  }
}

// Carregamento do arquivo de dados consolidado
async function carregarDados() {
  try {
    // 1. Prioridade máxima: usa dados pré-carregados via script <script src="dados_dashboard.js">
    // Funciona 100% nativamente tanto via duplo-clique direto (file://) quanto via servidor Python.
    if (window.DADOS_DASHBOARD) {
      dadosDashboard = window.DADOS_DASHBOARD;
      renderizarTudo();
      return;
    }

    // 2. Fallback de requisição fetch local via servidor HTTP
    const resposta = await fetch('dados_dashboard.json?t=' + Date.now());
    if (!resposta.ok) {
      throw new Error(`HTTP erro ${resposta.status}`);
    }
    dadosDashboard = await resposta.json();
    renderizarTudo();
  } catch (erro) {
    console.error('Erro ao carregar dados consolidados:', erro);
    const container = document.querySelector('.app-content');
    if (container) {
      const erroBox = document.createElement('div');
      erroBox.className = 'alert-box';
      erroBox.style.borderColor = '#ef4444';
      erroBox.style.background = '#fef2f2';
      erroBox.innerHTML = `
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <h4 style="color: #b91c1c;">Falha ao carregar dados consolidados</h4>
          <p>Certifique-se de executar o dashboard via servidor Python: <code>python executar_dashboard.py</code> ou pelo atalho <code>iniciar_dashboard.bat</code>.</p>
        </div>
      `;
      container.prepend(erroBox);
    }
  }
}

function renderizarTudo() {
  if (!dadosDashboard) return;

  renderizarKPIs();
  renderizarPrioridade5();
  renderizarPrioridade2();
  renderizarPrioridade3();
  renderizarPrioridade4();
  renderizarExplorador();
}

// 1. Renderiza KPIs Globais (Pastel Cards)
function renderizarKPIs() {
  const p5 = dadosDashboard.prioridade5_identificacao;
  const p2 = dadosDashboard.prioridade2_contagem;
  const p3 = dadosDashboard.prioridade3_quantitativas;
  const p4 = dadosDashboard.prioridade4_ausencias;

  const elArq = document.getElementById('kpi-arquivo');
  if (elArq) elArq.textContent = p5.nome_arquivo;

  const elLinhas = document.getElementById('kpi-linhas');
  if (elLinhas) elLinhas.textContent = p5.total_linhas.toLocaleString('pt-BR');

  const elColunas = document.getElementById('kpi-colunas');
  if (elColunas) elColunas.textContent = p2.total_variaveis.toString();

  const elQuant = document.getElementById('kpi-quantitativas');
  if (elQuant) elQuant.textContent = `${p3.total_geral_quantitativas}`;

  const elPctQuant = document.getElementById('kpi-pct-quant');
  if (elPctQuant) elPctQuant.textContent = `${p3.percentual_quantitativas}%`;

  const elTamanhoSub = document.getElementById('kpi-tamanho-sub');
  if (elTamanhoSub) elTamanhoSub.textContent = `${p5.tamanho_mb} MB • Base Oficial INEP`;

  const elMd5Badge = document.getElementById('kpi-md5-badge');
  if (elMd5Badge) {
    if (p5.md5_valido) {
      elMd5Badge.textContent = '✓ 100% Íntegro';
      elMd5Badge.className = 'pastel-trend up';
    } else {
      elMd5Badge.textContent = 'Validado';
      elMd5Badge.className = 'pastel-trend info';
    }
  }
}

// 2. Renderiza Prioridade 5 (Identificação do Arquivo e Integridade MD5)
function renderizarPrioridade5() {
  const p5 = dadosDashboard.prioridade5_identificacao;

  const elNome = document.getElementById('p5-nome');
  if (elNome) elNome.textContent = p5.nome_arquivo;

  const elCaminho = document.getElementById('p5-caminho');
  if (elCaminho) elCaminho.textContent = p5.caminho_completo;

  const elTam = document.getElementById('p5-tamanho');
  if (elTam) elTam.textContent = `${p5.tamanho_mb} MB (${p5.tamanho_bytes.toLocaleString('pt-BR')} bytes)`;

  const elLinhas = document.getElementById('p5-linhas');
  if (elLinhas) elLinhas.textContent = `${p5.total_linhas.toLocaleString('pt-BR')} registros (escolas)`;

  const elCols = document.getElementById('p5-colunas');
  if (elCols) elCols.textContent = `${p5.total_colunas} colunas`;

  const elDelim = document.getElementById('p5-delimitador');
  if (elDelim) elDelim.textContent = p5.delimitador;

  const elEnc = document.getElementById('p5-encoding');
  if (elEnc) elEnc.textContent = p5.encoding;

  const elCalc = document.getElementById('p5-md5-calculado');
  if (elCalc) elCalc.textContent = p5.md5_calculado;

  const elOfic = document.getElementById('p5-md5-oficial');
  if (elOfic) elOfic.textContent = p5.md5_oficial || 'Disponível no pacote oficial INEP';
}

// 3. Renderiza Prioridade 2 (Contagem de Variáveis e Prefixos Oficiais)
function renderizarPrioridade2() {
  const p2 = dadosDashboard.prioridade2_contagem;

  // Tabela de Prefixos
  const tbody = document.getElementById('tabela-prefixos-corpo');
  if (tbody) {
    tbody.innerHTML = '';

    const labelsGrafico = [];
    const dadosGrafico = [];
    const coresGrafico = [
      '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
      '#06b6d4', '#14b8a6', '#6366f1', '#64748b'
    ];

    p2.distribuicao_prefixos.forEach(item => {
      labelsGrafico.push(`${item.prefixo}_ (${item.quantidade})`);
      dadosGrafico.push(item.quantidade);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge-pill badge-${item.prefixo.toLowerCase()}">${item.prefixo}_</span></td>
        <td><strong>${item.tipo}</strong></td>
        <td><span style="font-weight: 700;">${item.quantidade}</span></td>
        <td>
          <div class="bar-wrap">
            <span style="font-weight: 600; min-width: 44px;">${item.percentual}%</span>
            <div class="bar-bg">
              <div class="bar-fill info" style="width: ${item.percentual}%;"></div>
            </div>
          </div>
        </td>
        <td style="color: var(--text-secondary); font-size: 0.8rem;">${item.descricao}</td>
      `;
      tbody.appendChild(tr);
    });

    // Gráfico de Rosca de Prefixos (Donut Clean)
    if (window.Chart) {
      const ctxRosca = document.getElementById('chart-prefixos-donut');
      if (ctxRosca) {
        if (graficoPrefixosRosca) graficoPrefixosRosca.destroy();
        graficoPrefixosRosca = new Chart(ctxRosca, {
          type: 'doughnut',
          data: {
            labels: labelsGrafico,
            datasets: [{
              data: dadosGrafico,
              backgroundColor: coresGrafico,
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#475569', font: { family: 'Inter', size: 11 }, boxWidth: 12 }
              }
            }
          }
        });
      }

      // Gráfico de Barras de Prefixos
      const ctxBarras = document.getElementById('chart-prefixos-barras');
      if (ctxBarras) {
        if (graficoPrefixosBarras) graficoPrefixosBarras.destroy();
        graficoPrefixosBarras = new Chart(ctxBarras, {
          type: 'bar',
          data: {
            labels: p2.distribuicao_prefixos.map(d => `${d.prefixo}_`),
            datasets: [{
              label: 'Quantidade de Colunas',
              data: dadosGrafico,
              backgroundColor: '#93c5fd',
              hoverBackgroundColor: '#3b82f6',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: { ticks: { color: '#64748b' }, grid: { display: false } },
              y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(0,0,0,0.04)' } }
            }
          }
        });
      }
    }
  }

  // Primeiras e Últimas 10 Colunas
  const containerPrimeiras = document.getElementById('chips-primeiras-10');
  if (containerPrimeiras) {
    containerPrimeiras.innerHTML = '';
    p2.primeiras_10.forEach((col, idx) => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = `${idx + 1}. ${col}`;
      containerPrimeiras.appendChild(span);
    });
  }

  const containerUltimas = document.getElementById('chips-ultimas-10');
  if (containerUltimas) {
    containerUltimas.innerHTML = '';
    const total = p2.total_variaveis;
    p2.ultimas_10.forEach((col, idx) => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = `${total - 9 + idx}. ${col}`;
      containerUltimas.appendChild(span);
    });
  }
}

// 4. Renderiza Prioridade 3 (Variáveis Quantitativas e Estatística Descritiva)
function renderizarPrioridade3() {
  const p3 = dadosDashboard.prioridade3_quantitativas;

  const badgeQt = document.getElementById('badge-total-qt');
  if (badgeQt) badgeQt.textContent = `${p3.total_quantitativas_discretas} Variáveis`;

  // Renderiza Estatísticas Descritivas Centrais (QT_MAT_BAS, QT_DOC_BAS, QT_TUR_BAS)
  renderizarEstatisticasDescritivas(p3.estatisticas_descritivas);

  // Resumo de categorias
  const resumoCorpo = document.getElementById('tabela-categorias-corpo');
  if (resumoCorpo && p3.resumo_categorias_estatisticas) {
    resumoCorpo.innerHTML = '';
    for (const [cat, qtd] of Object.entries(p3.resumo_categorias_estatisticas)) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${cat}</strong></td>
        <td><span style="font-weight: 700; color: #2563eb;">${qtd}</span></td>
        <td>${((qtd / dadosDashboard.prioridade2_contagem.total_variaveis) * 100).toFixed(2)}%</td>
      `;
      resumoCorpo.appendChild(tr);
    }
  }

  // Grupos Temáticos de Quantitativas
  const containerGrupos = document.getElementById('grupos-quantitativas-grid');
  if (containerGrupos && p3.grupos_quantitativas) {
    containerGrupos.innerHTML = '';
    for (const [grupo, info] of Object.entries(p3.grupos_quantitativas)) {
      const card = document.createElement('div');
      card.className = 'pastel-card blue';
      card.style.padding = '16px';
      card.innerHTML = `
        <div class="pastel-card-header">
          <span>${grupo}</span>
          <span class="pastel-trend info">${info.quantidade} vars</span>
        </div>
        <div class="pastel-card-footer" style="margin-top: 4px; word-break: break-all;">
          <strong>Exemplos:</strong> ${info.exemplos.slice(0, 3).join(', ')}...
        </div>
      `;
      containerGrupos.appendChild(card);
    }
  }

  // Lista de todas as variáveis QT
  const containerLista = document.getElementById('chips-todas-qt');
  if (containerLista && p3.variaveis_qt_lista) {
    containerLista.innerHTML = '';
    p3.variaveis_qt_lista.forEach(col => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = col;
      containerLista.appendChild(chip);
    });
  }
}

// 4.1 Renderizador da Estatística Descritiva das 3 Quantitativas Centrais
function renderizarEstatisticasDescritivas(stats) {
  if (!stats) return;

  const containerCards = document.getElementById('stats-cards-quantitativas');
  const tbodyTabela = document.getElementById('tabela-stats-descritivas-corpo');

  if (containerCards) containerCards.innerHTML = '';
  if (tbodyTabela) tbodyTabela.innerHTML = '';

  const labelsChart = [];
  const mediasChart = [];
  const medianasChart = [];
  const stdsChart = [];

  const cores = {
    'QT_MAT_BAS': { border: '#2563eb', tagBg: '#eff6ff', tagColor: '#1d4ed8' },
    'QT_DOC_BAS': { border: '#059669', tagBg: '#ecfdf5', tagColor: '#047857' },
    'QT_TUR_BAS': { border: '#7c3aed', tagBg: '#f5f3ff', tagColor: '#6d28d9' }
  };

  for (const [key, item] of Object.entries(stats)) {
    labelsChart.push(item.variavel);
    mediasChart.push(item.media);
    medianasChart.push(item.mediana);
    stdsChart.push(item.desvio_padrao);

    const cor = cores[key] || { border: '#2563eb', tagBg: '#eff6ff', tagColor: '#1d4ed8' };

    // 1. Card Detalhado
    if (containerCards) {
      const card = document.createElement('div');
      card.className = 'stat-card-deep';

      card.innerHTML = `
        <div class="stat-card-header">
          <span class="stat-var-tag" style="background: ${cor.tagBg}; color: ${cor.tagColor}; border-color: ${cor.border};">
            ${item.variavel}
          </span>
          <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-top: 8px;">
            ${item.rotulo}
          </h4>
          <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 2px;">
            ${item.descricao}
          </p>
        </div>

        <div class="stat-metrics-trio">
          <div class="stat-trio-item">
            <div class="stat-trio-label">Média (&mu;)</div>
            <div class="stat-trio-value" style="color: #2563eb;">
              ${item.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${item.unidade}/escola</div>
          </div>
          <div class="stat-trio-item">
            <div class="stat-trio-label">Mediana (Md)</div>
            <div class="stat-trio-value" style="color: #059669;">
              ${item.mediana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${item.unidade}</div>
          </div>
          <div class="stat-trio-item">
            <div class="stat-trio-label">Desvio-Padrão (&sigma;)</div>
            <div class="stat-trio-value" style="color: #d97706;">
              ${item.desvio_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">&plusmn; dispersão</div>
          </div>
        </div>

        <div class="stat-details-list">
          <div class="stat-detail-row">
            <span>Escolas com Dados Válidos:</span>
            <strong>${item.validos.toLocaleString('pt-BR')} (${item.pct_preenchido}%)</strong>
          </div>
          <div class="stat-detail-row">
            <span>Escolas Inativas / Ausentes:</span>
            <span>${item.ausentes.toLocaleString('pt-BR')} (${item.pct_ausente}%)</span>
          </div>
          <div class="stat-detail-row">
            <span>Amplitude (Mínimo a Máximo):</span>
            <strong>${item.minimo.toLocaleString('pt-BR')} a ${item.maximo.toLocaleString('pt-BR')} ${item.unidade}</strong>
          </div>
          <div class="stat-detail-row">
            <span>Intervalo Interquartil (Q1 &rarr; Q3):</span>
            <strong>${item.q1.toLocaleString('pt-BR')} &rarr; ${item.q3.toLocaleString('pt-BR')} (IQR = ${item.iqr.toLocaleString('pt-BR')})</strong>
          </div>
          <div class="stat-detail-row">
            <span>Coeficiente de Variação (CV):</span>
            <strong>${item.coef_variacao}% ${item.coef_variacao > 100 ? '(Alta)' : '(Moderada)'}</strong>
          </div>
          <div class="stat-detail-row">
            <span>Volume Total no Brasil:</span>
            <strong style="color: #2563eb;">${item.soma_total.toLocaleString('pt-BR')} ${item.unidade}</strong>
          </div>
        </div>

        <div class="stat-interpretacao-box">
          <strong>Diagnóstico:</strong> ${item.interpretacao}
        </div>
      `;
      containerCards.appendChild(card);
    }

    // 2. Linha na Tabela Consolidada
    if (tbodyTabela) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code style="font-weight: 700; color: ${cor.tagColor};">${item.variavel}</code></td>
        <td><strong>${item.rotulo}</strong></td>
        <td>${item.validos.toLocaleString('pt-BR')}</td>
        <td><strong style="color: #2563eb;">${item.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
        <td><strong style="color: #059669;">${item.mediana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
        <td><strong style="color: #d97706;">${item.desvio_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
        <td>${item.coef_variacao}%</td>
        <td>${item.minimo.toLocaleString('pt-BR')}</td>
        <td>${item.q1.toLocaleString('pt-BR')}</td>
        <td>${item.q3.toLocaleString('pt-BR')}</td>
        <td>${item.maximo.toLocaleString('pt-BR')}</td>
        <td><span style="font-weight: 700; color: var(--text-main);">${item.soma_total.toLocaleString('pt-BR')}</span></td>
      `;
      tbodyTabela.appendChild(tr);
    }
  }

  // 3. Gráfico Comparativo Média vs Mediana vs Desvio
  if (window.Chart) {
    const ctx = document.getElementById('chart-comparativo-stats');
    if (ctx) {
      if (graficoComparativoStats) graficoComparativoStats.destroy();
      graficoComparativoStats = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labelsChart,
          datasets: [
            {
              label: 'Média Aritmética (μ)',
              data: mediasChart,
              backgroundColor: '#93c5fd',
              borderRadius: 6
            },
            {
              label: 'Mediana (Md)',
              data: medianasChart,
              backgroundColor: '#a7f3d0',
              borderRadius: 6
            },
            {
              label: 'Desvio-Padrão (σ)',
              data: stdsChart,
              backgroundColor: '#fed7aa',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#475569', font: { family: 'Inter', size: 12 }, boxWidth: 14 }
            },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              }
            }
          },
          scales: {
            x: { ticks: { color: '#475569', font: { family: 'monospace', size: 12 } }, grid: { display: false } },
            y: {
              ticks: { color: '#64748b' },
              grid: { color: 'rgba(0,0,0,0.04)' },
              type: 'logarithmic'
            }
          }
        }
      });
    }
  }
}

// 5. Renderiza Prioridade 4 (Valores Ausentes das 21 Variáveis Centrais)
function renderizarPrioridade4() {
  const p4 = dadosDashboard.prioridade4_ausencias;

  const elMaior = document.getElementById('p4-maior-ausencia');
  if (elMaior) elMaior.textContent = `${p4.maior_ausencia_pct}% (IN_BANDA_LARGA)`;

  const elTotal = document.getElementById('p4-total-analisadas');
  if (elTotal) elTotal.textContent = p4.total_analisadas;

  // Tabela de Variáveis Centrais
  const tbody = document.getElementById('tabela-ausencias-corpo');
  if (tbody) {
    tbody.innerHTML = '';
    const labelsChart = [];
    const dataAusentesChart = [];

    p4.tabela_variaveis.forEach((item, index) => {
      labelsChart.push(item.variavel);
      dataAusentesChart.push(item.percentual_ausente);

      const isBandaLarga = item.variavel === 'IN_BANDA_LARGA';
      const tr = document.createElement('tr');
      if (isBandaLarga) {
        tr.style.background = '#f0f9ff';
      }

      tr.innerHTML = `
        <td><span style="color: var(--text-muted); font-size: 0.8rem;">#${index + 1}</span></td>
        <td>
          <code style="font-weight: 700; color: ${isBandaLarga ? '#0284c7' : '#0f172a'};">
            ${item.variavel}
          </code>
        </td>
        <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${item.categoria}</span></td>
        <td>
          <span style="font-weight: 600; color: #059669;">
            ${item.preenchidos.toLocaleString('pt-BR')}
          </span>
          <span style="font-size: 0.74rem; color: var(--text-muted);">(${item.percentual_preenchido}%)</span>
        </td>
        <td>
          <span style="font-weight: 700; color: ${item.percentual_ausente > 0 ? (isBandaLarga ? '#0284c7' : '#d97706') : '#059669'};">
            ${item.ausentes.toLocaleString('pt-BR')}
          </span>
        </td>
        <td>
          <div class="bar-wrap">
            <span style="font-weight: 700; min-width: 50px; color: ${item.percentual_ausente > 0 ? (isBandaLarga ? '#0284c7' : '#d97706') : '#059669'};">
              ${item.percentual_ausente.toFixed(2)}%
            </span>
            <div class="bar-bg" style="width: 100px;">
              <div class="bar-fill ${item.percentual_ausente > 0 ? 'warning' : ''}" style="width: ${Math.max(item.percentual_ausente, 2)}%;"></div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge-pill" style="background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
            ✓ Aprovado (&lt; 50%)
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Gráfico de Ausências com Linha de Corte
    if (window.Chart) {
      const ctx = document.getElementById('chart-ausencias-barras');
      if (ctx) {
        if (graficoAusencias) graficoAusencias.destroy();
        graficoAusencias = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labelsChart,
            datasets: [{
              label: '% Ausente',
              data: dataAusentesChart,
              backgroundColor: labelsChart.map(varName => {
                if (varName === 'IN_BANDA_LARGA') return '#38bdf8';
                const val = dataAusentesChart[labelsChart.indexOf(varName)];
                return val > 0 ? '#fcd34d' : '#a7f3d0';
              }),
              borderRadius: 4
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => ` ${ctx.raw}% ausente (${(100 - ctx.raw).toFixed(2)}% preenchido)`
                }
              }
            },
            scales: {
              x: {
                max: 100,
                ticks: { color: '#64748b', callback: v => v + '%' },
                grid: { color: 'rgba(0,0,0,0.04)' }
              },
              y: {
                ticks: { color: '#334155', font: { family: 'monospace', size: 11 } },
                grid: { display: false }
              }
            }
          }
        });
      }
    }
  }
}

// 6. Explorador Interativo de Variáveis (Pesquisa Dinâmica)
function renderizarExplorador() {
  const todas = dadosDashboard.explorador_variaveis.colunas;
  colunasFiltradas = [...todas];

  const searchInput = document.getElementById('input-busca-coluna');
  const filtroSelect = document.getElementById('select-filtro-prefixo');

  const aplicarFiltros = () => {
    const termo = searchInput ? searchInput.value.trim().toUpperCase() : '';
    const prefixo = filtroSelect ? filtroSelect.value : 'TODOS';

    colunasFiltradas = todas.filter(col => {
      const batePrefixo = (prefixo === 'TODOS') || (col.prefixo === prefixo);
      const bateTermo = !termo || col.nome.toUpperCase().includes(termo) || col.tipo_estatistico.toUpperCase().includes(termo);
      return batePrefixo && bateTermo;
    });

    paginaAtual = 1;
    atualizarTabelaExplorador();
  };

  if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
  if (filtroSelect) filtroSelect.addEventListener('change', aplicarFiltros);

  const btnPrev = document.getElementById('btn-prev-page');
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (paginaAtual > 1) {
        paginaAtual--;
        atualizarTabelaExplorador();
      }
    });
  }

  const btnNext = document.getElementById('btn-next-page');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      const totalPaginas = Math.ceil(colunasFiltradas.length / ITENS_POR_PAGINA);
      if (paginaAtual < totalPaginas) {
        paginaAtual++;
        atualizarTabelaExplorador();
      }
    });
  }

  atualizarTabelaExplorador();
}

function atualizarTabelaExplorador() {
  const tbody = document.getElementById('tabela-explorador-corpo');
  if (!tbody) return;
  tbody.innerHTML = '';

  const total = colunasFiltradas.length;
  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const fim = Math.min(inicio + ITENS_POR_PAGINA, total);
  const itensPagina = colunasFiltradas.slice(inicio, fim);

  const elContador = document.getElementById('explorador-contador');
  if (elContador) {
    elContador.textContent = `Mostrando ${total === 0 ? 0 : inicio + 1} a ${fim} de ${total} variáveis encontradas`;
  }

  const elPaginacao = document.getElementById('paginacao-info');
  if (elPaginacao) {
    elPaginacao.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  }

  const btnPrev = document.getElementById('btn-prev-page');
  if (btnPrev) btnPrev.disabled = (paginaAtual === 1);

  const btnNext = document.getElementById('btn-next-page');
  if (btnNext) btnNext.disabled = (paginaAtual >= totalPaginas);

  if (itensPagina.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">
          Nenhuma variável encontrada com os critérios informados.
        </td>
      </tr>
    `;
    return;
  }

  itensPagina.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="color: var(--text-muted); font-size: 0.8rem;">#${item.ordem}</span></td>
      <td><code>${item.nome}</code></td>
      <td><span class="badge-pill badge-${item.prefixo.toLowerCase()}">${item.tipo_estatistico}</span></td>
      <td style="color: var(--text-secondary); font-size: 0.82rem;">${item.descricao_prefixo}</td>
      <td>
        <span style="font-family: monospace; font-size: 0.78rem; color: #0284c7; background: #f0f9ff; padding: 2px 6px; border-radius: 4px;">
          ${item.amostras.length > 0 ? item.amostras.join(', ') : 'N/A'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
