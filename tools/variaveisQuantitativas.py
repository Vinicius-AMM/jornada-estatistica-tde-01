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

ARQUIVO_CSV = os.path.join(
    DIRETORIO_RAIZ, "Base de dados", "microdados_censo_escolar_2024_defeso", "dados", "microdados_ed_basica_2024.csv"
)

def identificar_variaveis_quantitativas(caminho_arquivo: str):
    """
    Prioridade 3: Descobrir quantas dessas variáveis são quantitativas,
    distinguindo-as das variáveis qualitativas/categóricas.
    """
    print("=" * 80)
    print("PRIORIDADE 3: IDENTIFICAÇÃO DE VARIÁVEIS QUANTITATIVAS")
    print("=" * 80)

    if not os.path.exists(caminho_arquivo):
        print(f"ERRO: Arquivo não encontrado em:\n{caminho_arquivo}")
        return

    nome_arquivo = os.path.basename(caminho_arquivo)
    print(f"Arquivo analisado: {nome_arquivo}")
    print(f"Caminho completo: {caminho_arquivo}\n")

    # Lê apenas o cabeçalho
    df_cabecalho = pd.read_csv(caminho_arquivo, sep=';', encoding='latin1', nrows=0)
    colunas = df_cabecalho.columns.tolist()
    total_colunas = len(colunas)

    # 1. Variáveis com prefixo QT_ (Quantidades / Contagens discretas)
    variaveis_qt = [c for c in colunas if c.startswith("QT_")]

    # 2. Outras variáveis que podem ter conotação quantitativa temporal (ex: NU_ANO_CENSO)
    # Nota estatística: telefones, DDDs e CNPJs são identificadores cadastrais, não quantitativos.
    variavel_ano = ["NU_ANO_CENSO"] if "NU_ANO_CENSO" in colunas else []

    # Demais categorias (qualitativas/categóricas/identificadores)
    variaveis_in = [c for c in colunas if c.startswith("IN_")]   # Dummies/Binárias (0 ou 1)
    variaveis_co = [c for c in colunas if c.startswith("CO_")]   # Códigos de identificação
    variaveis_tp = [c for c in colunas if c.startswith("TP_")]   # Categorias/Tipos
    variaveis_no = [c for c in colunas if c.startswith("NO_")]   # Nomes
    variaveis_nu_cadastrais = [c for c in colunas if c.startswith("NU_") and c != "NU_ANO_CENSO"]
    variaveis_ds = [c for c in colunas if c.startswith("DS_")]   # Descrições textuais
    variaveis_dt = [c for c in colunas if c.startswith("DT_")]   # Datas
    variaveis_sg = [c for c in colunas if c.startswith("SG_")]   # Sigla

    print("-" * 80)
    print("CLASSIFICAÇÃO ESTATÍSTICA DAS VARIÁVEIS DO CENSO ESCOLAR 2024:")
    print("-" * 80)
    print(f"Total geral de variáveis no arquivo: {total_colunas}")
    print(f" -> Variáveis Quantitativas de Contagem (prefixo 'QT_'): {len(variaveis_qt)} ({(len(variaveis_qt)/total_colunas)*100:.2f}%)")
    print(f" -> Variável Quantitativa Temporal de Ano (NU_ANO_CENSO): {len(variavel_ano)}")
    print(f"\n[TOTAL DE VARIÁVEIS QUANTITATIVAS]:")
    print(f"   • {len(variaveis_qt)} variáveis quantitativas discretas de contagem (matrículas, docentes, turmas, salas, equipamentos).")
    print(f"   • Ou {len(variaveis_qt) + len(variavel_ano)} variáveis se for computado o ano de referência (NU_ANO_CENSO).")
    print("-" * 80)

    print("\nRESUMO DA NATUREZA DOS DADOS:")
    tabela_classificacao = pd.DataFrame([
        {
            "Tipo Estatístico": "Quantitativa Discreta",
            "Prefixo": "QT_",
            "Qtd": len(variaveis_qt),
            "Exemplos": "QT_MAT_BAS, QT_DOC_BAS, QT_TUR_BAS, QT_SALAS_UTILIZADAS"
        },
        {
            "Tipo Estatístico": "Quantitativa Temporal / Ano",
            "Prefixo": "NU_",
            "Qtd": len(variavel_ano),
            "Exemplos": "NU_ANO_CENSO (Ano 2024)"
        },
        {
            "Tipo Estatístico": "Qualitativa Nominal Binária (Dummy)",
            "Prefixo": "IN_",
            "Qtd": len(variaveis_in),
            "Exemplos": "IN_AGUA_POTAVEL, IN_ENERGIA_INEXISTENTE, IN_INTERNET (0 ou 1)"
        },
        {
            "Tipo Estatístico": "Qualitativa Nominal (Códigos)",
            "Prefixo": "CO_",
            "Qtd": len(variaveis_co),
            "Exemplos": "CO_ENTIDADE, CO_MUNICIPIO, CO_UF"
        },
        {
            "Tipo Estatístico": "Qualitativa (Tipo / Categoria)",
            "Prefixo": "TP_",
            "Qtd": len(variaveis_tp),
            "Exemplos": "TP_DEPENDENCIA, TP_LOCALIZACAO, TP_SITUACAO_FUNCIONAMENTO"
        },
        {
            "Tipo Estatístico": "Qualitativa Nominal (Texto / Nome)",
            "Prefixo": "NO_",
            "Qtd": len(variaveis_no),
            "Exemplos": "NO_ENTIDADE, NO_MUNICIPIO, NO_UF"
        },
        {
            "Tipo Estatístico": "Identificador Cadastral Numérico",
            "Prefixo": "NU_",
            "Qtd": len(variaveis_nu_cadastrais),
            "Exemplos": "NU_TELEFONE, NU_DDD, NU_CNPJ_ESCOLA_PRIVADA"
        },
        {
            "Tipo Estatístico": "Qualitativa / Outras",
            "Prefixo": "DS_, DT_, SG_",
            "Qtd": len(variaveis_ds) + len(variaveis_dt) + len(variaveis_sg),
            "Exemplos": "DS_ENDERECO, DT_ANO_LETIVO_INICIO, SG_UF"
        }
    ])
    print(tabela_classificacao.to_string(index=False))

    print("\nExemplos de Variáveis Quantitativas presentes no arquivo (Top 15):")
    for i, c in enumerate(variaveis_qt[:15], start=1):
        print(f"  {i:2d}. {c}")

    print("\n" + "=" * 80)
    print(f"CONCLUSÃO: O arquivo possui {len(variaveis_qt)} variáveis estritamente quantitativas (prefixo QT_).")
    print("=" * 80)

    return variaveis_qt


if __name__ == "__main__":
    identificar_variaveis_quantitativas(ARQUIVO_CSV)
