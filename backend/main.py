from fastapi import FastAPI

app = FastAPI(title="Aboutme Backend")


@app.get("/")
def hello_world() -> dict[str, str]:
    return {"message": "Hello World"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
