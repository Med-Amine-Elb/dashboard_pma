-- SQL script to add test users directly to the database
-- Run this in your database (H2 console or your database management tool)

-- First, make sure you have a user with ADMIN role to create other users
-- If you don't have an admin user, create one first:

INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at) 
VALUES ('Admin', 'User', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Then add test users for messaging:

INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at) 
VALUES ('Jean', 'Dupont', 'jean.dupont@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at) 
VALUES ('Marie', 'Martin', 'marie.martin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at) 
VALUES ('Pierre', 'Durand', 'pierre.durand@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (first_name, last_name, email, password, role, created_at, updated_at) 
VALUES ('Sophie', 'Dubois', 'sophie.dubois@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Note: The password hash above is for "password123" using BCrypt 