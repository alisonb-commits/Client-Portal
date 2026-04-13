const { query } = require('../config/db');

const findAll = async (userId) => {
  const result = await query(
    'SELECT * FROM clients WHERE created_by = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const findById = async (id, userId) => {
  const result = await query(
    'SELECT * FROM clients WHERE id = $1 AND created_by = $2',
    [id, userId]
  );
  return result.rows[0];
};

const create = async ({ name, email, company, status, userId }) => {
  const result = await query(
    `INSERT INTO clients (name, email, company, status, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email || null, company || null, status || 'active', userId]
  );
  return result.rows[0];
};

const update = async (id, userId, { name, email, company, status }) => {
  const result = await query(
    `UPDATE clients
     SET name = $1, email = $2, company = $3, status = $4
     WHERE id = $5 AND created_by = $6
     RETURNING *`,
    [name, email || null, company || null, status, id, userId]
  );
  return result.rows[0];
};

const remove = async (id, userId) => {
  const result = await query(
    'DELETE FROM clients WHERE id = $1 AND created_by = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0];
};

module.exports = { findAll, findById, create, update, remove };
