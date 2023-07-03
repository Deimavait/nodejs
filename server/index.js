const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const { authenticate } = require("./middleware");

require("dotenv").config();

const server = express();
server.use(express.json());
server.use(cors());

const mysqlConfig = {
  host: "localhost",
  user: "root",
  password: process.env.DB_PASS,
  database: "bill_app",
};

const userSchema = joi.object({
  full_name: joi.string().trim().min(2).required(),
  email: joi.string().email().trim().lowercase().required(),
  password: joi.string().required(),
});
const dbPool = mysql.createPool(mysqlConfig).promise();

server.get("/groups", authenticate, async (req, res) => {
  console.log(req.user);

  try {
    const [data] = await dbPool.execute(
      `
      SELECT * FROM  \`groups\`
    `,
    );
    return res.status(201).send({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.post("/groups", authenticate, async (req, res) => {
  let payload = req.body;

  try {
    await dbPool.execute(
      `
  INSERT INTO \`groups\` (id, name)
  VALUES (?,?)`,
      [payload.id, payload.name],
    );
    return res.status(201).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.post("/login", async (req, res) => {
  let payload = req.body;

  // Validation
  const loginSchema = joi.object({
    email: joi.string().email().trim().lowercase().required(),
    password: joi.string().required(),
  });

  try {
    payload = await loginSchema.validateAsync(payload);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: "All fields are required" });
  }
  // Checking if email exists

  try {
    const [data] = await dbPool.execute(
      `
    SELECT * FROM users
    WHERE email = ?
    `,
      [payload.email],
    );

    if (!data.length) {
      return res.status(400).send({ error: "Email or Password did not match" });
    }

    const isPasswordMatching = await bcrypt.compare(
      payload.password,
      data[0].password,
    );

    if (isPasswordMatching) {
      const token = jwt.sign(
        {
          email: data[0].email,
          id: data[0].id,
        },
        process.env.JWT_SECRET,
      );
      return res.status(200).send({ token });
    }
    return res.status(400).send({ error: "Email or Password did not match" });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.post("/register", async (req, res) => {
  let payload = req.body;

  try {
    payload = await userSchema.validateAsync(payload);
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const encryptedPassword = await bcrypt.hash(payload.password, 10);
    await dbPool.execute(
      `
        INSERT INTO users (full_name, email, password)
        VALUES (?, ?, ?)
        `,
      [payload.full_name, payload.email, encryptedPassword],
    );
    return res.status(201).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.post("/accounts", authenticate, async (req, res) => {
  let payload = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt_decode(token);

  try {
    await dbPool.execute(
      `
  INSERT INTO accounts (users_id, groups_id)
  VALUES (?,?)`,
      [decoded.id, payload.groups_id],
    );
    const [data] = await dbPool.execute(
      `
      SELECT * FROM bill_app.accounts LEFT JOIN bill_app.groups ON bill_app.accounts.groups_id=bill_app.groups.id WHERE bill_app.accounts.users_id=?;

    `,
      [decoded.id],
    );
    return res.status(201).send({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.get("/accounts", authenticate, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt_decode(token);

  try {
    const [data] = await dbPool.execute(
      `
      SELECT * FROM bill_app.accounts LEFT JOIN bill_app.groups ON bill_app.accounts.groups_id=bill_app.groups.id WHERE bill_app.accounts.users_id=?;

    `,
      [decoded.id],
    );
    return res.status(201).send({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.get("/bills/:group_id", authenticate, async (req, res) => {
  try {
    const [data] = await dbPool.execute(
      `
   SELECT * FROM bill_app.bills WHERE bill_app.bills.groups_id = ?
   `,
      [req.params.group_id],
    );
    return res.status(201).send({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.post("/bills", authenticate, async (req, res) => {
  let payload = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt_decode(token);

  try {
    await dbPool.execute(
      `
  INSERT INTO bills (amount, description, groups_id)
  VALUES (?,?,?)`,
      [payload.amount, payload.description, payload.groups_id],
    );
    const [data] = await dbPool.execute(
      `
      SELECT * FROM bill_app.bills WHERE bill_app.bills.groups_id = ?

    `,
      [payload.groups_id],
    );
    return res.status(201).send({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
});

server.listen(process.env.PORT, () =>
  console.log(`Server is listening to ${process.env.PORT} port`),
);
