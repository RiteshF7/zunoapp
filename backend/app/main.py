"""FastAPI application entry point."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import (
    profile, collections, content, feed, search, ai,
    app_config, user_preferences, suggested_feed,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

settings = get_settings()

app = FastAPI(
    title="Zuno API",
    description="Backend API for the Zuno content curation app",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(app_config.router)        # public — loaded first at app start
app.include_router(profile.router)
app.include_router(user_preferences.router)  # per-user config (feed_type, etc.)
app.include_router(collections.router)
app.include_router(content.router)
app.include_router(feed.router)
app.include_router(suggested_feed.router)    # interest-based suggestions
app.include_router(search.router)
app.include_router(ai.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "zuno-api"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=True,
    )
