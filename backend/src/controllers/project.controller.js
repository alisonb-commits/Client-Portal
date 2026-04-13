const projectModel = require('../models/project.model');
const clientModel = require('../models/client.model');

const getAll = async (req, res, next) => {
  try {
    const projects = await projectModel.findAll(req.user.id);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const project = await projectModel.findById(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, status, clientId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!clientId) return res.status(400).json({ error: 'Client ID is required' });

    // Make sure the client belongs to this user
    const client = await clientModel.findById(clientId, req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const project = await projectModel.create({ title, description, status, clientId });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const project = await projectModel.update(req.params.id, req.user.id, {
      title, description, status: status || 'pending',
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const deleted = await projectModel.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove };
