import os
import sys
import socket
import webbrowser
from http.server import SimpleHTTPRequestHandler, HTTPServer
import functools

# Configuração de encoding para o terminal Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))
PASTA_DASHBOARD = os.path.join(DIRETORIO_ATUAL, "Dashboard")
ARQUIVO_JSON = os.path.join(PASTA_DASHBOARD, "dados_dashboard.json")
ARQUIVO_JS = os.path.join(PASTA_DASHBOARD, "dados_dashboard.js")

def verificar_ou_gerar_dados():
    """Garante que a base consolidada de dados exista antes de subir o servidor."""
    if not os.path.exists(ARQUIVO_JSON) or not os.path.exists(ARQUIVO_JS):
        print("-> Base de dados da dashboard não encontrada ou incompleta. Gerando agora...")
        caminho_gerador = os.path.join(DIRETORIO_ATUAL, "Ferramentas", "dados_painel.py")
        if os.path.exists(caminho_gerador):
            import subprocess
            subprocess.run([sys.executable, caminho_gerador], check=True)
        else:
            print(f"Aviso: Gerador não encontrado em {caminho_gerador}")

def encontrar_porta_livre(porta_inicial=8000, max_tentativas=20):
    """Encontra uma porta TCP livre a partir da porta inicial."""
    for p in range(porta_inicial, porta_inicial + max_tentativas):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', p)) != 0:
                return p
    return porta_inicial

def iniciar_servidor():
    verificar_ou_gerar_dados()

    porta = encontrar_porta_livre(8000)
    url = f"http://localhost:{porta}"

    handler = functools.partial(SimpleHTTPRequestHandler, directory=PASTA_DASHBOARD)
    
    print("=" * 70)
    print("      DASHBOARD DE ESTATÍSTICA - CENSO ESCOLAR 2024 (LOCAL)")
    print("=" * 70)
    print(f"\n[OK] Servidor local iniciado com sucesso!")
    print(f"     Acesse no navegador: {url}")
    print(f"     Pasta servida: {PASTA_DASHBOARD}")
    print("\nPressione CTRL + C no terminal para encerrar o servidor a qualquer momento.\n")
    print("-" * 70)

    # Abre o navegador padrão do sistema operacional
    webbrowser.open(url)

    try:
        with HTTPServer(('127.0.0.1', porta), handler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Servidor da Dashboard finalizado.")

if __name__ == "__main__":
    iniciar_servidor()
