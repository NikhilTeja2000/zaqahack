import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { OrderController } from './controllers/OrderController';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Initialize controller
const orderController = new OrderController();

// API Routes
app.post('/api/process-order', (req, res) => orderController.processOrder(req, res));
app.post('/api/generate-pdf', (req, res) => orderController.generatePDFForm(req, res));
app.get('/api/stats', (req, res) => orderController.getSystemStats(req, res));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Smart Order Intake System running on port ${PORT}`);
  console.log(`📧 Ready to process customer emails with AI`);
  console.log(`🔗 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
}); 