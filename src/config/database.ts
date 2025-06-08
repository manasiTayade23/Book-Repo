import { Sequelize } from 'sequelize';
import config from './env';

const sequelize = new Sequelize(config.DATABASE_URL!, {
    dialect: 'postgres',
    logging: config.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export const connectDB = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected...');
        
        // Sync all models
        await sequelize.sync();
        console.log('Database synced');
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export { sequelize }; 