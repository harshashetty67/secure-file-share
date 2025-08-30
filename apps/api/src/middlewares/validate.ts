export const validate = (schema) => (req, res, next) => {
    try {
      req.validated = schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({ error: 'Invalid request', details: err.errors });
    }
  };
