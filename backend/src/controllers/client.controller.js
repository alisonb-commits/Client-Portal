const clientModel = require('../models/client.model');

const getAll = async (req, res, next) => {
  try {
    const clients = await clientModel.findAll(req.user.id);
    res.json({ clients });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const client = await clientModel.findById(req.params.id, req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ client });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, email, company, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const client = await clientModel.create({
      name, email, company, status,
      userId: req.user.id,
    });
    res.status(201).json({ client });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, email, company, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const client = await clientModel.update(req.params.id, req.user.id, {
      name, email, company, status: status || 'active',
    });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ client });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await clientModel.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
