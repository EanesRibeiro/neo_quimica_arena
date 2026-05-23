import pandas as pd
import json
import os
import re

# Caminhos dos arquivos
DATA_DIR = "./data"
SRC_DATA_DIR = "./src/data"

# Garantir que a pasta de destino exista
os.makedirs(SRC_DATA_DIR, exist_ok=True)

PATH_JOGOS = os.path.join(DATA_DIR, "A - Jogos.csv")
PATH_ESCALACOES = os.path.join(DATA_DIR, "B - Escalacoes.csv")
PATH_GOLS_MARCADOS = os.path.join(DATA_DIR, "C - Gols Marcados.csv")
PATH_GOLS_SOFRIDOS = os.path.join(DATA_DIR, "D - Gols Sofridos.csv")
PATH_JOGADORES = os.path.join(DATA_DIR, "E - Jogadores.csv")

def clean_currency(val):
    if pd.isna(val) or val == "":
        return 0.0
    val_str = str(val).replace('R$', '').replace(' ', '')
    # Se contiver pontos e vírgula (ex: 3.029.801,70 ou 3029801.70)
    # Removemos pontos e trocamos a vírgula por ponto
    if ',' in val_str:
        val_str = val_str.replace('.', '').replace(',', '.')
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def clean_attendance(val):
    if pd.isna(val) or val == "":
        return 0
    val_str = str(val).replace(' ', '')
    # Se contiver pontos (ex: 36.123), removemos os pontos
    if '.' in val_str:
        # Se for decimal com ponto (como 36123.00), mantemos o ponto do decimal ou removemos dependendo do formato.
        # Geralmente é no formato 36.123 (milhar com ponto). Se for 36.123, removemos o ponto.
        # Vamos contar os caracteres após o ponto. Se forem 3, é ponto de milhar.
        parts = val_str.split('.')
        if len(parts[-1]) == 3 or len(parts) > 2:
            val_str = val_str.replace('.', '')
        else:
            val_str = parts[0] # descarta decimais de público
    try:
        return int(val_str)
    except ValueError:
        return 0

def classify_period(hora_str):
    if pd.isna(hora_str) or hora_str == "":
        return "Noite"
    hora_str = str(hora_str).strip()
    try:
        hour = int(hora_str.split(':')[0])
        if hour < 12:
            return "Manhã"
        elif hour < 18:
            return "Tarde"
        else:
            return "Noite"
    except Exception:
        return "Noite"

def get_attendance_range(pub):
    if pub < 25000:
        return "under25k"
    elif pub <= 35000:
        return "range25kTo35k"
    elif pub <= 45000:
        return "range35kTo45k"
    else:
        return "over45k"

def parse_minute_to_val(minuto_str, tempo):
    minuto_str = str(minuto_str).strip().upper()
    if '+' in minuto_str:
        parts = minuto_str.split('+')
        try:
            base = float(parts[0])
            extra = float(parts[1])
            val = base + extra / 100.0
        except ValueError:
            val = 45.0 if tempo == '1T' else 90.0
    else:
        # Remover caracteres não numéricos se existirem (ex: '45'' ou '20')
        minuto_str = re.sub(r'[^\d.]', '', minuto_str)
        try:
            val = float(minuto_str)
        except ValueError:
            val = 45.0 if tempo == '1T' else 90.0
    
    if tempo == '2T':
        if val <= 45.0:
            val += 45.0
    return val

def classify_minute_interval(minuto_str, tempo):
    minuto_str = str(minuto_str).strip().upper()
    if '+' in minuto_str:
        return "45+" if tempo == '1T' else "90+"
    
    # Remover letras e aspas
    clean_min = re.sub(r'[^\d]', '', minuto_str)
    try:
        minuto = int(clean_min)
    except ValueError:
        return "45+" if tempo == '1T' else "90+"
    
    if tempo == '1T':
        if minuto <= 15:
            return "1-15"
        elif minuto <= 30:
            return "16-30"
        elif minuto <= 45:
            return "31-45"
        else:
            return "45+"
    else: # 2T
        if minuto > 90:
            return "90+"
        # Se os minutos estiverem no formato 1-45 para o 2T, normaliza para 46-90
        if minuto < 46:
            minuto += 45
        
        if minuto <= 60:
            return "46-60"
        elif minuto <= 75:
            return "61-75"
        elif minuto <= 90:
            return "76-90"
        else:
            return "90+"

def main():
    print("Iniciando ETL do Arena Corinthians Stats Hub...")

    # 1. Carregar os CSVs
    df_jogos = pd.read_csv(PATH_JOGOS)
    df_escalacoes = pd.read_csv(PATH_ESCALACOES)
    df_gols_marcados = pd.read_csv(PATH_GOLS_MARCADOS)
    df_gols_sofridos = pd.read_csv(PATH_GOLS_SOFRIDOS)
    df_jogadores = pd.read_csv(PATH_JOGADORES)

    # 2. Limpeza básica nos dados dos jogos
    def clean_goals(val):
        if pd.isna(val) or val == "":
            return 0
        cleaned = re.sub(r'[^\d]', '', str(val).strip())
        if cleaned == "":
            return 0
        return int(cleaned)

    df_jogos['GOL COR'] = df_jogos['GOL COR'].apply(clean_goals)
    df_jogos['GOL VIS'] = df_jogos['GOL VIS'].apply(clean_goals)
    df_jogos['PUBLICO PAGANTE'] = df_jogos['PUBLICO PAGANTE'].apply(clean_attendance)
    df_jogos['RENDA'] = df_jogos['RENDA'].apply(clean_currency)
    df_jogos['period'] = df_jogos['HORA'].apply(classify_period)
    df_jogos['attendance_range'] = df_jogos['PUBLICO PAGANTE'].apply(get_attendance_range)

    # Data Quality Gates
    total_jogos_processados = len(df_jogos)
    if total_jogos_processados != 400:
        raise ValueError(f"GATE FAILURE: O número total de jogos é {total_jogos_processados}, deveria ser exatamente 400.")
    
    total_gols_cor = df_jogos['GOL COR'].sum()
    total_gols_vis = df_jogos['GOL VIS'].sum()
    
    # 3. Processar Viradas e evolução do placar para cada jogo
    # Vamos unir gols marcados e sofridos por jogo
    gols_marcados_list = []
    for idx, row in df_gols_marcados.iterrows():
        gols_marcados_list.append({
            "JOGO": int(row['JOGO']),
            "type": "scored",
            "minuto": str(row['MINUTO']),
            "tempo": str(row['TEMPO']),
            "jogador": str(row['JOGADOR']),
            "adversario": str(row['ADVERSÁRIO']),
            "time_val": parse_minute_to_val(row['MINUTO'], row['TEMPO'])
        })

    gols_sofridos_list = []
    for idx, row in df_gols_sofridos.iterrows():
        gols_sofridos_list.append({
            "JOGO": int(row['JOGO']),
            "type": "conceded",
            "minuto": str(row['MINUTO']),
            "tempo": str(row['TEMPO']),
            "jogador": str(row['JOGADOR']),
            "adversario": str(row['ADVERSÁRIO']),
            "time_val": parse_minute_to_val(row['MINUTO'], row['TEMPO'])
        })

    all_gols = gols_marcados_list + gols_sofridos_list

    # Agrupar gols por jogo
    gols_por_jogo = {}
    for g in all_gols:
        j_id = g['JOGO']
        if j_id not in gols_por_jogo:
            gols_por_jogo[j_id] = []
        gols_por_jogo[j_id].append(g)

    # Ordenar gols em cada jogo por tempo
    for j_id in gols_por_jogo:
        gols_por_jogo[j_id].sort(key=lambda x: x['time_val'])

    # Analisar viradas
    viradas_a_favor = []
    viradas_contra = []

    for idx, row in df_jogos.iterrows():
        j_id = int(row['JOGO'])
        resultado = str(row['RESULTADO']).strip().upper()
        
        gols = gols_por_jogo.get(j_id, [])
        
        cor_score = 0
        vis_score = 0
        cor_was_behind = False
        cor_was_ahead = False
        
        for g in gols:
            if g['type'] == 'scored':
                cor_score += 1
            else:
                vis_score += 1
            
            if vis_score > cor_score:
                cor_was_behind = True
            if cor_score > vis_score:
                cor_was_ahead = True
        
        jogo_info = {
            "jogo": j_id,
            "adversario": str(row['VISITANTE']),
            "campeonato": str(row['CAMPEONATO']),
            "data": f"{int(row['DIA']):02d}/{int(row['MES']):02d}/{int(row['ANO'])}",
            "placar": f"{row['GOL COR']} x {row['GOL VIS']}",
            "publico": int(row['PUBLICO PAGANTE']),
            "renda": float(row['RENDA'])
        }
        
        if resultado == 'V' and cor_was_behind:
            viradas_a_favor.append(jogo_info)
        elif resultado == 'D' and cor_was_ahead:
            viradas_contra.append(jogo_info)

    # 4. Distribuição de gols por blocos de 15 minutos
    intervals = ["1-15", "16-30", "31-45", "45+", "46-60", "61-75", "76-90", "90+"]
    gols_dist = {i: {"scored": 0, "conceded": 0} for i in intervals}

    for g in gols_marcados_list:
        interval = classify_minute_interval(g['minuto'], g['tempo'])
        if interval in gols_dist:
            gols_dist[interval]["scored"] += 1

    for g in gols_sofridos_list:
        interval = classify_minute_interval(g['minuto'], g['tempo'])
        if interval in gols_dist:
            gols_dist[interval]["conceded"] += 1

    # Data Quality Gates: validar soma de gols marcados e sofridos
    total_gols_marcados_dist = sum(gols_dist[i]["scored"] for i in intervals)
    total_gols_sofridos_dist = sum(gols_dist[i]["conceded"] for i in intervals)
    
    print(f"Gols no CSV de Jogos: Marcados={total_gols_cor}, Sofridos={total_gols_vis}")
    print(f"Gols nas planilhas detalhadas: Marcados={len(df_gols_marcados)}, Sofridos={len(df_gols_sofridos)}")
    print(f"Gols distribuídos nos intervalos: Marcados={total_gols_marcados_dist}, Sofridos={total_gols_sofridos_dist}")

    # Salvar Clutch Moments JSON
    clutch_moments_data = {
        "goals_by_interval": gols_dist,
        "turnarounds": {
            "wins_after_conceding_first": {
                "count": len(viradas_a_favor),
                "percentage_of_wins": (len(viradas_a_favor) / len(df_jogos[df_jogos['RESULTADO'] == 'V']) * 100) if len(df_jogos[df_jogos['RESULTADO'] == 'V']) > 0 else 0,
                "featured_games": viradas_a_favor[-5:] # Últimos 5 jogos de virada
            },
            "losses_after_scoring_first": {
                "count": len(viradas_contra),
                "percentage_of_losses": (len(viradas_contra) / len(df_jogos[df_jogos['RESULTADO'] == 'D']) * 100) if len(df_jogos[df_jogos['RESULTADO'] == 'D']) > 0 else 0,
                "featured_games": viradas_contra[-5:] # Últimos 5 jogos sofrendo virada
            }
        }
    }
    with open(os.path.join(SRC_DATA_DIR, "clutch_moments.json"), "w", encoding="utf-8") as f:
        json.dump(clutch_moments_data, f, ensure_ascii=False, indent=2)

    # 5. Frequências para Calculadora Naive Bayes
    freq_data = {
        "totals": {
            "V": int(df_jogos['RESULTADO'].value_counts().get('V', 0)),
            "E": int(df_jogos['RESULTADO'].value_counts().get('E', 0)),
            "D": int(df_jogos['RESULTADO'].value_counts().get('D', 0)),
            "total": int(len(df_jogos))
        },
        "byCompetition": {},
        "byDayOfWeek": {},
        "byPeriod": {},
        "byAttendanceRange": {},
        "combinations": {}
    }

    # Preencher byCompetition
    for comp in df_jogos['CAMPEONATO'].unique():
        sub_df = df_jogos[df_jogos['CAMPEONATO'] == comp]
        counts = sub_df['RESULTADO'].value_counts()
        freq_data["byCompetition"][comp] = {
            "V": int(counts.get('V', 0)),
            "E": int(counts.get('E', 0)),
            "D": int(counts.get('D', 0)),
            "total": int(len(sub_df))
        }

    # Preencher byDayOfWeek
    for day in df_jogos['DIA-SEMANA'].unique():
        sub_df = df_jogos[df_jogos['DIA-SEMANA'] == day]
        counts = sub_df['RESULTADO'].value_counts()
        freq_data["byDayOfWeek"][day] = {
            "V": int(counts.get('V', 0)),
            "E": int(counts.get('E', 0)),
            "D": int(counts.get('D', 0)),
            "total": int(len(sub_df))
        }

    # Preencher byPeriod
    for p in ["Manhã", "Tarde", "Noite"]:
        sub_df = df_jogos[df_jogos['period'] == p]
        counts = sub_df['RESULTADO'].value_counts()
        freq_data["byPeriod"][p] = {
            "V": int(counts.get('V', 0)),
            "E": int(counts.get('E', 0)),
            "D": int(counts.get('D', 0)),
            "total": int(len(sub_df))
        }

    # Preencher byAttendanceRange
    for r in ["under25k", "range25kTo35k", "range35kTo45k", "over45k"]:
        sub_df = df_jogos[df_jogos['attendance_range'] == r]
        counts = sub_df['RESULTADO'].value_counts()
        freq_data["byAttendanceRange"][r] = {
            "V": int(counts.get('V', 0)),
            "E": int(counts.get('E', 0)),
            "D": int(counts.get('D', 0)),
            "total": int(len(sub_df))
        }

    # Preencher combinations
    grouped_comb = df_jogos.groupby(['CAMPEONATO', 'DIA-SEMANA', 'period', 'attendance_range'])
    for name, group in grouped_comb:
        comp, day, period, attr_range = name
        key = f"{comp}|{day}|{period}|{attr_range}"
        counts = group['RESULTADO'].value_counts()
        freq_data["combinations"][key] = {
            "V": int(counts.get('V', 0)),
            "E": int(counts.get('E', 0)),
            "D": int(counts.get('D', 0)),
            "total": int(len(group))
        }

    # Salvar calculator_frequencies.json
    with open(os.path.join(SRC_DATA_DIR, "calculator_frequencies.json"), "w", encoding="utf-8") as f:
        json.dump(freq_data, f, ensure_ascii=False, indent=2)

    # 6. Estatísticas consolidadas (summary_stats.json)
    # Invencibilidade recorde
    max_invencivel = 0
    current_invencivel = 0
    for idx, row in df_jogos.sort_values('JOGO').iterrows():
        res = str(row['RESULTADO']).strip().upper()
        if res != 'D':
            current_invencivel += 1
            if current_invencivel > max_invencivel:
                max_invencivel = current_invencivel
        else:
            current_invencivel = 0

    # Maior público e maior renda
    idx_max_pub = df_jogos['PUBLICO PAGANTE'].idxmax()
    row_max_pub = df_jogos.loc[idx_max_pub]
    
    idx_max_rev = df_jogos['RENDA'].idxmax()
    row_max_rev = df_jogos.loc[idx_max_rev]

    # Maior vitória (saldo de gols do Corinthians)
    df_jogos['saldo'] = df_jogos['GOL COR'] - df_jogos['GOL VIS']
    row_biggest_win = df_jogos.sort_values(by=['saldo', 'GOL COR'], ascending=[False, False]).iloc[0]

    # Primeiro jogo da Arena
    first_game_row = df_jogos.sort_values('JOGO').iloc[0]
    
    # Primeiro gol do Corinthians na Arena
    # Vamos achar o primeiro jogo onde o Corinthians marcou gol
    cor_scored_games = df_jogos[(df_jogos['GOL COR'] > 0)].sort_values('JOGO')
    first_cor_scored_game = cor_scored_games.iloc[0] if len(cor_scored_games) > 0 else None
    
    first_goal_cor = {}
    if first_cor_scored_game is not None:
        j_id_first_goal = int(first_cor_scored_game['JOGO'])
        first_goal_detail = df_gols_marcados[df_gols_marcados['JOGO'] == j_id_first_goal].sort_values('GOL').iloc[0]
        first_goal_cor = {
            "jogador": str(first_goal_detail['JOGADOR']),
            "adversario": str(first_goal_detail['ADVERSÁRIO']),
            "data": str(first_goal_detail['DATA']),
            "placar_final": f"{first_cor_scored_game['GOL COR']} x {first_cor_scored_game['GOL VIS']}",
            "minuto": str(first_goal_detail['MINUTO'])
        }

    # Aproveitamento dos pontos
    total_pts_possiveis = total_jogos_processados * 3
    total_pts_ganhos = freq_data["totals"]["V"] * 3 + freq_data["totals"]["E"]
    aproveitamento = (total_pts_ganhos / total_pts_possiveis) * 100

    # Jogos com público maior que zero (para média de público real)
    jogos_com_publico = df_jogos[df_jogos['PUBLICO PAGANTE'] > 0]
    avg_pub_com_publico = jogos_com_publico['PUBLICO PAGANTE'].mean()
    avg_rev_com_publico = jogos_com_publico['RENDA'].mean()

    summary_stats_data = {
        "general": {
            "total_games": total_jogos_processados,
            "wins": freq_data["totals"]["V"],
            "draws": freq_data["totals"]["E"],
            "losses": freq_data["totals"]["D"],
            "win_percentage": aproveitamento,
            "goals_scored": int(total_gols_cor),
            "goals_conceded": int(total_gols_vis),
            "goal_difference": int(total_gols_cor - total_gols_vis),
            "unbeaten_streak_record": max_invencivel
        },
        "financial_and_attendance": {
            "total_attendance": int(df_jogos['PUBLICO PAGANTE'].sum()),
            "average_attendance": float(df_jogos['PUBLICO PAGANTE'].mean()),
            "average_attendance_with_crowd": float(avg_pub_com_publico),
            "total_revenue": float(df_jogos['RENDA'].sum()),
            "average_revenue": float(df_jogos['RENDA'].mean()),
            "average_revenue_with_crowd": float(avg_rev_com_publico)
        },
        "records": {
            "highest_attendance": {
                "publico": int(row_max_pub['PUBLICO PAGANTE']),
                "adversario": str(row_max_pub['VISITANTE']),
                "data": f"{int(row_max_pub['DIA']):02d}/{int(row_max_pub['MES']):02d}/{int(row_max_pub['ANO'])}",
                "placar": f"{row_max_pub['GOL COR']} x {row_max_pub['GOL VIS']}",
                "campeonato": str(row_max_pub['CAMPEONATO'])
            },
            "highest_revenue": {
                "renda": float(row_max_rev['RENDA']),
                "adversario": str(row_max_rev['VISITANTE']),
                "data": f"{int(row_max_rev['DIA']):02d}/{int(row_max_rev['MES']):02d}/{int(row_max_rev['ANO'])}",
                "placar": f"{row_max_rev['GOL COR']} x {row_max_rev['GOL VIS']}",
                "campeonato": str(row_max_rev['CAMPEONATO'])
            },
            "biggest_win": {
                "placar": f"{row_biggest_win['GOL COR']} x {row_biggest_win['GOL VIS']}",
                "adversario": str(row_biggest_win['VISITANTE']),
                "data": f"{int(row_biggest_win['DIA']):02d}/{int(row_biggest_win['MES']):02d}/{int(row_biggest_win['ANO'])}",
                "campeonato": str(row_biggest_win['CAMPEONATO']),
                "saldo": int(row_biggest_win['saldo'])
            }
        },
        "milestones": {
            "first_game": {
                "adversario": str(first_game_row['VISITANTE']),
                "data": f"{int(first_game_row['DIA']):02d}/{int(first_game_row['MES']):02d}/{int(first_game_row['ANO'])}",
                "placar": f"{first_game_row['GOL COR']} x {first_game_row['GOL VIS']}",
                "publico": int(first_game_row['PUBLICO PAGANTE']),
                "tecnico": str(first_game_row['TÉCNICO'])
            },
            "first_cor_goal": first_goal_cor
        }
    }

    with open(os.path.join(SRC_DATA_DIR, "summary_stats.json"), "w", encoding="utf-8") as f:
        json.dump(summary_stats_data, f, ensure_ascii=False, indent=2)

    # 7. Jogadores e jogos de destaque (top_performers.json)
    # Jogadores
    df_jogadores_clean = df_jogadores.copy()
    # Limpar e converter a coluna de desempenho
    df_jogadores_clean['DESEMPENHO (%)'] = df_jogadores_clean['DESEMPENHO (%)'].astype(str).str.replace(',', '.').astype(float)
    df_jogadores_clean['JOGOS'] = df_jogadores_clean['JOGOS'].astype(int)
    df_jogadores_clean['GOLS'] = df_jogadores_clean['GOLS'].fillna(0).astype(int)
    df_jogadores_clean['ASSISTÊNCIAS'] = df_jogadores_clean['ASSISTÊNCIAS'].fillna(0).astype(int)

    top_scorers = df_jogadores_clean.sort_values(by='GOLS', ascending=False).head(15)
    top_scorers_list = []
    for idx, row in top_scorers.iterrows():
        top_scorers_list.append({
            "jogador": str(row['JOGADOR']),
            "posicao": str(row['POSIÇÃO']),
            "jogos": int(row['JOGOS']),
            "gols": int(row['GOLS'])
        })

    top_assists = df_jogadores_clean.sort_values(by='ASSISTÊNCIAS', ascending=False).head(15)
    top_assists_list = []
    for idx, row in top_assists.iterrows():
        top_assists_list.append({
            "jogador": str(row['JOGADOR']),
            "posicao": str(row['POSIÇÃO']),
            "jogos": int(row['JOGOS']),
            "assistencias": int(row['ASSISTÊNCIAS'])
        })

    most_appearances = df_jogadores_clean.sort_values(by='JOGOS', ascending=False).head(15)
    most_appearances_list = []
    for idx, row in most_appearances.iterrows():
        most_appearances_list.append({
            "jogador": str(row['JOGADOR']),
            "posicao": str(row['POSIÇÃO']),
            "jogos": int(row['JOGOS']),
            "gols": int(row['GOLS']),
            "aproveitamento": float(row['DESEMPENHO (%)'])
        })

    # Melhores aproveitamentos (mínimo de 30 jogos)
    df_30_jogos = df_jogadores_clean[df_jogadores_clean['JOGOS'] >= 30]
    best_performance = df_30_jogos.sort_values(by='DESEMPENHO (%)', ascending=False).head(15)
    best_performance_list = []
    for idx, row in best_performance.iterrows():
        best_performance_list.append({
            "jogador": str(row['JOGADOR']),
            "posicao": str(row['POSIÇÃO']),
            "jogos": int(row['JOGOS']),
            "aproveitamento": float(row['DESEMPENHO (%)'])
        })

    # Jogos Memoráveis (Público, Renda, Goleadas)
    top_attendance_games = df_jogos.sort_values(by='PUBLICO PAGANTE', ascending=False).head(10)
    top_attendance_list = []
    for idx, row in top_attendance_games.iterrows():
        top_attendance_list.append({
            "jogo": int(row['JOGO']),
            "adversario": str(row['VISITANTE']),
            "placar": f"{row['GOL COR']} x {row['GOL VIS']}",
            "data": f"{int(row['DIA']):02d}/{int(row['MES']):02d}/{int(row['ANO'])}",
            "campeonato": str(row['CAMPEONATO']),
            "publico": int(row['PUBLICO PAGANTE'])
        })

    top_revenue_games = df_jogos.sort_values(by='RENDA', ascending=False).head(10)
    top_revenue_list = []
    for idx, row in top_revenue_games.iterrows():
        top_revenue_list.append({
            "jogo": int(row['JOGO']),
            "adversario": str(row['VISITANTE']),
            "placar": f"{row['GOL COR']} x {row['GOL VIS']}",
            "data": f"{int(row['DIA']):02d}/{int(row['MES']):02d}/{int(row['ANO'])}",
            "campeonato": str(row['CAMPEONATO']),
            "renda": float(row['RENDA'])
        })

    biggest_wins_games = df_jogos[df_jogos['RESULTADO'] == 'V'].sort_values(by=['saldo', 'GOL COR'], ascending=[False, False]).head(10)
    biggest_wins_list = []
    for idx, row in biggest_wins_games.iterrows():
        biggest_wins_list.append({
            "jogo": int(row['JOGO']),
            "adversario": str(row['VISITANTE']),
            "placar": f"{row['GOL COR']} x {row['GOL VIS']}",
            "data": f"{int(row['DIA']):02d}/{int(row['MES']):02d}/{int(row['ANO'])}",
            "campeonato": str(row['CAMPEONATO']),
            "saldo": int(row['saldo'])
        })

    top_performers_data = {
        "players": {
            "top_scorers": top_scorers_list,
            "top_assists": top_assists_list,
            "most_appearances": most_appearances_list,
            "best_win_rates_min_30_games": best_performance_list
        },
        "matches": {
            "highest_attendance": top_attendance_list,
            "highest_revenue": top_revenue_list,
            "biggest_wins": biggest_wins_list
        }
    }

    with open(os.path.join(SRC_DATA_DIR, "top_performers.json"), "w", encoding="utf-8") as f:
        json.dump(top_performers_data, f, ensure_ascii=False, indent=2)

    print("ETL executado com sucesso! Arquivos JSON gerados na pasta './src/data/'.")

if __name__ == "__main__":
    main()
