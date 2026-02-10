from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def root():
    return {"status": "RyzenShield Sentinel Active", "device": "AMD Ryzen AI"}

@router.get("/stats")
async def get_stats():
    return {
        "threats_blocked": 12,
        "pii_masked": 45,
        "latency_saved_ms": 1200
    }

@router.post("/scan")
async def scan_clipboard(text: str):
    # Endpoint for the C++ Watcher to call
    return {"status": "scanned", "pii_found": False}
