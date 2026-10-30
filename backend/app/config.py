"""Application settings, loaded from environment / .env."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Database
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "paper_trading"

    # Auth
    jwt_secret: str = "dev-insecure-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # one week

    # Prices: auto | mock | kite
    price_provider: str = "auto"

    # Optional app-level Kite credentials
    kite_api_key: str = ""
    kite_api_secret: str = ""

    # Business rules (INR): every account starts with default_balance and can
    # top up until lifetime deposits reach max_deposit.
    default_balance: int = 100_000  # Rs 1,00,000
    max_deposit: int = 1_000_000  # Rs 10,00,000


settings = Settings()
