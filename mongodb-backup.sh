#!/bin/bash

# Set the backup directory
BACKUP_DIR="/backups"

# Set the current date for the backup file name
DATE=$(date +"%Y%m%d_%H%M%S")

# Perform the backup
mongodump --host localhost --port 27017 --username admin --password secretpassword --authenticationDatabase admin --out $BACKUP_DIR/$DATE

# Compress the backup
tar -zcvf $BACKUP_DIR/$DATE.tar.gz $BACKUP_DIR/$DATE

# Remove the uncompressed backup directory
rm -rf $BACKUP_DIR/$DATE

# Keep only the last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"