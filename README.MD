# To get the application running

1. Run `npm install` to install the dependencies
2. Create `.env` file in the root directory and fill with the following environment variables accordingly:
```
NODE_ENV=development
PORT=5000
SESSION_SECRET=just_use_something_random_as_secret
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DB=knowledgebase
```
## If you are developing
Run `npm run dev` to start the development server

## If you are hosting on production
Run `npm start` to start the server (Make sure to set NODE_ENV=production)

# Database tables creation/alteration
The server will automically check for new SQL scripts on startup. Developers do not need to run SQL scripts manually.
Here is the instruction for submitting SQL scripts.
1. Create a `.sql` script under `deployment/sql`
2. Name the script `#-name.sql`, where # must be unique and consecutive 
3. Put the SQL Query in the `.sql` and git push

Note: NEVER submit sql scripts with the same #, always git pull and double check before pushing a new sql script"# KnowledgeBase" 
