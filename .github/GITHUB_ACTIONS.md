# GitHub Actions CI/CD Secrets

This project uses GitHub Actions for automated testing, building, and deployment.

## Required GitHub Secrets

To enable the CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### Setting up Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### Required Secrets:

1. **DOCKER_USERNAME**
   - Your Docker Hub username
   - Example: `ffiuca`

2. **DOCKER_PASSWORD**
   - Your Docker Hub password or access token
   - Generate token at: https://hub.docker.com/settings/security

3. **KUBE_CONFIG**
   - Your Kubernetes cluster configuration
   - Base64 encoded kubeconfig file
   - Generate: `cat ~/.kube/config | base64 -w 0`

4. **MONGODB_URI**
   - Production MongoDB connection string
   - Example: `mongodb://admin:password@svc-mongodb.insigna-express.svc.cluster.local:27017/insigna-users?authSource=admin`
   - Or use MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/insigna-users`

5. **JWT_SECRET**
   - Secret key for JWT token generation
   - Use a strong random string
   - Generate: `openssl rand -base64 32`

## Pipeline Stages

### 1. Test Stage
- ✅ Runs on all pushes and pull requests
- ✅ Installs dependencies
- ✅ Runs unit tests with coverage (30 tests)
- ✅ Generates coverage reports
- ✅ Uploads coverage to Codecov (optional)

### 2. Build Stage
- ✅ Runs only on push events (after tests pass)
- ✅ Builds Docker image
- ✅ Pushes to Docker Hub with multiple tags
- ✅ Uses layer caching for faster builds

### 3. Deploy Stage
- ✅ Runs only on main branch pushes
- ✅ Deploys to Kubernetes cluster
- ✅ Creates namespace and secrets
- ✅ Waits for deployment to be ready
- ✅ Verifies deployment health

### 4. Security Scan Stage
- ✅ Scans for vulnerabilities with Trivy
- ✅ Runs npm audit
- ✅ Uploads results to GitHub Security

## Docker Image Tags

The pipeline automatically tags images with:
- `latest` - Latest main branch build
- `main` - Main branch builds
- `develop` - Develop branch builds
- `pr-<number>` - Pull request builds
- `<branch>-<sha>` - Branch with commit SHA

## Kubernetes Deployment

The deployment includes:
- Express API (2 replicas)
- MongoDB database
- LoadBalancer service
- ConfigMap for non-sensitive config
- Secrets for sensitive data

## Testing the Pipeline Locally

### Run tests locally:
```bash
npm test
```

### Build Docker image locally:
```bash
docker build -t ffiuca/insigna-test-express:latest .
```

### Test Kubernetes manifests:
```bash
kubectl apply -f k8s-deployment.yaml --dry-run=client
```

## Workflow Triggers

- **Push to main/develop**: Full pipeline (test → build → deploy)
- **Pull Requests**: Test and build only
- **Manual trigger**: Can be run manually from GitHub Actions tab

## Status Badges

Add to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-cd.yml/badge.svg)
![Tests](https://img.shields.io/badge/tests-30%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-82%25-green)
```
