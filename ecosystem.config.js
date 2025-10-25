module.exports = {
  apps: [
    {
      name: 'backend',
      script: './start-backend.sh',
      cwd: '/var/www/mcpfinder',
      interpreter: '/bin/bash',
      env: {
        PYTHONUNBUFFERED: '1'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'frontend',
      script: './start-frontend.sh',
      cwd: '/var/www/mcpfinder-frontend',
      interpreter: '/bin/bash',
      env: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    },
    {
      name: 'ngrok',
      script: 'ngrok',
      args: ['http', '3000', '--log=stdout'],
      autorestart: true,
      watch: false
    }
  ]
};
