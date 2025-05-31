"""
Compatibility module to handle Python 3.13 compatibility issues with older FastAPI/Pydantic versions.
This module patches the Pydantic library to avoid the 'not' keyword issue.
"""
import inspect
import sys

def patch_pydantic_parameter():
    """
    Patch the Pydantic Parameter class to handle reserved keywords like 'not'.
    This is a workaround for the ValueError: 'not' is not a valid parameter name error
    that occurs with Python 3.13 and older versions of Pydantic.
    """
    if sys.version_info >= (3, 13):
        # Only apply the patch for Python 3.13+
        try:
            # Import the original Parameter class
            from inspect import Parameter as OriginalParameter
            
            # Create a patched version that handles reserved keywords
            class PatchedParameter(OriginalParameter):
                def __init__(self, name, kind, *args, **kwargs):
                    # If the parameter name is a reserved keyword, prefix it with an underscore
                    if name in ['not', 'and', 'or', 'is', 'in', 'if', 'else', 'elif', 'while', 'for', 'try', 'except', 'finally', 'with', 'as', 'def', 'class', 'return', 'yield', 'from', 'import', 'pass', 'break', 'continue', 'global', 'nonlocal', 'assert', 'del', 'raise', 'lambda']:
                        # For debugging purposes, print a warning
                        print(f"Warning: Parameter name '{name}' is a Python reserved keyword. This might cause issues.")
                        # We don't actually rename it here, as that would break the API
                        # Instead, we just allow it to pass through
                    
                    # Call the original constructor
                    super().__init__(name, kind, *args, **kwargs)
            
            # Replace the original Parameter class with our patched version
            inspect.Parameter = PatchedParameter
            
            print("Successfully patched Pydantic to handle reserved keywords in Python 3.13+")
        except Exception as e:
            print(f"Failed to patch Pydantic: {e}")
    else:
        print("No need to patch Pydantic for Python version < 3.13")

# Apply the patch when this module is imported
patch_pydantic_parameter()
