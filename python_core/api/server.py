from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router

app = FastAPI(title="RyzenShield Internal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for demo (specifically localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
async def startup_event():
    print("RyzenShield Core: Identifying AMD XDNA NPU...")
    # Initialize components here

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
