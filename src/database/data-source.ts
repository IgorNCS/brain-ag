import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();

const entitiesPath = path.join(__dirname, '..', 'modules', '**', 'entities', '*.entity.{ts,js}');

const migrationsPath = path.join(__dirname, 'migrations', '*.{ts,js}');

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities: [entitiesPath],  
    migrations:[migrationsPath], 
    synchronize: false,
    schema: 'public',
});

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });