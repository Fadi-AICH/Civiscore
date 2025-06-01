import requests
from typing import Dict, Any, Optional, List
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class GooglePlacesService:
    """Service pour interagir avec l'API Google Places"""
    
    def __init__(self):
        self.api_key = settings.GOOGLE_PLACES_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api/place"
    
    def search_places(self, query: str, location: Optional[str] = None, 
                     radius: Optional[int] = None, type_: Optional[str] = None) -> Dict[str, Any]:
        """
        Recherche des lieux avec l'API Places
        
        Args:
            query: Terme de recherche
            location: Coordonnées au format "latitude,longitude"
            radius: Rayon de recherche en mètres
            type_: Type de lieu (ex: government, local_government_office)
            
        Returns:
            Résultats de la recherche
        """
        endpoint = f"{self.base_url}/textsearch/json"
        params = {
            "query": query,
            "key": self.api_key
        }
        
        if location and radius:
            params["location"] = location
            params["radius"] = radius
        
        if type_:
            params["type"] = type_
            
        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Erreur lors de la recherche Places: {str(e)}")
            return {"status": "ERROR", "error_message": str(e)}
    
    def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """
        Obtient les détails d'un lieu spécifique
        
        Args:
            place_id: ID unique du lieu dans Google Places
            
        Returns:
            Détails du lieu
        """
        endpoint = f"{self.base_url}/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,formatted_address,formatted_phone_number,website,opening_hours,geometry,types",
            "key": self.api_key
        }
        
        try:
            response = requests.get(endpoint, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Erreur lors de la récupération des détails du lieu: {str(e)}")
            return {"status": "ERROR", "error_message": str(e)}
    
    def enrich_service(self, service_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrichit les données d'un service avec l'API Places
        
        Args:
            service_data: Données du service à enrichir
            
        Returns:
            Données enrichies
        """
        # Recherche par nom et adresse
        query = f"{service_data['name']} {service_data.get('address', '')}"
        search_results = self.search_places(query)
        
        if search_results.get("status") == "OK" and search_results.get("results"):
            place_id = search_results["results"][0]["place_id"]
            details = self.get_place_details(place_id)
            
            if details.get("status") == "OK" and details.get("result"):
                place = details["result"]
                
                # Enrichir les données du service
                enriched_data = {
                    "address": place.get("formatted_address", service_data.get("address")),
                    "phone": place.get("formatted_phone_number", service_data.get("phone")),
                    "website": place.get("website", service_data.get("website")),
                    "latitude": place.get("geometry", {}).get("location", {}).get("lat"),
                    "longitude": place.get("geometry", {}).get("location", {}).get("lng")
                }
                
                # Heures d'ouverture si disponibles
                if "opening_hours" in place:
                    opening_hours = place["opening_hours"].get("weekday_text", [])
                    enriched_data["opening_hours"] = ", ".join(opening_hours)
                
                # Déterminer la catégorie basée sur les types Google
                if "types" in place and not service_data.get("category"):
                    enriched_data["category"] = self._map_google_type_to_category(place["types"])
                
                return enriched_data
        
        return {}
    
    def _map_google_type_to_category(self, types: List[str]) -> str:
        """
        Mappe les types Google Places aux catégories Civiscore
        
        Args:
            types: Liste des types Google Places
            
        Returns:
            Catégorie Civiscore correspondante
        """
        category_mapping = {
            "local_government_office": "Administration",
            "post_office": "Administration",
            "city_hall": "Administration",
            "courthouse": "Justice",
            "police": "Sécurité",
            "fire_station": "Sécurité",
            "hospital": "Santé",
            "doctor": "Santé",
            "school": "Éducation",
            "university": "Éducation",
            "library": "Éducation",
            "bank": "Finances",
            "accounting": "Finances",
            "tax": "Finances"
        }
        
        for type_ in types:
            if type_ in category_mapping:
                return category_mapping[type_]
        
        # Catégorie par défaut
        return "Autres"
    
    def find_nearby_services(self, latitude: float, longitude: float, radius: int = 5000, 
                           type_: str = "government") -> List[Dict[str, Any]]:
        """
        Trouve des services à proximité d'une localisation
        
        Args:
            latitude: Latitude
            longitude: Longitude
            radius: Rayon de recherche en mètres
            type_: Type de lieu à rechercher
            
        Returns:
            Liste des services trouvés
        """
        location = f"{latitude},{longitude}"
        results = self.search_places("", location=location, radius=radius, type_=type_)
        
        services = []
        if results.get("status") == "OK" and results.get("results"):
            for place in results["results"]:
                service = {
                    "name": place.get("name"),
                    "address": place.get("formatted_address"),
                    "place_id": place.get("place_id"),
                    "latitude": place.get("geometry", {}).get("location", {}).get("lat"),
                    "longitude": place.get("geometry", {}).get("location", {}).get("lng"),
                    "rating": place.get("rating")
                }
                services.append(service)
        
        return services
