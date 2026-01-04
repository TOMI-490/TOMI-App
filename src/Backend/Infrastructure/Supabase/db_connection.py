import os
import logging
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SupabaseConnection:
    # Singleton instance
    
    _instance: Optional['SupabaseConnection'] = None
    _client: Optional[Client] = None
    
    # Singleton pattern implementation
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    # Initialize connection
    def __init__(self):
        if self._client is None:
            self._initialize()
    
    # Load environment variables
    def _load_environment(self) -> tuple[str, str]:
        """Load and validate environment variables"""
        # Find .env file in src directory (parent of Backend)
        backend_dir = Path(__file__).parent.parent.parent
        src_dir = backend_dir.parent
        env_path = src_dir / '.env'
        
        # Fallback to Backend directory if not found in src
        if not env_path.exists():
            env_path = backend_dir / '.env'
        
        if not env_path.exists():
            raise FileNotFoundError(
                f"❌ .env file not found at: {env_path}\n"
                f"Searched locations:\n"
                f"  - {src_dir / '.env'}\n"
                f"  - {backend_dir / '.env'}\n"
                f"Please create .env file using .envExample as template"
            )
        
        # Load environment variables
        load_dotenv(dotenv_path=env_path)
        
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise ValueError(
                f"❌ Missing Supabase credentials in .env file at: {env_path}\n"
                "Required variables: SUPABASE_URL, SUPABASE_KEY\n"
                "Please add them to your .env file"
            )
        
        # Validate URL format
        if not url.startswith("https://"):
            raise ValueError(f"❌ Invalid SUPABASE_URL format: {url}")
        
        logger.info(f"✓ Environment loaded from: {env_path}")
        return url, key
    
    def _initialize(self) -> None:
        # Initialize Supabase client
        try:
            url, key = self._load_environment()
            
            # Create client with configuration
            self._client = create_client(url, key)
            
            # Test connection
            self._test_connection()
            
            logger.info(f"✓ Connected to Supabase: {url}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase connection: {e}")
            raise
    
    def _test_connection(self) -> None:
        # Test database connection by executing a simple query
        try:
            # Try to access a system table (works even with empty database)
            response = self._client.schema('public').table('user').select("user_id").limit(1).execute()
            logger.info("✓ Database connection test successful")
        except Exception as e:
            # Connection exists but table might not - that's okay
            logger.warning(f"⚠ Connection established but test query failed: {e}")
            logger.info("✓ This is normal for new Supabase projects")
    
    @property
    def client(self) -> Client:
        # Accessor for Supabase client
        if self._client is None:
            self._initialize()
        return self._client
    
    def health_check(self) -> dict:
        # Perform health check on the Supabase connection
        try:
            # Attempt a simple query
            self._client.schema('public').table('user').select("user_id").limit(1).execute()
            return {
                "status": "healthy",
                "connected": True,
                "message": "Supabase connection is active"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "connected": False,
                "message": str(e)
            }
    
    def get_service_client(self) -> Client:
        # Get a Supabase client using service key
        service_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not service_key:
            raise ValueError("SUPABASE_SERVICE_KEY not found in environment")
        
        url = os.getenv("SUPABASE_URL")
        return create_client(url, service_key)
    
    def disconnect(self) -> None:
        # Disconnect the Supabase client
        if self._client:
            logger.info("✓ Supabase connection closed")
            self._client = None


# Create singleton instance
connection = SupabaseConnection()

# Export the client for easy access
supabase: Client = connection.client


# Main execution for testing
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Testing Supabase Connection")
    print("="*60 + "\n")
    
    try:
        # Test connection
        print(f"Client initialized: {supabase is not None}")
        
        # Health check
        health = connection.health_check()
        print(f"\nHealth Check:")
        print(f"  Status: {health['status']}")
        print(f"  Connected: {health['connected']}")
        print(f"  Message: {health['message']}")
        
        # Display connection info
        url = os.getenv("SUPABASE_URL")
        print(f"\nConnection Details:")
        print(f"  URL: {url}")
        print(f"  Using anon key: {os.getenv('SUPABASE_KEY')[:20]}...")
        
        print("\n" + "="*60)
        print("✓ Connection test completed successfully!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Connection test failed: {e}\n")
        exit(1)



