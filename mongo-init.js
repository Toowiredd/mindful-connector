db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    {
      role: 'readWrite',
      db: 'adhd2e_db'
    }
  ]
});

db.createCollection('tasks');
db.createCollection('profiles');
db.createCollection('analytics');

db.tasks.createIndex({ userId: 1 });
db.profiles.createIndex({ userId: 1 }, { unique: true });
db.analytics.createIndex({ userId: 1, timestamp: -1 });