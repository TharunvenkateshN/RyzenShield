from fastapi import APIRouter
from python_core.vault.db_manager import VaultManager

router = APIRouter()
vault = VaultManager()

@router.get("/")
async def root():
    return {"status": "RyzenShield Sentinel Active", "device": "AMD Ryzen AI"}

@router.get("/stats")
async def get_stats():
    # TODO: Fetch real stats from DB
    return {
        "threats_blocked": 12, # Placeholder -> Query DB
        "pii_masked": 45,      # Placeholder
        "latency_saved_ms": 1200
    }

@router.get("/logs")
async def get_logs():
    """Returns the latest 50 logs from the Vault."""
    try:
        logs = vault.get_recent_logs(limit=50)
        return logs
    except Exception as e:
        return [{"message": f"Error fetching logs: {e}", "event_type": "ERROR"}]

@router.post("/scan")
async def scan_clipboard(text: str):
    # Endpoint for the C++ Watcher to call
    return {"status": "scanned", "pii_found": False}
