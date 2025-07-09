from urllib.parse import parse_qs, urlparse

import oracledb

from .config import settings


def get_connection():
    url = settings.DATABASE_URL
    if url.startswith("oracle+oracledb://"):
        url = url[len("oracle+oracledb://") :]
    # Parse the URL
    parsed = urlparse(f"//{url}")  # Add // to make it parseable
    user = parsed.username
    password = parsed.password
    host = parsed.hostname
    port = parsed.port
    # Extract service_name from query
    query = parse_qs(parsed.query)
    service_name = query.get("service_name", [None])[0]
    if not all([user, password, host, port, service_name]):
        raise ValueError("Invalid DATABASE_URL format. Please check your .env file.")
    dsn = f"{host}:{port}/{service_name}"
    return oracledb.connect(user=user, password=password, dsn=dsn)
