require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const app = express();

const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json());

morgan.token("post", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  } else {
    return "";
  }
});

morgan.format(
  "postFormat",
  ":method :url :status :res[content-length] - :response-time ms :post"
);
app.use(morgan("postFormat"));
app.use(cors())

app.get("/info", async (req, res) => {
  const persons = await Person.find({})
  const currentDate = new Date().toDateString();
  const currentTime = new Date().toTimeString();
  const info = `
		<p>Phonebook has info for ${persons.length} people</p>
		<p>${currentDate} ${currentTime}</p>
	`;
  res.send(info);
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then(persons => {
		res.json(persons)
	})
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then(person => {
		res.json(person)
	})
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
		return res.status(400).json({ error: 'name or number missing' })
	}

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save().then(savedPerson => {
		res.json(savedPerson)
	})
});

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
