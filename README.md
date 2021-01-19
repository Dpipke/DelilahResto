# DelilahResto
This project is an online ordering system for a restaurant. The objective was the backend of it, thorugh seting up a REST API that allows an user to add, cancel, modify or obtain information about a data structure that a client could consume

Implementation

- Node.js
    (Nodemon Library
    Express Library
    Sequelize Library)
- Json Web Token (JWT)
- MySQL



Deployment

Requirements for deploying Delilah Resto:

- Node
- MySql
- Clone locally the using the following command in bash shell: git clone https://github.com/Dpipke/DelilahResto
cd delilah_project

- Installing all dependences: npm install

- Run the server by using the following command in the shell (must be inside /DelilahResto): npm run app.js
- Set authentication password, database name, user, password, localhost, port in a dotenv file as

>AuthPassword = \<jwt authetication password>
>DB = \<database name>
>DBUSER = \<database user name>
>DBPASS = \<database user password>
>DBHOST = \<database localhost>
>DBPORT = \<database port>


- Run in mysql workbrench the /database.sql before using the app
