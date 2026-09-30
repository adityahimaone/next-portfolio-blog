module.exports = {
  apps: [
    {
      name: 'portfolio-blog',
      // Absolute path to the real JS entrypoint, not the .bin/next shell shim.
      // pm2 launches scripts with `node`, and .bin/next is a POSIX shell
      // script, which crashes with a SyntaxError -> 502 Bad Gateway.
      script: '/home/adityahimaone/apps/next-portfolio-blog/node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/adityahimaone/apps/next-portfolio-blog',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '127.0.0.1',
      },
      // Back off instead of hot-looping when the app fails to boot.
      exp_backoff_restart_delay: 5000,
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: 20000,
      kill_timeout: 5000,
      listen_timeout: 15000,
      out_file: '/home/adityahimaone/.pm2/logs/portfolio-blog-out.log',
      error_file: '/home/adityahimaone/.pm2/logs/portfolio-blog-error.log',
      merge_logs: true,
      time: true,
    },
  ],
}
