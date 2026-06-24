import os

if os.environ.get("RENDER") == "true" or os.environ.get("DJANGO_ENV") == "production":
    from .production import *  # noqa: F403
else:
    from .base import *  # noqa: F403