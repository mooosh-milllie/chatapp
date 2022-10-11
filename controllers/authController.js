const bcrypt = require('bcrypt');
const pool = require('../utils/db');
const CONFIG = require('../utils/config');
const {v4: uuidv4} = require('uuid')

module.exports.initialLoginCheck = async (req, res) => {
  console.log('Na Wa')
  if (req.session?.user && req.session.user?.username) {
    console.log("loggedIn");
    return res.json({loggedIn: true, username: req.session.user.username})
  }
  res.json({loggedIn: false})
}


module.exports.userLogin = async(req, res) => {
  const body = req.body;
  const getUserQuery = await pool.query("SELECT * FROM users WHERE username=$1", [body.username]);

  if (getUserQuery.rowCount === 0) {
    return res.json({loggedIn: false, status: 'wrong username or password'});
  }
  const comparePassword = await bcrypt.compare(body.password, getUserQuery.rows[0].passwordhash);
  if(!comparePassword) {
    return res.json({loggedIn: false, status: 'wrong username or password'});
  }
  req.session.user = {
    username: getUserQuery.rows[0].username,
    id: getUserQuery.rows[0].id,
    userid: getUserQuery.rows[0].userid
  }
  res.json({loggedIn: true, username: getUserQuery.rows[0].username})
}


module.exports.userSignUp = async(req, res) => {
  const body = req.body;
  const existingUser = await pool.query("SELECT username FROM users WHERE username=$1", [body.username]);
  console.log('Existing User', existingUser.rows[0])
  if (existingUser.rowCount !== 0) {
    console.log('Y+User already exists')
    return res.json({loggedIn: false, status: 'Username taken'});
  }
  const salt = await bcrypt.genSalt(CONFIG.SALT_ROUND);
  const hashPassword = await bcrypt.hash(body.password, salt);

  const saveNewUserQuery = await pool.query("INSERT INTO users(username, passwordhash, userid) values($1, $2, $3) RETURNING username, userid",
  [body.username, hashPassword, uuidv4()]);
  console.log("Save New User", saveNewUserQuery.rows);
  req.session.user = {
    username: saveNewUserQuery.rows[0].username,
    id: saveNewUserQuery.rows[0].id,
    userid: saveNewUserQuery.rows[0].userid
  }
  res.json({loggedIn: true, username: req.query.username})
}