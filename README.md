# Numpak Mabur Reimbursement Application
NUMA reimbursement web app built with [React](https://react.dev) and [Express](https://expressjs.org)

## Features
- User reimbursement form submission
- Reimbursement approval by management
- Finance approval
- Yearly summary data
- Reimbursement Excel file export

## Installation

### Prerequisites
Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Setup
1. Clone the repository
```
> git clone https://github.com/greyseth/numa-reimbursement.git
> cd numa-reimbursement
```
2. Database import
- Create new MySQL database
```mysql> CREATE DATABASE db_numa;```
- Import database file (included in repository)
```mysql> -u USERNAME -p db_numa < db_numa.sql```
3. Install dependencies (for application and API)
```
> npm install
> cd api
> npm install
```
4. Create environment variable files
- For API:
Go to the ``/api`` folder and create a file named ``.env``, with the following values
```
TOKEN_SECRET=(Custom JWT token secret for authorization)
DB_HOST=(database host address)
DB_USER=(MySQL database username)
DB_NAME=(MySQL database name)
FRONTEND_HOSTNAME=(Public host address for application front end)
BACKEND_HOSTNAME=(Public host address for API)
```
- For application:
Create a file named ``.env`` on the root folder, with the following values
```
REACT_APP_APIHOST=(Public host address for API)
```
5. Start API server
```
> cd api
> node index.js
```
6. Start application development server
```
> cd ../
> npm run start
```
7. Build application for deployment
```
> npm run build
```
