import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    # MongoDB
    MONGO_URL: str = os.environ['MONGO_URL']
    DB_NAME: str = os.environ['DB_NAME']
    
    # CORS
    CORS_ORIGINS: str = os.environ.get('CORS_ORIGINS', '*')
    
    # Groq (fast inference)
    GROQ_API_KEY: str = os.environ['xAI_KEY']
    GROQ_API_BASE: str = "https://api.groq.com/openai/v1"
    
    # OpenAI (optional fallback)
    OPENAI_API_KEY: str = os.environ.get('OPENAI_API_KEY', '')
    
    # SerpAPI
    SERPAPI_KEY: str = os.environ['SERPAPI_KEY']
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = os.environ['GOOGLE_CLIENT_ID']
    GOOGLE_CLIENT_SECRET: str = os.environ['GOOGLE_CLIENT_SECRET']
    
    # JWT
    JWT_SECRET: str = os.environ['JWT_SECRET']
    JWT_ALGORITHM: str = os.environ['JWT_ALGORITHM']
    JWT_EXPIRATION_HOURS: int = int(os.environ['JWT_EXPIRATION_HOURS'])

settings = Settings()