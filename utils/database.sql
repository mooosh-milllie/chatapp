CREATE TABLE users( id SERIAL PRIMARY KEY, username VARCHAR(28) NOT NULL UNIQUE, passwordhash VARCHAR NOT NULL, userid VARCHAR NOT NULL UNIQUE);


