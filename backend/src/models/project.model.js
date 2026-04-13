const { query } = require('../config/db');

const findAll = async (userId) => {
  const result = await query(
    `SELECT p.*, c.name AS client_name
     FROM projects p
     JOIN clients c ON p.client_id = c.id
     WHERE c.created_by = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result.rows;
};

const findById = async (id, userId) => {
  const result = await query(
    `SELECT p.*, c.name AS client_name
     FROM projects p
     JOIN clients c ON p.client_id = c.id
     WHERE p.id = $1 AND c.created_by = $2`,
    [id, userId]
  );
  return result.rows[0];
};

const create = async ({ title, description, status, clientId }) => {
  const result = await query(
    `INSERT INTO projects (title, description, status, client_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description || null, status || 'pending', clientId]
  );
  return result.rows[0];
};

const update = async (id, userId, { title, description, status }) => {
  const result = await query(
    `UPDATE projects p
     SET title = $1, description = $2, status = $3
     FROM clients c
     WHERE p.client_id = c.id AND p.id = $4 AND c.created_by = $5
     RETURNING p.*`,
    [title, description || null, status, id, userId]
  );
  return result.rows[0];
};

const remove = async (id, userId) => {
  const result = await query(
    `DELETE FROM projects p
     USING clients c
     WHERE p.client_id = c.id AND p.id = $1 AND c.created_by = $2
     RETURNING p.id`,
    [id, userId]
  );
  return result.rows[0];
};

module.exports = { findAll, findById, create, update, remove };
