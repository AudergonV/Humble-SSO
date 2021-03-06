const validator = require('validator');

const BackendError = require('../proto/BackendError');

const pool = require('./pool');
const userWrk = require('./workers/user');
const atWrk = require('./workers/accessToken');
const rtWrk = require('./workers/refreshToken');
const acWrk = require('./workers/authorizationCode');
const clientWrk = require('./workers/client');
const serviceWrk = require('./workers/service');

const getUserById = async id => {
  if(!Number.isInteger(id)) {
    throw new BackendError(401, 'id must be an integer');
  }
  let conn;
  try {
    conn = await pool.getConnection();
    return await userWrk.getUserById(conn, id);
  } catch(err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const getUserByCredentials = async (mail, password) => {
  if(!validator.isEmail(mail)) {
    throw new BackendError(402, 'Invalid email address');
  }
  let conn;
  try {
    conn  = await pool.getConnection();
    return await userWrk.getUserByCredentials(conn, mail, password);
  } catch(err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const createUser = async user => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    const id = await userWrk.createUser(conn, user);
    const result = await userWrk.getUserById(conn, id);
    conn.commit();
    return result;
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const modifyUser = async user => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    const id = await userWrk.modifyUser(conn, user);
    const result = await userWrk.getUserById(conn, id);
    conn.commit();
    return result;
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const deleteUser = async id => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    const result = await userWrk.deleteUser(conn, id);
    conn.commit();
    return result;
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if(conn) conn.end();
  }
}

const getAccessToken = async at => {
  let conn;
  try {
    conn = await pool.getConnection();
    return await atWrk.getAccessToken(conn, at);
  } catch(err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const saveAccessToken = async at => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    await atWrk.saveAccessToken(conn, at);
    const result = await atWrk.getAccessToken(conn, at.accessToken);
    conn.commit();
    return result;
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const getRefreshToken = async rt => {
  let conn;
  try {
    conn = await pool.getConnection();
    return await rtWrk.getRefreshToken(conn, rt);
  } catch(err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const saveRefreshToken = async rt => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    await rtWrk.saveRefreshToken(conn, rt);
    const result = await rtWrk.getRefreshToken(conn, rt.refreshToken);
    conn.commit();
    return result;
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const deleteRefreshToken = async rt => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    const result = await rtWrk.deleteRefreshToken(conn, rt);
    if(result) conn.commit();
    else if(conn) conn.rollback();
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if (conn) conn.end();
  }
};

const getAuthorizationCode = async ac => {
  let conn;
  try {
    conn = await pool.getConnection();
    return await acWrk.getAuthorizationCode(conn, ac);
  } catch (err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const saveAuthorizationCode = async ac => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    await acWrk.saveAuthorizationCode(conn, ac);
    const result = await acWrk.getAuthorizationCode(conn, ac.code);
    conn.commit();
    return result
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const deleteAuthorizationCode = async ac => {
  let conn;
  try {
    conn = await pool.getConnection();
    conn.beginTransaction();
    const result = await acWrk.deleteAuthorizationCode(conn, ac);
    if(result) conn.commit();
    else if(conn) conn.rollback();
  } catch(err) {
    if(conn) conn.rollback();
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const getClient = async (clientid, secret) => {
  let conn;
  try {
    conn = await pool.getConnection();
    return await clientWrk.getClient(conn, clientid, secret);
  } catch(err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const getService = async service => {
  let conn;
  try {
    conn = await pool.getConnection();
    return await serviceWrk.getService(conn, service);
  } catch(err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

const getServices = async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    return await serviceWrk.getServices(conn);
  } catch(err) {
    throw err;
  } finally {
    if(conn) conn.end();
  }
};

// createUser(new User(0, 'test', '', 0, 'test@test.test', 'test@humble.ch', [], 0, 'test')).then(data => {
//   console.log(data);
//   return getUserById(data.id);
// }).then(user => {
//   console.log(user);
//   return getUserByCredentials('test@test.test', 'test');
// }).then(user => console.log(user)).catch(e => console.log(e));

// saveAccessToken(new AccessToken(0, 'test', moment().toDate(), 'test', 1, 4)).then(data => {
//   console.log(data);
//   return getAccessToken('test');
// }).then(at => console.log(at)).catch(e => console.log(e));

// saveRefreshToken(new RefreshToken(0, 'test', moment().toDate(), 'test', 1, 1)).then(data => {
//   console.log(data);
//   return getRefreshToken('test');
// }).then(rt => console.log(rt)).catch(e => console.log(e));

// saveAuthorizationCode(new AuthorizationCode(0, 'test', moment().toDate(), 'test', 'test', 3, 4)).then(data => {
//   console.log(data);
//   return getAuthorizationCode('test');
// }).then(ac => console.log(ac)).catch(e => console.log(e));

module.exports = {
  getUserById,
  getUserByCredentials,
  createUser,
  modifyUser,
  deleteUser,
  getAccessToken,
  saveAccessToken,
  getRefreshToken,
  saveRefreshToken,
  deleteRefreshToken,
  getAuthorizationCode,
  saveAuthorizationCode,
  deleteAuthorizationCode,
  getClient,
  getService,
  getServices
};