@echo off
chcp 65001 > nul
title Dashboard Estatistica - Censo Escolar 2024
echo ========================================================
echo   Iniciando Dashboard Local de Estatistica...
echo ========================================================
python "%~dp0executar_dashboard.py"
pause