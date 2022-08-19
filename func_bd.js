const { Pool } = require("pg");


const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'bancosolar',
  password: '1234',
  min: 3,
  max: 10,
  idleTimeoutMillis: 5000,       // tiempo de espera antes de botar
  connectionTimeoutMillis: 2000, // tiempo de espera para entrar
  port: 5432
}

const pool = new Pool(config)

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

const nuevaTransferencia = async (emisor, receptor, monto) => {
  const client = await pool.connect()

  try {
    const id_emisor = await client.query({
      text: `select id from usuarios where nombre= $1`,
      values: [emisor]
    })
    console.log(id_emisor.rows[0].id)

    const id_receptor = await client.query({
      text: `select id from usuarios where nombre= $1`,
      values: [receptor]
    })

    await client.query('insert into transferencias (emisor, receptor, monto) values ($1, $2, $3)',
      [id_emisor.rows[0].id, id_receptor.rows[0].id, monto])

    client.release()

  } catch (error) {
    console.log(error)
  }
}

async function mostrarTransferencias() {
  const client = await pool.connect()
  try {
    const mostrarUsuarios = await client.query({
      text: `select transferencias.id, emisores.nombre as Emisor, receptores.nombre as Receptor, Monto, Fecha FROM transferencias
    JOIN usuarios as emisores ON emisor=emisores.id join usuarios as receptores on receptor= receptores.id`,
      rowMode: 'array'
    })
    let datos = mostrarUsuarios.rows
    client.release()
    return datos

  } catch (error) {
    console.log(error)
  }
}

//---Funciones calculos balance--->




module.exports = {
  nuevoUsuario,
  mostrarUsuarios,
  editarUsuario,
  eliminarUsuario,
  nuevaTransferencia,
  mostrarTransferencias
};