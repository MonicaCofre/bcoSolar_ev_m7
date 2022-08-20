const express = require('express');
const { nuevoUsuario,
  mostrarUsuarios,
  editarUsuario,
  eliminarUsuario,
  nuevaTransferencia,
  mostrarTransferencias,
  getForm } = require('./func_bd.js')

const app = express()

app.use(express.static('public')) // para manejo de archivos estáticos
app.use(express.urlencoded({ extended: true })); // para recibir datos de formulario POST


app.get('/', (req, res) => {
  res.json([])
})

//----Rutas usuarios--->
app.post('/usuario', async (req, res) => {
  const datos = await getForm(req)
  //console.log(datos)
  try {
    await nuevoUsuario(datos.nombre, datos.balance)
  } catch (error) {
    console.log(error)
  }
  res.json({})
})

app.get('/usuarios', async (req, res) => {
  let usuarios;
  try {
    usuarios = await mostrarUsuarios()
  } catch (error) {
    console.log(error)
  }
  res.json(usuarios)
})

app.put('/usuario', async (req, res) => {    // recibe los datos que se desean editar
  const datos = await getForm(req)
  const id = req.query.id;
  //console.log('probando1', datos)
  try {
    await editarUsuario(id, datos.name, datos.balance)
  } catch (error) {
    console.log(error)
  }
  res.json({})
})

app.delete('/usuario', async (req, res) => {
  const id = req.query.id;
  console.log('probando okidoki')
  try {
    await eliminarUsuario(id)
  } catch (error) {
    console.log(error)
  }
  res.json({})
})


//----Rutas para transferencias--->
app.get('/transferencias', async (req, res) => {
  let transferencias;
  try {
    transferencias = await mostrarTransferencias()
  } catch (error) {
    console.log(error)
  }
  res.json(transferencias)
})

app.post('/transferencia', async (req, res) => {
  const datos = await getForm(req)
  //console.log(datos)
  try {
    await nuevaTransferencia(datos.emisor, datos.receptor, datos.monto)
  }
  catch (error) {
    res.statusCode = 400
    return res.json({ error: error })
  }
  res.json({})
})

app.get('*', (req, res) => {
  res.statusCode = 404
  res.send('Ruta no implementada')
})

app.listen(3000, function () {
  console.log(`Servidor corriendo en http://localhost:3000/`);
});