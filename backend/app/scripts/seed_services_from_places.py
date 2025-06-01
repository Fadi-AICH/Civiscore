#!/usr/bin/env python3
"""
Script pour importer des services depuis Google Places API et les ajouter à la base de données.
Utilisation : python -m app.scripts.seed_services_from_places [--country_code MA] [--limit 20]
"""

import argparse
import sys
import os
from typing import List, Dict, Any
from uuid import UUID

# Ajouter le répertoire parent au path pour permettre l'import des modules app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.google_places import GooglePlacesService
from app.crud.crud_country import get_country_by_code
from app.crud.crud_service import create_service, get_service_by_name_and_address
from app.schemas.service import ServiceCreate


# Lieux d'intérêt par pays
PLACES_OF_INTEREST = {
    "MA": [  # Maroc
        {"query": "préfecture casablanca", "type": "local_government_office"},
        {"query": "ministère rabat", "type": "local_government_office"},
        {"query": "tribunal casablanca", "type": "courthouse"},
        {"query": "commissariat police casablanca", "type": "police"},
        {"query": "hôpital public casablanca", "type": "hospital"},
        {"query": "université casablanca", "type": "university"},
        {"query": "école publique casablanca", "type": "school"},
        {"query": "poste maroc casablanca", "type": "post_office"},
        {"query": "trésorerie générale rabat", "type": "local_government_office"},
        {"query": "mairie casablanca", "type": "city_hall"}
    ],
    "FR": [  # France
        {"query": "préfecture paris", "type": "local_government_office"},
        {"query": "mairie paris", "type": "city_hall"},
        {"query": "tribunal paris", "type": "courthouse"},
        {"query": "commissariat police paris", "type": "police"},
        {"query": "hôpital public paris", "type": "hospital"},
        {"query": "université paris", "type": "university"},
        {"query": "école publique paris", "type": "school"},
        {"query": "la poste paris", "type": "post_office"},
        {"query": "trésor public paris", "type": "local_government_office"},
        {"query": "caf paris", "type": "local_government_office"}
    ],
    "US": [  # États-Unis
        {"query": "city hall new york", "type": "city_hall"},
        {"query": "courthouse new york", "type": "courthouse"},
        {"query": "police department new york", "type": "police"},
        {"query": "public hospital new york", "type": "hospital"},
        {"query": "public university new york", "type": "university"},
        {"query": "public school new york", "type": "school"},
        {"query": "post office new york", "type": "post_office"},
        {"query": "irs office new york", "type": "local_government_office"},
        {"query": "dmv new york", "type": "local_government_office"},
        {"query": "social security office new york", "type": "local_government_office"}
    ]
}


def get_country_id(db: Session, country_code: str) -> UUID:
    """Récupère l'ID du pays par son code."""
    country = get_country_by_code(db, country_code)
    if not country:
        print(f"Pays avec le code {country_code} non trouvé. Veuillez créer ce pays d'abord.")
        sys.exit(1)
    return country.id


def import_services(db: Session, places_service: GooglePlacesService, 
                   country_code: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Importe des services depuis Google Places API et les ajoute à la base de données.
    
    Args:
        db: Session de base de données
        places_service: Service Google Places
        country_code: Code du pays (ex: MA, FR, US)
        limit: Nombre maximum de services à importer
        
    Returns:
        Liste des services importés
    """
    if country_code not in PLACES_OF_INTEREST:
        print(f"Aucune liste de lieux d'intérêt définie pour le pays {country_code}")
        return []
    
    country_id = get_country_id(db, country_code)
    imported_services = []
    count = 0
    
    for place_info in PLACES_OF_INTEREST[country_code]:
        if count >= limit:
            break
            
        query = place_info["query"]
        type_ = place_info["type"]
        
        print(f"Recherche de services pour: {query} (type: {type_})")
        search_results = places_service.search_places(query=query, type_=type_)
        
        if search_results.get("status") != "OK" or not search_results.get("results"):
            print(f"Aucun résultat trouvé pour {query}")
            continue
        
        # Limiter le nombre de résultats par requête
        results_to_process = search_results["results"][:min(5, limit - count)]
        
        for place in results_to_process:
            place_id = place.get("place_id")
            
            # Récupérer les détails complets du lieu
            details = places_service.get_place_details(place_id)
            
            if details.get("status") != "OK" or not details.get("result"):
                continue
                
            place_details = details["result"]
            
            # Vérifier si le service existe déjà
            name = place_details.get("name", "")
            address = place_details.get("formatted_address", "")
            
            existing_service = get_service_by_name_and_address(db, name, address)
            if existing_service:
                print(f"Service déjà existant: {name} ({address})")
                continue
                
            # Déterminer la catégorie
            category = "Autres"
            if "types" in place_details:
                category = places_service._map_google_type_to_category(place_details["types"])
                
            # Créer le service
            try:
                service_data = {
                    "name": name,
                    "country_id": country_id,
                    "category": category,
                    "address": address,
                    "phone": place_details.get("formatted_phone_number"),
                    "website": place_details.get("website"),
                    "latitude": place_details.get("geometry", {}).get("location", {}).get("lat"),
                    "longitude": place_details.get("geometry", {}).get("location", {}).get("lng")
                }
                
                # Ajouter les heures d'ouverture si disponibles
                if "opening_hours" in place_details and "weekday_text" in place_details["opening_hours"]:
                    service_data["opening_hours"] = ", ".join(place_details["opening_hours"]["weekday_text"])
                
                service_create = ServiceCreate(**service_data)
                service = create_service(db=db, service=service_create)
                
                imported_services.append({
                    "id": str(service.id),
                    "name": service.name,
                    "category": service.category,
                    "address": service.address
                })
                
                print(f"Service importé: {service.name} ({service.category})")
                count += 1
                
            except Exception as e:
                print(f"Erreur lors de l'importation du service {name}: {str(e)}")
                continue
                
    print(f"\nImportation terminée. {count} services importés.")
    return imported_services


def main():
    """Fonction principale du script."""
    parser = argparse.ArgumentParser(description="Importer des services depuis Google Places API")
    parser.add_argument("--country_code", type=str, default="MA", 
                        help="Code du pays (ex: MA, FR, US)")
    parser.add_argument("--limit", type=int, default=20, 
                        help="Nombre maximum de services à importer")
    args = parser.parse_args()
    
    places_service = GooglePlacesService()
    db = SessionLocal()
    
    try:
        imported_services = import_services(
            db=db, 
            places_service=places_service,
            country_code=args.country_code,
            limit=args.limit
        )
        
        print(f"\nRésumé des services importés:")
        for i, service in enumerate(imported_services, 1):
            print(f"{i}. {service['name']} - {service['category']} - {service['address']}")
            
    finally:
        db.close()


if __name__ == "__main__":
    main()
