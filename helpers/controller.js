const Controller = {
  model: null,
  getAll: () => {
    if (!this.model) throw new Error("Model not found!");
    model.getAll();
  },
  getById: (data) => {
    if (!this.model) throw new Error("Model not found!");
    model.getById(data);
  },
  create: (data) => {
    if (!this.model) throw new Error("Model not found!");
    model.create(data);
  },
};

module.exports = Controller;
