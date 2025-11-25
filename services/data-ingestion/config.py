import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://mongodb:27017')
    MONGO_DB = os.getenv('MONGO_DB', 'smartshop')
    
    # PostgreSQL
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'postgres')
    POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', 5432))
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'smartshop')
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'admin')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'admin123')
    
    # RapidAPI
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    
    @property
    def POSTGRES_URI(self):
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

config = Config()