import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Insigna API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Insigna User Management API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: {
        login: 'POST /api/login',
      },
      users: {
        create: 'POST /api/users',
        getAll: 'GET /api/users (Protected)',
        getById: 'GET /api/users/:id (Protected)',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
      },
    },
  });
});

const routes = [
  authRoutes,
  userRoutes
]
for (const route of routes) {
  app.use('/api', route);
}

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
