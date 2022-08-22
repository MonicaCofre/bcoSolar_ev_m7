const pool = require('./config')

pool.connect(error => {
  if (error) {
    console.log(`Error para conectarse a la base de datos ${error}`)
  }
})

//---Funciones calculos balance--->
//---Validaciones --->
function validar(monto_string) {
  // validamos que el monto sea un entero
  let monto = parseInt(monto_string)
  if (isNaN(monto)) {
    throw 'El monto debe ser un número'
  }
  // validamos que el monto sea positivo
  if (monto <= 0) {
    throw 'El monto debe ser mayor a 0'
  }
}
function validarBalace(obj_emisor, monto_string) {
  // validamos que el emisor tenga suficientes fondos
  let monto = parseInt(monto_string)
  if (obj_emisor.rows[0].balance < monto) {
    throw 'El monto a transferir es mayor a su balance'
  }
}
function validarEmisorReceptor(obj_emisor, obj_receptor) {
  // validamos que emisor y receptor no sean la misma persona
  if (obj_emisor.rows[0].id === obj_receptor.rows[0].id) {
    throw 'El receptor no puede ser igual al emisor'
  }


}

//---Funcion getForm para utilizar ajaxs--->
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

//---Funciones Usuario--->
const nuevoUsuario = async (nombre, balance) => {
  const client = await pool.connect()
  let respuesta;
  try {
    respuesta = await client.query('insert into usuarios (nombre, balance) values ($1, $2) returning*', [nombre, balance])
    //console.log(respuesta.rows)
  } catch (error) {
    console.log(error)
  }
  client.release()
}

const mostrarUsuarios = async () => {
  const client = await pool.connect()
  let respuesta;
  try {
    respuesta = await client.query('select * from usuarios')
  } catch (error) {
    console.log(error)
  }
  client.release()
  return respuesta.rows
}

const editarUsuario = async (id, nombre, balance) => {
  const client = await pool.connect()
  try {
    await client.query({
      text: `update usuarios set nombre=$1, balance=$2 where id=$3`,
      values: [nombre, balance, id]
    })
  } catch (error) {
    console.log(error)
  }
  client.release()
}

const eliminarUsuario = async (id) => {
  const client = await pool.connect()
  try {
    await client.query({
      text: `delete from transferencias where emisor = $1 or receptor = $1`,
      values: [id]
    })
    await client.query({
      text: `delete from usuarios where id = $1`,
      values: [id]
    })
  } catch (error) {
    console.log(error)
  }
  client.release()
}
//----Funciones Transferencias--->

const nuevaTransferencia = async (emisor, receptor, monto_string) => {
  const client = await pool.connect()
  validar(monto_string)

  const obj_emisor = await client.query({
    text: `select * from usuarios where nombre= $1`,
    values: [emisor]
  })
  const obj_receptor = await client.query({
    text: `select * from usuarios where nombre= $1`,
    values: [receptor]
  })
  validarBalace(obj_emisor, monto_string)
  validarEmisorReceptor(obj_emisor, obj_receptor)

  try {
    await client.query('insert into transferencias (emisor, receptor, monto) values ($1, $2, $3)',
      [obj_emisor.rows[0].id, obj_receptor.rows[0].id, monto])
    //---- cambios en balances. Al emisor le resto el monto, y al receptor le sumo el monto --->
    const descuento = obj_emisor.rows[0].balance - monto;
    const deposito = obj_receptor.rows[0].balance + monto;
    await client.query(`update usuarios set balance=${descuento} where id=${obj_emisor.rows[0].id}`)
    await client.query(`update usuarios set balance=${deposito} where id=${obj_receptor.rows[0].id}`)

    
  } catch (error) {
    console.log(error)
  }
  client.release()
}

async function mostrarTransferencias() {
  const client = await pool.connect()
  let datos;
  try {
    const mostrarUsuarios = await client.query({
      text: `select transferencias.id, emisores.nombre as Emisor, receptores.nombre as Receptor, Monto, Fecha FROM transferencias
    JOIN usuarios as emisores ON emisor=emisores.id join usuarios as receptores on receptor= receptores.id`,
      rowMode: 'array'
    })
    datos = mostrarUsuarios.rows
  } catch (error) {
    console.log(error)
  }
  client.release()
  return datos
}








module.exports = {
  nuevoUsuario,
  mostrarUsuarios,
  editarUsuario,
  eliminarUsuario,
  nuevaTransferencia,
  mostrarTransferencias,
  getForm
};