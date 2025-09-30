"""
List all registered routes in the FastAPI app
"""
from app.main import app

print("\n" + "=" * 60)
print("REGISTERED ROUTES")
print("=" * 60)

for route in app.routes:
    if hasattr(route, 'methods'):
        methods = ', '.join(route.methods)
        print(f"{methods:10} {route.path}")
    else:
        print(f"{'':10} {route.path}")

print("=" * 60)

