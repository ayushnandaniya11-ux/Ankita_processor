#!/bin/bash
set -e
sed -i "s/port = 5432/port = 5433/" /etc/postgresql/18/main/postgresql.conf
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/18/main/postgresql.conf
echo "host all all 0.0.0.0/0 trust" >> /etc/postgresql/18/main/pg_hba.conf
echo "host all all ::0/0 trust" >> /etc/postgresql/18/main/pg_hba.conf
echo "local all all trust" > /etc/postgresql/18/main/pg_hba.conf.tmp
cat /etc/postgresql/18/main/pg_hba.conf >> /etc/postgresql/18/main/pg_hba.conf.tmp
mv /etc/postgresql/18/main/pg_hba.conf.tmp /etc/postgresql/18/main/pg_hba.conf

service postgresql restart
sudo -u postgres psql -p 5433 -c "ALTER USER postgres WITH PASSWORD '5432';"
sudo -u postgres psql -p 5433 -c "CREATE DATABASE ankita_processors;" || true
echo "DATABASE_SETUP_SUCCESSFUL"
