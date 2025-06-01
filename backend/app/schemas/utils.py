from uuid import UUID as PythonUUID
from pydantic import field_serializer, field_validator
from typing import Any, Optional


class UUIDType:
    """
    Classe utilitaire pour gérer les UUIDs dans les schémas Pydantic.
    Permet de convertir les chaînes UUID en objets UUID et vice versa.
    """
    @field_serializer
    def serialize_uuid(self, value: Any) -> str:
        if value is None:
            return None
        if isinstance(value, str):
            return value
        return str(value)
    
    @field_validator('*', mode='before')
    def validate_uuid(cls, value: Any) -> Any:
        if value is None or isinstance(value, PythonUUID):
            return value
        if isinstance(value, str):
            try:
                return PythonUUID(value)
            except ValueError:
                pass
        return value
