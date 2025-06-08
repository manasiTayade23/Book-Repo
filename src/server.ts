import app from './app';
import config from './config/env';
import { Server } from 'http';

const startServer = async (retries: number = 0): Promise<void> => {
    const maxRetries: number = 3;
    const port: number = parseInt(config.PORT) + retries;

    try {
        const server: Server = app.listen(port, () => {
            console.log(`Server is running in ${config.NODE_ENV} mode on port ${port}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err: Error, promise: Promise<any>) => {
            console.log(`Error: ${err.message}`);
            // Close server & exit process
            server.close(() => process.exit(1));
        });
    } catch (error: any) {
        if (error.code === 'EADDRINUSE' && retries < maxRetries) {
            console.log(`Port ${port} is in use, trying port ${port + 1}`);
            await startServer(retries + 1);
        } else {
            console.error('Server failed to start:', error.message);
            process.exit(1);
        }
    }
};

// Start the server
startServer(); 