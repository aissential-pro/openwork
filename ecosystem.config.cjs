// PM2 Ecosystem Configuration for OpenWork
// This file uses CommonJS format for PM2 compatibility

module.exports = {
  apps: [
    {
      // ============================================
      // OpenWork Gateway Process
      // ============================================
      name: 'openwork-gateway',

      // Script to run (using Bun as interpreter)
      script: 'src/index.ts',

      // Working directory
      cwd: './packages/gateway',

      // Interpreter (use Bun for better performance)
      interpreter: 'bun',

      // Interpreter arguments
      interpreter_args: '',

      // ============================================
      // Environment Configuration
      // ============================================

      // Environment variables (loaded from .env file in project root)
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
      },

      // Development environment
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        LOG_LEVEL: 'debug',
      },

      // Production environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'info',
      },

      // ============================================
      // Process Management
      // ============================================

      // Number of instances (1 for stateful apps, 'max' for CPU cores)
      instances: 1,

      // Cluster mode (set to false for single instance)
      exec_mode: 'fork',

      // Auto-restart on file changes (disable in production)
      watch: false,

      // Ignore these files when watching
      ignore_watch: ['node_modules', 'logs', 'sessions', '.git'],

      // ============================================
      // Auto-Restart Configuration
      // ============================================

      // Restart if memory usage exceeds this limit (in MB)
      max_memory_restart: '1G',

      // Auto-restart on crashes
      autorestart: true,

      // Max number of restarts within min_uptime before stopping
      max_restarts: 10,

      // Minimum uptime before considering app stable (in ms)
      min_uptime: '10s',

      // Delay between restart attempts (in ms)
      restart_delay: 4000,

      // Stop app if it reaches max_restarts within this time window
      kill_timeout: 5000,

      // Wait for app to gracefully shutdown
      listen_timeout: 3000,

      // ============================================
      // Logging Configuration
      // ============================================

      // Output log file path
      out_file: './logs/openwork-gateway-out.log',

      // Error log file path
      error_file: './logs/openwork-gateway-error.log',

      // Combine logs into single file
      combine_logs: true,

      // Log timestamps
      time: true,

      // Merge cluster logs
      merge_logs: true,

      // Log rotation
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // ============================================
      // Advanced Options
      // ============================================

      // Source map support for better error traces
      source_map_support: true,

      // Don't auto-restart if exit code is 0 (graceful shutdown)
      stop_exit_codes: [0],

      // Cron pattern to restart app (optional)
      // cron_restart: '0 2 * * *', // Restart daily at 2 AM

      // Run app in background
      daemon: true,

      // Wait for app to be ready before considering it online
      wait_ready: false,

      // ============================================
      // Process Monitoring
      // ============================================

      // Enable PM2 monitoring
      pmx: true,

      // Instance variables accessible in app
      instance_var: 'INSTANCE_ID',

      // ============================================
      // Shutdown Configuration
      // ============================================

      // Shutdown signal to send (SIGINT for graceful shutdown)
      kill_signal: 'SIGINT',

      // Shutdown timeout (force kill after this time)
      shutdown_with_message: true,
    },

    // ============================================
    // Additional Process: OpenWork API Server (if needed)
    // ============================================
    // Uncomment this section if you want to run the API server separately
    /*
    {
      name: 'openwork-api',
      script: 'src/index.ts',
      cwd: './packages/openwork',
      interpreter: 'bun',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '2G',
      out_file: './logs/openwork-api-out.log',
      error_file: './logs/openwork-api-error.log',
      combine_logs: true,
      time: true,
    },
    */
  ],

  // ============================================
  // PM2 Deployment Configuration (Optional)
  // ============================================
  // Use this for automated deployments via PM2
  /*
  deploy: {
    production: {
      user: 'your-username',
      host: '72.60.104.129',
      ref: 'origin/main',
      repo: 'git@github.com:aissential-pro/openwork.git',
      path: '/home/your-username/openwork',
      'post-deploy': 'bun install && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
      'post-setup': 'bun install',
      'ssh_options': 'StrictHostKeyChecking=no',
    },
  },
  */
}
