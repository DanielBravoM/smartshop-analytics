from pymongo import MongoClient
import os

_mongodb_client = None
_mongodb_database = None

def get_mongodb_client():
    global _mongodb_client
    if _mongodb_client is None:
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://admin:password123@mongodb:27017/')
        _mongodb_client = MongoClient(mongo_uri)
    return _mongodb_client

def get_mongodb():
    global _mongodb_database
    if _mongodb_database is None:
        client = get_mongodb_client()
        db_name = os.getenv('MONGO_DB', 'smartshop')
        _mongodb_database = client[db_name]
    return _mongodb_database

def close_mongodb():
    global _mongodb_client, _mongodb_database
    if _mongodb_client is not None:
        _mongodb_client.close()
        _mongodb_client = None
        _mongodb_database = None