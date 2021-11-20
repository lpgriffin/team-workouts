const app = require("../server.js"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
// const router = require("../routes/api/users.js");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoURI = require("../config/keys.js").mongoURI;
const validateRegisterInput = require("../validation/register.js");
// const validateLoginInput = require("../validation/login.js");

mongoose.Promise = global.Promise;

it("Testing to see if Jest works", () => {
  expect(1).toBe(1);
});

beforeAll(async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
  });

  mongoose.connection.on("error", () => {
    throw new Error(`unable to connect to database: `);
  });
});

app.get("/test", async (req, res) => {
  res.json({ message: "pass!" });
});

it("gets the test endpoint", async () => {
  const response = await request.get("/test");

  expect(response.status).toBe(200);
  expect(response.body.message).toBe("pass!");
});

const User = require("../models/userModel.js"); // Link to user model

app.post("/signup", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    console.log(errors);
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      console.log("Email already exists");
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
  // const { name, email, password, password2 } = req.body;
  // //router.post("/register").send(req.body);
  // const user = new User({ name, email, password, password2 });
  // const ret = await user.save();
  // res.json(ret);
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

it("Should not save user to database because email exists already", async () => {
  const res = await request.post("/signup").send({
    name: "test0",
    email: "testing0@gmail.com",
    password: "pass123",
    password2: "pass123",
  });
  const res2 = await request.post("/signup").send({
    name: "test0",
    email: "testing0@gmail.com",
    password: "pass123",
    password2: "pass123",
  });
  const status = await JSON.parse(res2.status);
  expect(status).toBe(400);
});

it("Should not save user to database because password too short", async () => {
  const res = await request.post("/signup").send({
    name: "test2",
    email: "testing2@gmail.com",
    password: "pass",
    password2: "pass",
  });
  const user = await User.findOne({ email: "testing2@gmail.com" });
  expect(user).toBe(null);
});

it("Should not save user to database because passwords don't match", async () => {
  const res = await request.post("/signup").send({
    name: "test3",
    email: "testing3@gmail.com",
    password: "pass123",
    password2: "pass124",
  });
  const user = await User.findOne({ email: "testing3@gmail.com" });
  expect(user).toBe(null);
});

it("Should not save user to database because password fields are empty", async () => {
  const res = await request.post("/signup").send({
    name: "test4",
    email: "testing4@gmail.com",
  });
  const user = await User.findOne({ email: "testing4@gmail.com" });
  expect(user).toBe(null);
});

it("Should not save user to database because name field is empty", async () => {
  const res = await request.post("/signup").send({
    email: "testing5@gmail.com",
    password: "pass123",
    password2: "pass123",
  });
  const user = await User.findOne({ email: "testing5@gmail.com" });
  expect(user).toBe(null);
});

it("Should not save user to database because email is invalid", async () => {
  const res = await request.post("/signup").send({
    name: "test6",
    email: "testing6",
    password: "pass123",
    password2: "pass123",
  });
  const user = await User.findOne({ email: "testing6@gmail.com" });
  expect(user).toBe(null);
});

it("Should not save user to database because email field is empty", async () => {
  const res = await request.post("/signup").send({
    name: "test7",
    password: "pass123",
    password2: "pass123",
  });
  const user = await User.findOne({ email: "testing7@gmail.com" });
  expect(user).toBe(null);
});

afterAll(async () => {
  await User.deleteMany();
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.log(err);
  }
});

// const User = require("../models/userModel.js");
// const bcrypt = require("bcryptjs");

// describe("User Password Authentication", () => {
//   //implent soon
// });
