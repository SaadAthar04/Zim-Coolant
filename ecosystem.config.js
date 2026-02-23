module.exports = {
  apps: [{
    name: 'zim-coolant',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/zimcoolant',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}
