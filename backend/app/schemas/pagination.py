from typing import Generic, List, TypeVar, Optional
from pydantic import BaseModel

# Define a generic type for the items in the paginated response
T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response schema that can be used with any item type
    """
    total: int
    page: int
    limit: int
    items: List[T]
