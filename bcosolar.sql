CREATE DATABASE bancosolar;

CREATE TABLE usuarios (
  id serial PRIMARY KEY, 
  nombre varchar(50),
  balance float check (balance >= 0)
);

CREATE TABLE transferencias (
  id serial PRIMARY KEY, 
  emisor integer, 
  receptor integer, 
  monto float, 
  fecha timestamp default now(), 
  FOREIGN KEY (emisor)references usuarios(id), 
  FOREIGN KEY (receptor)references usuarios(id)
);


SELECT fecha, emisores.nombre as emisor, receptores.nombre as receptor, monto FROM transferencias
join usuarios as emisores on emisor = emisores.id
join usuarios as receptores on receptor = receptores.id
