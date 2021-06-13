DROP TABLE exam;

CREATE TABLE IF NOT EXISTS exam(
    id SERIAL PRIMARY KEY ,
     name VARCHAR (255), 
     price VARCHAR (255),
     image VARCHAR(255),
     description TEXT 
);