require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  postgres: {
    host: process.env.POSTGRES_HOST || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DB || 'smartshop',
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'admin123'
  },
  
  mongodb: {
    host: process.env.MONGO_HOST || 'mongodb',
    port: parseInt(process.env.MONGO_PORT) || 27017,
    database: process.env.MONGO_DB || 'smartshop',
    user: process.env.MONGO_USER || 'admin',
    password: process.env.MONGO_PASSWORD || 'admin123',
    get uri() {
      return `mongodb://${this.user}:${this.password}@${this.host}:${this.port}/`;
    }
  }
};