const express = require('express');
const {nuevoUsuario, 
      mostrarUsuarios, 
      editarUsuario, 
      eliminarUsuario, 
      nuevaTransferencia, 
      mostrarTransferencias} = require('./func_bd.js')

const app = express()

app.use(express.static('public')) // para manejo de archivos estáticos
app.use(express.urlencoded({ extended: true })); // para recibir datos de formulario POST

function getForm(req) {
  return new Promise((res, rej) => {
    let str = "";
    req.on("data", function (chunk) {
      str += chunk;
    });
    req.on("end", function () {
      //console.log('str', str);
      const obj = JSON.parse(str);
      res(obj);
    });
  });
}

app.get('/', (req, res) => {
  res.json([])
})

//----Rutas usuarios--->
app.post('/usuario', async (req, res) => { 
  const datos = await getForm(req)
  console.log(datos)
  await nuevoUsuario(datos.nombre, datos.balance)
  res.json({})
})

app.get('/usuarios', async (req, res) => {
  const usuarios = await mostrarUsuarios()  
  res.json( usuarios )
})

app.put('/usuario', async (req, res) => {    // recibe los datos que se desean editar
  const datos = await getForm(req)
  const id = req.query.id;
  //console.log('probando1', datos)
  await editarUsuario(id, datos.name, datos.balance)
  res.json({})    
})

app.delete('/usuario', async(req, res)=>{
  const id = req.query.id;
  console.log('probando okidoki')
  await eliminarUsuario(id)
  res.json({})
})


//----Rutas para transferencias--->
app.get('/transferencias', async (req, res) => {
  const transferencias = await mostrarTransferencias()
  res.json(transferencias)
})

app.post('/transferencia', async (req, res) => {
  const datos = await getForm(req)
  console.log(datos)
  await nuevaTransferencia(datos.emisor, datos.receptor, datos.monto)
  res.json({})
})

app.get('*', (req, res) => {
  res.statusCode = 404
  res.send('Ruta no implementada')
})

app.listen(3000, function () {
  console.log(`Servidor corriendo en http://localhost:3000/`);
});