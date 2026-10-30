"""MongoDB connection and collection accessors (Motor async driver)."""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    return get_client()[settings.mongo_db]


async def init_indexes() -> None:
    """Create indexes used by the app. Safe to call repeatedly."""
    db = get_db()
    await db.users.create_index("email", unique=True)
    await db.orders.create_index([("user_id", 1), ("created_at", -1)])
    await db.holdings.create_index([("user_id", 1), ("symbol", 1), ("exchange", 1)])


async def close_client() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
