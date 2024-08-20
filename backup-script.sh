#!/bin/bash

# Set the backup directory
BACKUP_DIR="/backups"

# Set the current date for the backup file name
DATE=$(date +"%Y%m%d_%H%M%S")

# Perform the MongoDB backup
mongodump --host localhost --port 27017 --username admin --password $MONGO_ROOT_PASSWORD --authenticationDatabase admin --out $BACKUP_DIR/$DATE

# Compress the backup
tar -zcvf $BACKUP_DIR/$DATE.tar.gz $BACKUP_DIR/$DATE

# Remove the uncompressed backup directory
rm -rf $BACKUP_DIR/$DATE

# Upload to DigitalOcean Spaces
s3cmd put $BACKUP_DIR/$DATE.tar.gz s3://$DO_SPACES_BUCKET/mongodb-backups/

# Keep only the last 7 days of backups locally
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +7 -delete

# Keep only the last 30 days of backups in DigitalOcean Spaces
s3cmd ls s3://$DO_SPACES_BUCKET/mongodb-backups/ | grep .tar.gz | sort -r | awk 'NR>30 {print $4}' | xargs -I {} s3cmd del {}

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"