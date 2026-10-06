from clients.database import engine
from sqlalchemy import text
import asyncio
import selectors


async def test_database():

    try:
        # 1. Acquire a connection from the engine's pool
        async with engine.connect() as conn:
            # 2. Execute raw SQL wrapped in text()
            result = await conn.execute(text("SELECT 1"))
            
            # 3. Extract the single scalar value (no 'await' needed here)
            value = result.scalar_one()
            return value
    finally:
        # 4. Close all connections in the pool before exiting the script
        await engine.dispose()

print(asyncio.run(test_database(), loop_factory=asyncio.SelectorEventLoop))