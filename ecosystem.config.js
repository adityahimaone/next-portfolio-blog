module.exports = {
  apps: [
    {
      name: 'portfolio-blog',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/home/adityahimaone/apps/next-portfolio-blog',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
