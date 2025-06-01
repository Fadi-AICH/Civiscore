from typing import Any, List, Optional, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.crud.crud_service import get_services, get_service_by_id, create_service, update_service, delete_service
from app.models.user import User
from app.schemas.service import ServiceOut, ServiceWithCountry, ServiceCreate, ServiceUpdate
from app.services.google_places import GooglePlacesService

router = APIRouter()

# Initialiser le service Google Places
places_service = GooglePlacesService()


@router.post("/", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service_route(
    service_in: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a new service (requires authentication)
    """
    try:
        # Create new service
        service = create_service(db=db, service=service_in)
        return service
    except Exception as e:
        # Log the error for debugging
        print(f"Error creating service: {str(e)}")
        # Return a generic error message to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the service. Please try again later."
        )


@router.get("/", response_model=List[ServiceOut])
def read_services(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    include_country: bool = False,
) -> Any:
    """
    Retrieve services with optional pagination and country details
    """
    services = get_services(
        db=db,
        skip=skip,
        limit=limit,
        include_country=include_country
    )
    
    return services


@router.get("/{service_id}", response_model=ServiceWithCountry)
def read_service(
    service_id: UUID,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get service by ID with country details
    """
    service = get_service_by_id(db=db, service_id=service_id, include_country=True)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service


@router.put("/{service_id}", response_model=ServiceOut)
def update_service_route(
    service_id: UUID,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a service by ID (requires authentication)
    """
    # First check if service exists
    service = get_service_by_id(db=db, service_id=service_id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    try:
        # Update service
        updated_service = update_service(db=db, service_id=service_id, service_update=service_update)
        return updated_service
    except Exception as e:
        # Log the error for debugging
        print(f"Error updating service: {str(e)}")
        # Return a generic error message to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the service. Please try again later."
        )


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_route(
    service_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Delete a service by ID (requires authentication)
    """
    try:
        # Delete service
        deleted = delete_service(db=db, service_id=service_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found"
            )
        # Pour 204 No Content, on ne retourne rien
        return None
    except Exception as e:
        # Log the error for debugging
        print(f"Error deleting service: {str(e)}")
        # Return a generic error message to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the service. Please try again later."
        )


@router.post("/{service_id}/enrich", response_model=ServiceOut)
def enrich_service_data(
    service_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Enrichit les données d'un service avec Google Places API
    """
    # Récupérer le service
    service = get_service_by_id(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    try:
        # Convertir en dictionnaire pour l'enrichissement
        service_data = {
            "id": str(service.id),
            "name": service.name,
            "address": service.address,
            "category": service.category
        }
        
        # Enrichir avec Google Places
        enriched_data = places_service.enrich_service(service_data)
        
        # Mettre à jour le service avec les données enrichies
        if enriched_data:
            for key, value in enriched_data.items():
                if value and hasattr(service, key):
                    setattr(service, key, value)
            
            db.commit()
            db.refresh(service)
        
        return service
    except Exception as e:
        # Log the error for debugging
        print(f"Error enriching service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while enriching the service data."
        )


@router.get("/nearby", response_model=List[Dict[str, Any]])
def find_nearby_services(
    latitude: float,
    longitude: float,
    radius: int = 5000,
    type_: str = "government",
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Trouve des services à proximité d'une localisation
    """
    try:
        services = places_service.find_nearby_services(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            type_=type_
        )
        return services
    except Exception as e:
        # Log the error for debugging
        print(f"Error finding nearby services: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while searching for nearby services."
        )


@router.post("/import-from-places", response_model=ServiceOut)
def import_service_from_places(
    place_id: str,
    country_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Importe un service depuis Google Places en utilisant son place_id
    """
    try:
        # Récupérer les détails du lieu
        details = places_service.get_place_details(place_id)
        
        if details.get("status") != "OK" or not details.get("result"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Place not found or invalid place_id"
            )
        
        place = details["result"]
        
        # Déterminer la catégorie
        category = "Autres"
        if "types" in place:
            category = places_service._map_google_type_to_category(place["types"])
        
        # Créer le service
        service_data = ServiceCreate(
            name=place.get("name"),
            country_id=country_id,
            category=category,
            address=place.get("formatted_address"),
            phone=place.get("formatted_phone_number"),
            website=place.get("website"),
            latitude=place.get("geometry", {}).get("location", {}).get("lat"),
            longitude=place.get("geometry", {}).get("location", {}).get("lng")
        )
        
        # Ajouter les heures d'ouverture si disponibles
        if "opening_hours" in place and "weekday_text" in place["opening_hours"]:
            service_data.opening_hours = ", ".join(place["opening_hours"]["weekday_text"])
        
        # Créer le service dans la base de données
        service = create_service(db=db, service=service_data)
        return service
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        print(f"Error importing service from Places: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while importing the service from Google Places."
        )
