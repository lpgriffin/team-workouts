const app = require("../server.js"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const validateLoginInput = require("../validation/login.js");
const validateRegisterInput = require("../validation/register.js");

mongoose.Promise = global.Promise;

it("Testing to see if Jest works", () => {
  expect(1).toBe(1);
});

beforeAll(async () => {
  await mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
  });

  mongoose.connection.on("error", () => {
    throw new Error(`unable to connect to database: `);
  });
});
const User = require("../models/userModel.js"); // Link to user model

app.post("/signup", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    console.log(errors);
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        newUser.salt = salt;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

app.post("/login", async (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    console.log(errors);
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      console.log("Email not found");
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        console.log("Password incorrect");
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

it("Should save user to database", async () => {
  const res = await request.post("/signup").send({
    name: "test",
    email: "testing@gmail.com",
    password: "pass123",
    password2: "pass123",
  });
  const user = await User.findOne({ email: "testing@gmail.com" });
  expect(user.name).toBeTruthy();
  expect(user.email).toBeTruthy();
});

it("Should login correctly", async () => {
  const res = await request.post("/login").send({
    email: "testing@gmail.com",
    password: "pass123",
  });
  const bool = await JSON.parse(res.error);
  expect(bool).toBe(false);
});

it("Should not login because incorrect password", async () => {
  const res = await request.post("/login").send({
    email: "testing@gmail.com",
    password: "pass",
  });
  const status = await JSON.parse(res.status);
  expect(status).toBe(400);
});

it("Should not login because user doesn't exist", async () => {
  const res = await request.post("/login").send({
    email: "testing2@gmail.com",
    password: "pass123",
  });
  const status = await JSON.parse(res.status);
  expect(status).toBe(404);
});

it("Should not login because email is invalid", async () => {
  const res = await request.post("/login").send({
    email: "testing2",
    password: "pass123",
  });
  const status = await JSON.parse(res.status);
  expect(status).toBe(400);
});

it("Should not login because email field is empty", async () => {
  const res = await request.post("/login").send({
    password: "pass123",
  });
  const status = await JSON.parse(res.status);
  expect(status).toBe(400);
});

it("Should not login because password field is empty", async () => {
  const res = await request.post("/login").send({
    email: "testing@gmail.com",
  });
  const status = await JSON.parse(res.status);
  expect(status).toBe(400);
});

afterAll(async () => {
  await User.deleteMany();
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
});

// // const User = require("../models/userModel.js");
// // const bcrypt = require("bcryptjs");

// // describe("User Password Authentication", () => {
// //   //implent soon
// // });
