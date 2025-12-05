const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Medical Appointments API running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(` API: http://localhost:${PORT}/api`);
});

module.exports = server;