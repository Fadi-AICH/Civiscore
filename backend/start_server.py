"""
Script de démarrage pour l'application Civiscore.
Ce script applique les correctifs de compatibilité pour Python 3.13 avant de lancer l'application.
"""
import os
import sys
import inspect

# Patch pour le problème du mot-clé réservé 'not' dans Pydantic avec Python 3.13
def patch_parameter():
    if sys.version_info >= (3, 13):
        print("Applying compatibility patch for Python 3.13+...")
        
        # Sauvegarde de la classe Parameter originale
        original_parameter = inspect.Parameter
        
        # Création d'une classe Parameter modifiée qui accepte les mots-clés réservés
        class PatchedParameter(original_parameter):
            def __init__(self, name, kind, *args, **kwargs):
                # Autoriser le mot-clé 'not' et autres mots-clés réservés
                try:
                    super().__init__(name, kind, *args, **kwargs)
                except ValueError as e:
                    if "'not' is not a valid parameter name" in str(e) or any(f"'{kw}' is not a valid parameter name" in str(e) for kw in ['and', 'or', 'is']):
                        print(f"Warning: Allowing reserved keyword '{name}' as parameter name")
                        # Créer manuellement l'objet en contournant la validation
                        self._name = name
                        self._kind = kind
                        self._default = kwargs.get('default', inspect._empty)
                        self._annotation = kwargs.get('annotation', inspect._empty)
                    else:
                        raise
        
        # Remplacer la classe Parameter originale par notre version modifiée
        inspect.Parameter = PatchedParameter
        print("Patch applied successfully!")

# Appliquer le patch
patch_parameter()

# Lancer l'application
if __name__ == "__main__":
    print("Starting Civiscore API server...")
    os.system("uvicorn app.main:app --reload")
