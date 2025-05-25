CREATE DATABASE ticketdb;
CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON ticketdb.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
