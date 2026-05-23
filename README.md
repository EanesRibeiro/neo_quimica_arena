# 🦅 Arena Corinthians Stats Hub

## 🌐 Demo ao vivo: **[EanesRibeiro.github.io/neo_quimica_arena](https://EanesRibeiro.github.io/neo_quimica_arena)**

O **Arena Corinthians Stats Hub** é uma plataforma interativa de análise de dados esportivos dedicada a explorar o histórico de partidas do Corinthians como mandante em seu estádio oficial (Neo Química Arena/Arena Corinthians). A base de dados engloba **400 jogos** desde a inauguração da Arena em 2014 até o final da temporada de 2025, fornecendo insights detalhados sobre desempenho coletivo, desempenho individual de atletas, comportamento temporal de gols e recordes financeiros.

Acesse o repositório do projeto no GitHub: [EanesRibeiro/neo_quimica_arena](https://github.com/EanesRibeiro/neo_quimica_arena)

---

## 🚀 Funcionalidades do Projeto

O Hub é dividido em quatro áreas principais de análise:

1.  **📊 Dashboard de Estatísticas Gerais**:
    *   Métricas agregadas da Arena: total de partidas, vitórias, empates, derrotas.
    *   Taxa de aproveitamento geral de pontos.
    *   Total de gols marcados e gols sofridos, com o saldo de gols acumulado.
    *   Público pagante acumulado e médias (considerando apenas jogos com torcida).
    *   Arrecadação bruta total (renda) e ticket médio.
    *   Destaque para o recorde de invencibilidade histórica do estádio.

2.  **🧮 Calculadora Híbrida de Probabilidade de Vitória (Win Probability)**:
    *   Uma ferramenta interativa para simular cenários futuros na Arena cruzando quatro fatores: *Campeonato*, *Dia da Semana*, *Período do Dia (Manhã, Tarde, Noite)* e *Faixa de Público Estimado*.
    *   **Algoritmo Híbrido**: 
        *   Caso haja amostragem suficiente no histórico ($\ge 5$ partidas para os filtros combinados), é calculada a probabilidade empírica exata.
        *   Para combinações inéditas ou de baixa amostragem histórica ($N < 5$ partidas), a ferramenta aciona automaticamente um classificador probabilístico de **Naive Bayes com Suavização de Laplace ($\alpha = 0.5$)** rodando diretamente no frontend (tempo de resposta instantâneo, custo zero de infraestrutura e alinhado com o princípio YAGNI).

3.  **⏱️ Clutch Moments & Índice de Viradas**:
    *   **Janelas de 15 Minutos**: Distribuição detalhada de gols a favor e contra dividida em blocos temporais de 15 minutos, além dos acréscimos do primeiro e segundo tempo, demonstrando os períodos em que o time é mais letal ou vulnerável.
    *   **Índice de Resiliência (Viradas)**: Análise detalhada das partidas em que o Corinthians saiu perdendo em casa e conseguiu reverter para vitória, destacando os jogos mais marcantes.

4.  **🏆 Hall da Fama e Recordes**:
    *   **Visão de Jogadores**: Rankings interativos de maiores artilheiros, maiores assistentes (garçons), recordistas de partidas e jogadores com melhor rendimento individual de pontos (mínimo de 30 jogos).
    *   **Visão de Partidas**: Lista interativa dos 10 jogos marcantes de maior público, maiores rendas de bilheteria e maiores goleadas aplicadas em Itaquera.

---

## 🛠️ Stack Tecnológica

O projeto foi arquitetado para ter performance máxima e custo zero de infraestrutura na web:

*   **Frontend (SPA)**: React 18, Vite 5 e a biblioteca de ícones `lucide-react`.
*   **Estilização**: Vanilla CSS puro, utilizando variáveis de cores em HSL para criar um tema **Dark Mode** sofisticado e responsivo inspirado na iluminação e no design de mármore escuro da Neo Química Arena.
*   **Pipeline de Dados (ETL)**: Python 3 com a biblioteca Pandas.

---

## 📂 Estrutura do Projeto

```text
neo_quimica_arena/
├── .agent/                    # Documentação do fluxo SDD (Fase 0 à Fase 4)
├── data/                      # Arquivos CSV originais do Kaggle
│   ├── A - Jogos.csv          # Histórico geral de partidas
│   ├── B - Escalacoes.csv     # Escalações detalhadas (titulares e reservas)
│   ├── C - Gols Marcados.csv  # Gols marcados a favor do Corinthians
│   ├── D - Gols Sofridos.csv  # Gols sofridos na Arena
│   └── E - Jogadores.csv      # Estatísticas consolidadas por jogador
├── dist/                      # Bundle estático gerado para produção
├── src/
│   ├── components/            # Componentes reutilizáveis da interface
│   │   ├── ClutchMoments.jsx
│   │   ├── TopPerformers.jsx
│   │   └── WinProbabilityCalculator.jsx
│   ├── data/                  # Script ETL e JSONs de produção agregados
│   │   ├── process_data.py    # Pipeline Python que consolida os CSVs
│   │   ├── summary_stats.json
│   │   ├── calculator_frequencies.json
│   │   ├── clutch_moments.json
│   │   └── top_performers.json
│   ├── App.css                # Estilos globais e componentes Vanilla CSS
│   ├── App.jsx                # Componente raiz do aplicativo
│   └── main.jsx               # Ponto de inicialização do React
├── index.html                 # Ponto de entrada do Vite
├── package.json               # Dependências do projeto
├── vite.config.js             # Configuração do Vite
└── README.md                  # Documentação do projeto
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter o **Node.js** (versão 18 ou superior) e o **Python 3** instalados em sua máquina.

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone https://github.com/EanesRibeiro/neo_quimica_arena.git
cd neo_quimica_arena
npm install
```

### 2. Rodar o Pipeline de Dados (Opcional)
Os dados JSON consolidados em `src/data/` já estão inclusos no repositório. Porém, caso queira rodar o pipeline novamente para processar novas partidas ou re-analisar as tabelas CSV locais em `/data`, execute:
```bash
python src/data/process_data.py
```
*(Nota: O script requer Python 3 e a biblioteca `pandas` instalada via `pip install pandas`)*

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse o endereço local indicado no terminal (geralmente `http://localhost:5173`) no seu navegador.

### 4. Compilar para Produção (Build)
Para gerar os arquivos estáticos de produção otimizados na pasta `dist/` (prontos para serem hospedados de forma gratuita no GitHub Pages, Vercel, Netlify, etc.):
```bash
npm run build
```

---

## 📝 Licença e Créditos
*   **Dados Originais**: Base de dados obtida no Kaggle (`danilosoares/arena-corinthians`), com dados históricos curados pela equipe do **Timão Dados**.
*   **Desenvolvedor**: Eanes Ribeiro.
