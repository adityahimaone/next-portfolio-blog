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
        // The host has 1.9GB total and roughly 1.2GB is already held by other
        // services, so V8's default old-space limit of ~1GB on this box let a
        // single page render expand the heap until the process swapped instead
        // of collecting.
        //
        // --max-semi-space-size is the other half of the story and was worth
        // more than the old-space cap alone. V8 sizes the young generation from
        // available system memory, so on a large host each semi-space grows to
        // 16MB+ and two of them stay committed as scratch space across every
        // request. Measured on this box across a full 21-route sweep:
        //
        //   --max-old-space-size=128                        -> 181MB RSS
        //   --max-old-space-size=128 --max-semi-space-size=2 -> 134MB RSS
        //
        // i.e. ~47MB, more than the cap itself saved. Short-lived render
        // garbage is collected in a much smaller nursery, so less of it is
        // promoted into old space and far less scratch is committed. 2MB is
        // deliberately at the low end: it costs a few more scavenges, which is
        // CPU this box has spare, in exchange for the memory it buys back.
        NODE_OPTIONS:
          '--max-old-space-size=128 --max-semi-space-size=2',
      },
      // Runaway backstop. The heap cap above makes the app collect rather than
      // grow; this catches anything that grows outside the JS heap (native
      // buffers, a leak in a dependency) so the OS never has to swap.
      max_memory_restart: '350M',
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
