#!/usr/bin/env python3
"""
Script to clean up duplicate users and ensure database integrity
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def cleanup_duplicates():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=== Checking for duplicate users ===")
    
    # Find duplicate emails
    pipeline = [
        {"$group": {
            "_id": "$email",
            "count": {"$sum": 1},
            "ids": {"$push": "$id"}
        }},
        {"$match": {"count": {"$gt": 1}}}
    ]
    
    duplicates = await db.users.aggregate(pipeline).to_list(None)
    
    if duplicates:
        print(f"Found {len(duplicates)} duplicate emails")
        
        for dup in duplicates:
            email = dup["_id"]
            count = dup["count"]
            print(f"\n  Email: {email} - {count} records")
            
            # Get all users with this email
            users = await db.users.find({"email": email}).to_list(None)
            
            # Keep the first one, delete the rest
            kept_user = users[0]
            print(f"    Keeping: {kept_user['id']}")
            
            for user in users[1:]:
                await db.users.delete_one({"_id": user["_id"]})
                print(f"    Deleted: {user['id']}")
    else:
        print("✅ No duplicate users found")
    
    # Ensure indexes exist
    print("\n=== Ensuring unique indexes ===")
    
    try:
        await db.users.create_index("email", unique=True)
        print("✅ Unique index on 'email' created/verified")
    except Exception as e:
        print(f"Email index already exists or error: {e}")
    
    try:
        await db.users.create_index("id", unique=True)
        print("✅ Unique index on 'id' created/verified")
    except Exception as e:
        print(f"ID index already exists or error: {e}")
    
    # Fix undefined roles
    print("\n=== Fixing undefined roles ===")
    result = await db.users.update_many(
        {"$or": [
            {"role": {"$exists": False}},
            {"role": None},
            {"role": "undefined"}
        ]},
        {"$set": {"role": "user"}}
    )
    
    if result.modified_count > 0:
        print(f"✅ Fixed {result.modified_count} users with undefined roles")
    else:
        print("✅ All users have valid roles")
    
    # Summary
    total_users = await db.users.count_documents({})
    print(f"\n=== Summary ===")
    print(f"Total users: {total_users}")
    
    # List all users
    users = await db.users.find({}, {"_id": 0, "email": 1, "name": 1, "plan": 1, "role": 1}).to_list(None)
    for user in users:
        print(f"  - {user['email']} | {user['name']} | Plan: {user['plan']} | Role: {user['role']}")
    
    print("\n✅ Database cleanup completed!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_duplicates())
