"""
Check if bank_details table exists and has data
"""
from app.core.database import engine
from sqlalchemy import inspect, text

inspector = inspect(engine)
tables = inspector.get_table_names()

print("All tables in database:")
for table in sorted(tables):
    print(f"  - {table}")

print(f"\nbank_details exists: {'bank_details' in tables}")

if 'bank_details' in tables:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT COUNT(*) FROM bank_details'))
        count = result.scalar()
        print(f"Rows in bank_details: {count}")

