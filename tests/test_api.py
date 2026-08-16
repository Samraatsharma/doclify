import pytest
from fastapi.testclient import TestClient
from doclify.server import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data
    assert "has_api_key" in data

def test_models_endpoint():
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) > 0

def test_projects_endpoint():
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert "projects" in data
    assert len(data["projects"]) >= 1
    # First project should be active current project
    current = data["projects"][0]
    assert current["id"] == "current"
    assert "stats" in current
    assert current["stats"]["files_count"] > 0

def test_project_files_endpoint():
    response = client.get("/api/projects/current/files")
    assert response.status_code == 200
    data = response.json()
    assert "files" in data
    assert len(data["files"]) > 0

def test_project_readme_endpoint():
    response = client.get("/api/projects/current/readme")
    assert response.status_code == 200
    data = response.json()
    assert "exists" in data

def test_frontend_spa_serving():
    response = client.get("/")
    assert response.status_code == 200
    assert "Doclify" in response.text or "<html" in response.text
