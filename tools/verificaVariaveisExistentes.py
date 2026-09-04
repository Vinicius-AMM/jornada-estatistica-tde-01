import os
import sys
import difflib
import pandas as pd

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DIRETORIO_FERRAMENTAS = os.path.dirname(os.path.abspath(__file__))
DIRETORIO_RAIZ = os.path.abspath(os.path.join(DIRETORIO_FERRAMENTAS, ".."))

ARQUIVO_CSV = os.path.join(
    DIRETORIO_RAIZ, "Base de dados", "microdados_censo_escolar_2024_defeso", "dados", "microdados_ed_basica_2024.csv"
)

def carregar_colunas(caminho_arquivo: str):
    """Carrega instantaneamente apenas o cabeçalho do arquivo CSV."""
    if not os.path.exists(caminho_arquivo):
        print(f"ERRO: Arquivo não encontrado em:\n{caminho_arquivo}")
        return []
    df_cabecalho = pd.read_csv(caminho_arquivo, sep=';', encoding='latin1', nrows=0)
    return df_cabecalho.columns.tolist()

def obter_amostra_variavel(caminho_arquivo: str, nome_coluna: str, qtd: int = 5):
    """Obtém uma amostra dos primeiros valores não nulos da variável."""
    try:
        df_amostra = pd.read_csv(
            caminho_arquivo,
            sep=';',
            encoding='latin1',
            usecols=[nome_coluna],
            nrows=500
        )
        valores_validos = df_amostra[nome_coluna].dropna().unique()[:qtd]
        return [x.item() if hasattr(x, 'item') else x for x in valores_validos]
    except Exception:
        return []

def explicar_prefixo(nome_coluna: str):
    """Retorna uma explicação contextual baseada no padrão do INEP."""
    prefixo = nome_coluna.split('_')[0]
    mapa_prefixos = {
        "QT": "Quantitativa Discreta (Contagem / Quantidade de matrículas, turmas, docentes ou infraestrutura)",
        "IN": "Qualitativa Nominal Binária / Dummy (0 = Não, 1 = Sim)",
        "CO": "Qualitativa Nominal (Código identificador numérico)",
        "TP": "Qualitativa Categórica (Tipo / Classificação)",
        "NO": "Qualitativa Nominal (Nome descritivo em texto)",
        "NU": "Identificador Cadastral ou Temporal (Ano, Número predial, Telefone, CNPJ)",
        "DS": "Qualitativa Descritiva (Endereço, Complemento)",
        "DT": "Temporal / Data",
        "SG": "Qualitativa Nominal (Sigla da Unidade Federativa)"
    }
    return mapa_prefixos.get(prefixo, "Outro tipo de variável")

def verificar_variavel(nome_buscado: str, lista_colunas: list, caminho_arquivo: str = None):
    """Verifica se a variável informada existe na lista de colunas."""
    nome_limpo = nome_buscado.strip()
    if not nome_limpo:
        print("Aviso: Nenhum nome de variável foi digitado.")
        return False

    # Dicionário mapeando versão em maiúsculas para o nome original exato
    mapa_colunas = {col.upper(): col for col in lista_colunas}
    busca_upper = nome_limpo.upper()

    print("\n" + "=" * 80)
    print(f"CONSULTA: '{nome_limpo}'")
    print("=" * 80)

    if busca_upper in mapa_colunas:
        nome_exato = mapa_colunas[busca_upper]
        posicao = lista_colunas.index(nome_exato) + 1
        tipo_explicado = explicar_prefixo(nome_exato)

        print(f"[SIM] A variável '{nome_exato}' EXISTE no arquivo!")
        print(f"  • Posição no arquivo: Coluna nº {posicao} de {len(lista_colunas)}")
        print(f"  • Classificação provável: {tipo_explicado}")

        if caminho_arquivo:
            amostra = obter_amostra_variavel(caminho_arquivo, nome_exato)
            if amostra:
                print(f"  • Exemplos de valores encontrados: {amostra}")
        print("=" * 80)
        return True

    # 2. Se não encontrou exatamente, busca por correspondências parciais e similares
    print(f"[NÃO] A variável '{nome_limpo}' NÃO existe no arquivo.")

    # Variáveis que contêm o termo digitado como parte do nome
    contem_termo = [col for col in lista_colunas if busca_upper in col.upper()]

    # Variáveis com escrita parecida (erros de digitação)
    similares = difflib.get_close_matches(busca_upper, lista_colunas, n=5, cutoff=0.6)

    sugestoes = list(dict.fromkeys(contem_termo[:8] + similares[:5]))

    if sugestoes:
        print("\nVocê quis dizer alguma destas variáveis existentes?")
        for s in sugestoes:
            pos = lista_colunas.index(s) + 1
            print(f"   -> {s} (Coluna nº {pos})")
    else:
        print("\nNenhuma variável com nome semelhante foi encontrada.")

    print("=" * 80)
    return False


def modo_interativo():
    print("=" * 80)
    print("LOCALIZADOR E VALIDADOR DE VARIÁVEIS - CENSO ESCOLAR 2024")
    print("=" * 80)
    print("Carregando lista de variáveis do arquivo...")
    colunas = carregar_colunas(ARQUIVO_CSV)
    print(f"Base carregada! Total de {len(colunas)} variáveis disponíveis para consulta.\n")

    # Se foi passado um argumento direto pela linha de comando
    if len(sys.argv) > 1:
        variavel_arg = " ".join(sys.argv[1:])
        verificar_variavel(variavel_arg, colunas, ARQUIVO_CSV)
        return

    # Modo interativo contínuo
    print("Digite o nome da variável desejada (Ex: NU_ANO_CENSO, CO_ENTIDADE, QT_MAT_BAS).")
    print("Para encerrar, digite 'sair' ou pressione Enter em branco.\n")

    while True:
        try:
            termo = input("Consultar variável: ").strip()
            if not termo or termo.lower() in ["sair", "exit", "quit"]:
                print("\nConsulta finalizada.")
                break
            verificar_variavel(termo, colunas, ARQUIVO_CSV)
            print()
        except (KeyboardInterrupt, EOFError):
            print("\nConsulta finalizada.")
            break


if __name__ == "__main__":
    modo_interativo()
