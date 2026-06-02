Deployment notes — Lexvaro

This document describes recommended steps to deploy the apps:
- Frontends: `Lexvaro-user-main` and `Lexvaro-admin-main` (Next.js) — deploy to Vercel
- Backend: `Lexvaro-backend-main` (Express/Mongo) — deploy to AWS (Elastic Beanstalk or ECS/ECR)

1) Vercel (Next.js frontends)

Prereqs:
- GitHub account with repositories connected (we push changes already)
- Vercel account

Steps:
- In Vercel dashboard, create a new Project -> Import from GitHub
- Select the repository (e.g., `lux-varo-Frontend` and `lux-varo-Admin`)
- Use the default build command and output (Next.js auto-detected)
- Add Environment Variables in Vercel project settings:
  - `NEXT_PUBLIC_API_URL` = production backend API, e.g. `https://lexvaro-backend.onrender.com/api` or your production URL
  - Any other secrets used by the frontend
- Deploy. Vercel will pick up branches — connect the branch you want (e.g., `main` or `amalexvaro`)

Notes:
- The frontends read `NEXT_PUBLIC_API_URL` (see [next.config.mjs](../Lexvaro-user-main/next.config.mjs)). Ensure the prod value points to your backend URL.

2) AWS — Backend (two recommended options)

Option A: Elastic Beanstalk (simpler for Node apps)

Prereqs:
- AWS account
- AWS CLI and EB CLI installed and configured (`aws configure`, `eb init`)
- MongoDB access (Atlas or reachable Mongo instance) — note `MONGO_URI` env var

Steps:
1. From `Lexvaro-backend-main` repository root, create a zip or use EB CLI:
   - `eb init -p node.js lexvaro-backend --region us-east-1` (choose region)
   - `eb create lexvaro-backend-env --instance_type t3.small`
2. Set environment variables (via EB console or CLI):
   - `MONGO_URI`, `CLOUDINARY_*`, `MAILGUN_*`, `JWT_SECRET`, `PORT` (optional), etc.
   - Example: `eb setenv MONGO_URI=... CLOUDINARY_URL=... JWT_SECRET=...` 
3. Deploy:
   - `eb deploy`
4. Monitor logs: `eb logs` or on the Elastic Beanstalk console.

Option B: ECR + ECS Fargate (containerized, recommended for scalability)

Prereqs:
- Docker
- AWS CLI configured with permissions for ECR and ECS

Steps (high level):
1. Build and tag Docker image from `Lexvaro-backend-main`:
   - `docker build -t lexvaro-backend:latest .`
2. Create an ECR repository (console or CLI):
   - `aws ecr create-repository --repository-name lexvaro-backend`
3. Authenticate & push:
   - `aws ecr get-login-password | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<region>.amazonaws.com`
   - `docker tag lexvaro-backend:latest <ACCOUNT_ID>.dkr.ecr.<region>.amazonaws.com/lexvaro-backend:latest`
   - `docker push <ACCOUNT_ID>.dkr.ecr.<region>.amazonaws.com/lexvaro-backend:latest`
4. Create ECS cluster and task definition with the pushed image. Set container port to `5002` (Dockerfile `ENV PORT=5002` and `EXPOSE 5002`).
5. Configure service, attach ALB (Application Load Balancer) and set target group health checks.
6. Set environment variables in Task Definition (MONGO_URI etc.).

3) After deployment — Frontend configuration

- In Vercel, set `NEXT_PUBLIC_API_URL` to the backend public URL (the ALB or Beanstalk URL). This must use HTTPS.

4) Useful files changed in this work

- [Lexvaro-user-main/next.config.mjs](Lexvaro-user-main/next.config.mjs) — prefer local backend for development
- [Lexvaro-user-main/.env](Lexvaro-user-main/.env) — updated to local API for development
- [Lexvaro-admin-main/src/app/admin/subcategory/page.tsx](src/app/admin/subcategory/page.tsx) — fixed relative import to `getApiUrl`
- [Lexvaro-backend-main/Dockerfile](Dockerfile) — set `ENV PORT=5002` and `EXPOSE 5002`
- [Lexvaro-backend-main/DEPLOYMENT.md](DEPLOYMENT.md) — this file

5) Quick verification locally

- Start backend: 
  ```bash
  cd Lexvaro-backend-main
  npm run dev
  ```
- Start frontend(s):
  ```bash
  cd Lexvaro-user-main
  npm run dev
  # and for admin
  cd ../Lexvaro-admin-main
  npm run dev
  ```
- Open dev URLs and check browser console for fetch errors (HeroBanner / subcategories)

---

Malayalam summary (ചുരുക്കത്തിൽ):

- ഞാൻ ഫൈൽ import പാത്ത് ശരിയാക്കി (`getApiUrl`) ഇനി admin പേജ് തെറ്റ് കാണിക്കരുത്.
- user ആപ്പിൽ development API URLлок `.env` വരുത്തി, `next.config.mjs` എന്വായോൺമെന്റ് അനുസരിച്ച് local backend ഉപയോഗിക്കും.
- ബാക്ക്‌എൻഡിനായി Dockerfile-ൽ `PORT=5002` സജ്ജമാക്കി.
- മാറ്റങ്ങൾ Git-ില് commit ചെയ്ത് push ചെയ്തിരിക്കുന്നു.
- Vercel-ൽ frontend deploy ചെയ്യാൻ repo അല്ലെങ്കിൽ branch add ചെയ്ത് `NEXT_PUBLIC_API_URL` production URL സെറ്റ് ചെയ്യുക.
- Backend AWS-ൽ deploy ചെയ്യാൻ Elastic Beanstalk അല്ലെങ്കിൽ ECS ഉപയോഗിക്കാൻ കഴിയും — വിവരമുള്ള കമാൻഡുകൾ നേരെമുകളിൽ നൽകിയിട്ടുണ്ട്.

If you want, I can:
- create a `vercel.json` or GitHub Action for automated deploys
- prepare an ECS task definition and CloudFormation template

Tell me which of the above you'd like me to do next and I will proceed.