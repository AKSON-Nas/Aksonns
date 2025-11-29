#!/usr/bin/env python3
"""
Script to initialize default plans in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid

async def init_plans():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if plans already exist
    existing_plans = await db.plans.count_documents({})
    if existing_plans > 0:
        print(f"✅ Plans already exist ({existing_plans} plans found)")
        return
    
    # Define default plans
    plans = [
        {
            "id": str(uuid.uuid4()),
            "name": "free",
            "display_name": "Gratuito",
            "price": 0.0,
            "features": [
                {"name": "guide", "enabled": True},
                {"name": "budgets", "enabled": False},
                {"name": "stock", "enabled": False},
                {"name": "sales", "enabled": False},
                {"name": "clients", "enabled": False},
                {"name": "products", "enabled": False},
                {"name": "suppliers", "enabled": False},
                {"name": "employees", "enabled": False},
                {"name": "analytics", "enabled": False},
                {"name": "pdf_export", "enabled": False}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "premium",
            "display_name": "Premium",
            "price": 49.90,
            "features": [
                {"name": "guide", "enabled": True},
                {"name": "budgets", "enabled": True},
                {"name": "stock", "enabled": True},
                {"name": "sales", "enabled": True},
                {"name": "clients", "enabled": True},
                {"name": "products", "enabled": True},
                {"name": "suppliers", "enabled": True},
                {"name": "employees", "enabled": True},
                {"name": "analytics", "enabled": True},
                {"name": "pdf_export", "enabled": True}
            ],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert plans
    result = await db.plans.insert_many(plans)
    print(f"✅ {len(result.inserted_ids)} plans created successfully!")
    
    # List created plans
    for plan in plans:
        print(f"   - {plan['display_name']} (R$ {plan['price']:.2f}) - {len([f for f in plan['features'] if f['enabled']])} features enabled")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_plans())
