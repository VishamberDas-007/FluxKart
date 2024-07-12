# Fluxkart Backend System

## Create environment files 

  ### Note: .env file is must
    
      PORT=3030
      DATABASE_URL=postgresql://user_name:password@host_name/db_name
      
  ### To start prisma studio in browser

      yarn prisma studio

## DB commands

  ### to reflect model changes into schema.prisma

      yarn prismix

  ### to create a new migration

      yarn migrate or yarn prisma migrate dev --create-only

  ### for migrate database

      yarn migrate:deploy or yarn prisma migrate deploy

  ### for generate prisma client

      yarn prisma generate

## API Endpoints
  
  ### /api/contact/identify

    POST API which takes input in the body { email?: string, phoneNumber?: number }
    Description: Identifies the contact based on the provided email or phone number.

  ### /api/test

    GET API for testing purposes.
    Description: A simple GET endpoint to test the server.
