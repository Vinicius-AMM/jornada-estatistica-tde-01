# 📊 **Trabalho Discente Efetivo (TDE 1) — Jornada de Dados**  
> Projeto de Análise Exploratória de Dados e Estatística Descritiva desenvolvido para a disciplina de **Estatística** do **Centro Universitário Paraíso (UniFAP)**.

---

## 📌 Sobre o Projeto

É um sistema interativo de dashboard web voltado para a prospecção, auditoria de integridade e análise estatística descritiva dos **Microdados do Censo Escolar da Educação Básica 2024** (disponibilizados pelo INEP/MEC).

O objetivo principal deste projeto foi avaliar a elegibilidade da base de dados perante os 11 requisitos institucionais previstos na **Jornada de Dados**, realizando análises de tendência central, dispersão, assimetria, variabilidade e qualidade dos dados.

---

## 🎓 Informações Acadêmicas

* **Instituição:** Centro Universitário Paraíso (UniFAP)
* **Cursos:** Análise e Desenvolvimento de Sistemas (ADS) & Sistemas de Informação (SI)
* **Disciplina:** Estatística
* **Docente:** Prof. Sávio de Brito Fontenele

### 👥 Equipe de Desenvolvimento
* **João Victor Cordeiro da Silva** — *ADS* - Analista
* **Kauê Ferreira Gomes da Silva** — *ADS* - Pesquisador
* **Paulo Vitor da Costa Rodrigues** — *SI* - Gerente
* **Vinicius Aurélio Marinho Menezes** — *ADS* - Desenvolvedor
* **Yuri Avner Cardoso Fontes** — *SI* - Orador

---

## 📂 Ficha Técnica da Base de Dados

* **Nome Oficial:** Microdados do Censo Escolar da Educação Básica 2024
* **Órgão Responsável:** INEP / MEC
* **Arquivo Analisado:** `microdados_ed_basica_2024.csv` (207,83 MB)
* **Volumetria:** 215.545 registros e 426 variáveis
* **Escala da Pesquisa:** 179,3 mil escolas e 47,1 milhões de matrículas na Educação Básica
* **Link:** [https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar]
---

## 🖥️ Funcionalidades do Dashboard

- **Visão Geral e Identificação:** Exibição dos metadados técnicos do arquivo, parâmetros de coleta, delimitação e verificação criptográfica por Hash MD5.
- **Estatística Descritiva das Variáveis Centrais:**
  - Análise detalhada das variáveis `QT_MAT_BAS` (Matrículas), `QT_DOC_BAS` (Docentes) e `QT_TUR_BAS` (Turmas).
  - Métricas de tendência central (Média, Mediana) e dispersão (Desvio-Padrão, Intervalo Interquartil - IQR, Coeficiente de Variação - CV).
  - Diagnósticos automáticos de assimetria e heterogeneidade dos dados.
- **Auditoria de Qualidade e Ausências:** Verificação de percentual de dados válidos, inativos e lacunas (como a análise da variável `IN_BANDA_LARGA`).
- **Explorador de Variáveis:** Interface flexível para busca e filtragem entre os 426 campos catalogados.

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem Backend / Processamento:** [Python 3.x](https://www.python.org/)
- **Servidor Web Local:** Python `http.server` / Micro-framework em Python
- **Frontend / Interface:**
  - HTML5 & CSS3 Personalizado
  - JavaScript Assíncrono
- **Análise de Dados:** Pandas / NumPy

---
