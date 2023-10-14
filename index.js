require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const app = express();

const Person = require('./models/person')

app.use(express.static('dist'))
app.use(express.json());

const requestLogger = (req, res, next) => {
	console.log('Method:', req.method);
	console.log('Path:', req.path)
	console.log('Body:', req.body);
	console.log('---');
	next()
}
app.use(requestLogger)

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

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
		.then(person => {
			if (person) {
				res.json(person)
			} else {
				res.status(404).end()
			}
		})
		.catch(error => next(error))
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

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(result => {
			res.status(204).end()
		})
		.catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
	const { name, number } = req.body

	const person = {
		name: body.name,
		number: body.number
	}

	Person.findByIdAndUpdate(req.params.id, person, { new: true })
		.then(updatedPerson => {
			res.json(updatedPerson)
		})
		.catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
	console.error(error.message)

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message })
	}
	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
