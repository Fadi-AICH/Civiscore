import uuid
from sqlalchemy.types import TypeDecorator, CHAR

class UUID(TypeDecorator):
    """Platform-independent UUID type.
    
    Uses CHAR(36) for MySQL, storing as a string.
    """
    impl = CHAR
    cache_ok = True

    def __init__(self, *args, **kwargs):
        # Ignorer as_uuid et autres arguments spécifiques à PostgreSQL
        if 'as_uuid' in kwargs:
            del kwargs['as_uuid']
        # Éviter le double passage du paramètre length
        kwargs['length'] = 36
        super(UUID, self).__init__(*args, **kwargs)

    def load_dialect_impl(self, dialect):
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif isinstance(value, uuid.UUID):
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            try:
                value = uuid.UUID(value)
            except (TypeError, ValueError):
                return value
        return value
