from fastapi import FastAPI
from .routes import router

app = FastAPI(title="RyzenShield Internal API")

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    print("RyzenShield Core: Identifying AMD XDNA NPU...")
    # Initialize components here

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
