import os
import sys
import pandas as pd

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DIRETORIO_FERRAMENTAS = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_RAIZ = os.path.abspath(os.path.join(DIRETORIO_FERRAMENTAS, ".."))

# Caminho do arquivo analisado
ARQUIVO_CSV = os.path.join(
    DIRETORIO_RAIZ, "Base de dados", "microdados_censo_escolar_2024_defeso", "dados", "microdados_ed_basica_2024.csv"
)

def contar_colunas_variaveis(caminho_arquivo: str):
    """
    Prioridade 2: Descobrir quantas colunas/variáveis existem no arquivo de microdados.
    """
    print("=" * 80)
    print("PRIORIDADE 2: CONTAGEM TOTAL DE COLUNAS / VARIÁVEIS")
    print("=" * 80)
    
    if not os.path.exists(caminho_arquivo):
        print(f"ERRO: Arquivo não encontrado em:\n{caminho_arquivo}")
        return

    nome_arquivo = os.path.basename(caminho_arquivo)
    print(f"Arquivo analisado: {nome_arquivo}")
    print(f"Caminho completo: {caminho_arquivo}\n")

    # Lê apenas o cabeçalho para obter a lista exata e instantânea de colunas
    df_cabecalho = pd.read_csv(caminho_arquivo, sep=';', encoding='latin1', nrows=0)
    colunas = df_cabecalho.columns.tolist()
    total_variaveis = len(colunas)

    print("-" * 80)
    print(f"[RESULTADO] O arquivo contém exatamente {total_variaveis} colunas/variáveis.")
    print("-" * 80)

    # Distribuição das variáveis por prefixo técnico (Padrão INEP)
    prefixos = {}
    for col in colunas:
        p = col.split('_')[0]
        prefixos[p] = prefixos.get(p, 0) + 1

    df_prefixos = pd.DataFrame([
        {"Prefixo": p, "Quantidade": q, "Percentual (%)": f"{(q / total_variaveis) * 100:.2f}%"}
        for p, q in sorted(prefixos.items(), key=lambda x: x[1], reverse=True)
    ])

    print("\nDistribuição das variáveis por prefixo oficial do INEP:")
    print(df_prefixos.to_string(index=False))

    print("\nPrimeiras 10 variáveis do arquivo:")
    for i, col in enumerate(colunas[:10], start=1):
        print(f"  {i:2d}. {col}")

    print("\nÚltimas 10 variáveis do arquivo:")
    for i, col in enumerate(colunas[-10:], start=total_variaveis - 9):
        print(f"  {i:2d}. {col}")
    print("=" * 80)

    return total_variaveis, colunas


if __name__ == "__main__":
    contar_colunas_variaveis(ARQUIVO_CSV)
