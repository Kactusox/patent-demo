module.exports = {
  apps: [
    {
      name: 'patent-backend',
      script: './backend/server.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      
      // Logging
      log_file: './logs/patent-backend.log',
      error_file: './logs/patent-backend-error.log',
      out_file: './logs/patent-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      max_memory_restart: '1G',
      
      // Auto restart on file changes (development)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Source map support
      source_map_support: true,
      
      // Environment-specific settings
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001,
        watch: true
      }
    }
  ]
}