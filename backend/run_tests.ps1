# Script PowerShell pour exécuter automatiquement les tests HTTP
Write-Host "Démarrage des tests API Civiscore..." -ForegroundColor Green

# Vérifier si le serveur est en cours d'exécution
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/ping" -Method GET -ErrorAction Stop
    Write-Host "Serveur FastAPI en cours d'exécution." -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Le serveur FastAPI n'est pas en cours d'exécution. Veuillez démarrer le serveur avec 'uvicorn app.main:app --reload'" -ForegroundColor Red
    exit 1
}

# Utiliser VS Code pour exécuter les requêtes
Write-Host "Exécution des tests API avec VS Code REST Client..." -ForegroundColor Yellow
Write-Host "Veuillez ouvrir VS Code, naviguer vers le fichier test.http, et utiliser l'option 'Run All Requests' du menu contextuel." -ForegroundColor Yellow

# Instructions pour l'exécution manuelle
Write-Host @"

INSTRUCTIONS POUR L'EXÉCUTION MANUELLE DES TESTS:
1. Ouvrez VS Code
2. Ouvrez le fichier test.http
3. Cliquez avec le bouton droit dans le fichier
4. Sélectionnez 'Run All Requests' dans le menu contextuel

Vous pouvez également exécuter les requêtes une par une en cliquant sur 'Send Request' au-dessus de chaque requête.
"@ -ForegroundColor Cyan

Write-Host "Fin du script." -ForegroundColor Green
