# Anon

![image](https://github.com/TruePadawan/Anon/assets/71678062/b8a02fb0-a8f6-4c7a-9133-d6dcd838dbad)
I'm building this to improve my web dev skills and pick up some new tools, it's going to be a simple web application that lets users create/join groups and having discussions, nothing crazy.

## Goals

- Use TailwindCSS and see what all the noise is about
- Review and improve on React.js, Next.js, TypeScript and I guess JavaScript
- Improve my testing skills and learn how to use Cypress

## Stack

- **Next.js + TypeScript**: Front/Backend
- **TailwindCSS**: Styling
- **Cloudinary**: Image Storage
- **Next-Auth**: Authentication
- **Cypress**: Testing
- **Mantine**: UI Component Library
- **TipTap**: WYSIWYG Editor
- **Prisma + MongoDB**: Database

## Setup

Anon depends on a couple of environment variables
- `GITHUB_ID`
- `GITHUB_SECRET`  
Follow [this](https://authjs.dev/getting-started/oauth-tutorial#2-configuring-oauth-provider) guide to set those up.

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
Follow [this](https://supabase.com/docs/learn/auth-deep-dive/auth-google-oauth) guide but don't do the Supabase related stuff since this project does not use Supabase.  
Instead set `Authorized JavaScript Origins` to `http://localhost:3000` and `Authorised redirect URIs` to `http://localhost:3000/api/auth/callback/google`

- `REDIRECT_URL`=/api/complete-auth
- `NEXTAUTH_URL`=http://localhost:3000

- `DATABASE_URL`
Follow [this](https://www.mongodb.com/docs/atlas/getting-started/) guide and set the variable to your cluster connection string

- `CLOUDINARY_URL`
See [here](https://cloudinary.com/documentation/how_to_integrate_cloudinary) to create a cloudinary account and a product environment.
Get you cloudinary url from the dashboard: `Programmable Media>Dashboard`

Run `npm install` to install the app dependencies then `npm run dev` to start up a development server.
