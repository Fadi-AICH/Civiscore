import uuid
from app.database import SessionLocal
from app.models.service import Service
from app.models.country import Country

# Créer une session de base de données
db = SessionLocal()

# Vérifier si nous avons des pays
countries = db.query(Country).all()
if not countries:
    print("Ajout d'un pays de test...")
    france = Country(
        id=uuid.uuid4(),
        name="France",
        code="FR",
        region="Europe",
        population=67000000
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
print(f"Nombre total de services: {service_count}")

# Fermer la session
db.close()
print("Services de test ajoutés avec succès!")
