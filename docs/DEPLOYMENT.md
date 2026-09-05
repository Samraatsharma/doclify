# Deployment
Doclify can be deployed locally or via serverless environments.

- **Vercel**: `vercel.json` configures deployment. Due to read-only filesystem, workspace uses `/tmp`.
- **Local**: Run via `doclify server` or `uvicorn`.
