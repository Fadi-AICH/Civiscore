from fastapi.testclient import TestClient
import uuid
from app.main import app
from app.database import SessionLocal
from app.models.service import Service
from app.models.country import Country

# Créer un client de test
client = TestClient(app)

# Fonction pour vérifier les services existants
def check_services():
    # Tester l'API
    response = client.get("/api/v1/services/")
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        services = response.json()
        print(f"Nombre de services retournés par l'API: {len(services)}")
        
        if len(services) == 0:
            print("Aucun service trouvé, ajout de services de test...")
            add_test_services()
            
            # Vérifier à nouveau
            response = client.get("/api/v1/services/")
            services = response.json()
            print(f"Nombre de services après ajout: {len(services)}")
    else:
        print(f"Erreur API: {response.text}")

# Fonction pour ajouter des services de test
def add_test_services():
    db = SessionLocal()
    
    # Vérifier si nous avons des pays
    countries = db.query(Country).all()
    if not countries:
        print("Ajout d'un pays de test...")
        france = Country(
            id=uuid.uuid4(),
            name="France",
            code="FR",
            region="Europe"
        )
        db.add(france)
        db.commit()
        countries = [france]
    
    # Récupérer le premier pays pour l'utiliser comme pays_id
    country_id = countries[0].id
    
    # Catégories de services
    categories = ["Healthcare", "Education", "Transportation", "Utilities", "Government"]
    
    # Ajouter 5 services de test
    print("Ajout de services de test...")
    for i, category in enumerate(categories):
        service = Service(
            id=uuid.uuid4(),
            name=f"Service {category} {i+1}",
            category=category,
            country_id=country_id,
            rating=4.0
        )
        db.add(service)
    
    # Valider les changements
    db.commit()
    
    # Vérifier le nombre de services
    service_count = db.query(Service).count()
    print(f"Nombre total de services dans la base de données: {service_count}")
    
    # Fermer la session
    db.close()

if __name__ == "__main__":
    check_services()
