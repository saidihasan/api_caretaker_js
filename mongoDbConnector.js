const mongodb = require("mongodb");

class MongoDbConnector {
  constructor(config) {
    Object.assign(this, { config });
  }

  connect() {
    const { host, name } = this.config;
    const options = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    };

    mongodb.MongoClient.connect(host, options, (err, client) => {
      if (err) {
        console.log("Error : " + err);
      } else {
        console.log("Successfully connected to DB");
        const db = client.db(name);
        Object.assign(this, { db, client });
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.client.close();
    }
    console.log("Disconnected from DB successfully!");
  }

  async insertOne(collection, data) {
    try {
      const res = await this.db.collection(collection).insertOne(data);
      const textRes = !res.result
        ? `Successfully transfer data to mongodb`
        : `Failed to transfer data`;
      console.log(textRes);
      return textRes;
    } catch (err) {
      throw err;
    }
  }

  async find(collection, filter) {
    try {
      const res = await this.db.collection(collection).find(filter);
      return res.toArray();
    } catch (err) {
      throw err;
    }
  }

  async updateOne(collection, filter, data) {
    try {
      await this.db
        .collection(collection)
        .updateOne(filter, { $set: data }, function (err, res) {
          if (err) throw err;
          console.log(res);
        });
    } catch (err) {
      throw err;
    }
  }

  async deleteOne(collection, filter) {
    try {
      await this.db
        .collection(collection)
        .deleteOne(filter, function (err, res) {
          if (err) throw err;
          console.log(res);
        });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = MongoDbConnector;
