import pytest
from fastapi.testclient import TestClient
from doclify.server import app

client = TestClient(app)

def test_path_traversal_protection():
    # Attempting path traversal outside project directory
    res = client.get("/api/projects/current/file-content?file_path=../../../../etc/passwd")
    assert res.status_code in [403, 404]

def test_invalid_local_path():
    res = client.post("/api/projects/create/local", json={"path": "/non/existent/random/directory/12345"})
    assert res.status_code == 400
    assert "not a valid directory" in res.json()["detail"]

def test_invalid_github_url():
    res = client.post("/api/projects/create/github", json={"url": "https://malicious-site.com/repo"})
    assert res.status_code == 400
    assert "Must be a valid GitHub URL" in res.json()["detail"]

def test_invalid_zip_upload():
    res = client.post(
        "/api/projects/create/upload",
        files={"file": ("malicious.exe", b"not a zip", "application/octet-stream")}
    )
    assert res.status_code == 400
    assert "Only ZIP files are supported" in res.json()["detail"]
