// importing in express
const express = require('express');
// instantiate express
const app = express();
// middleware that takes everything in body and parses it to json
const bodyParser = require('body-parser');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

// in production, PORT will be set for us. If we're running locally, use 3000
app.set('port', process.env.PORT || 3000);
// store locally the title of app
app.locals.title = 'Palette Picker';
// use this middleware throughout app
app.use(bodyParser.json());
// pull in index.html
app.use(express.static('public'))
// root directory get index.html
app.get('/', (request, response) => {

});

// at the route /api/v1/projects, get this information
app.get('/api/v1/projects/', (request, response) => {
  // select table projects in database
  database('projects').select()
    // return response.status 200 with json projects
    .then(projects => {
      response.status(200).json(projects);
    })
    // if error, return status 500, and return json error
    .catch(error => {
      response.status(500).json({ error });
    });
});

// post at route /api/v1/projects/
app.post('/api/v1/projects/', (request, response) => {
  // get project from what's passed into the request body
  const project = request.body;
  // look through array and use elements as requiredParameter variable
  for (let requiredParameter of ['name']) {
    // if there isn't the required param, resturn error status of 422 and senf error message
    if (!project[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { name: <String> }. You're missing a "${requiredParameter}" property.` });
    }
  }
  // in table projects insert project with id
  database('projects').insert(project, 'id')
    // if okay, send status of 201 and json project object
    .then(proj => {
      const { name } = project;
      
      response.status(201).json({ id: proj[0], name })
    })
    // catch error and return status 500
    .catch(error => {
      response.status(500).json({ error })
    });
});

app.get('/api/v1/palettes', (request, response) => {
  // select palettes table
  database('palettes').select()
    .then(palettes => {
      response.status(200).json(palettes);
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/palettes', (request, response) => {
  const palette = request.body;

  for (let requiredParameter of ['name', 'color_1', 'color_2', 'color_3', 'color_4', 'color_5', 'project_id']) {
    if (!palette[requiredParameter]) {
      return response
        .status(422)
        .send({error: `Expected format: { name: <String>, color_1: <String>, color_2: <String>, color_3: <String>, color_4: <String>, color_5: <String>, project_id: <Integer> }. You're missing a "${requiredParameter}" property.`})
    }
  }

  database('palettes').insert(palette, 'id')
    .then(pal => {
      response.status(201).json({ ...palette, id: pal[0] })
    })
    .catch(error => {
      response.status(500).json({ error })
    });
})

app.get('/api/v1/projects/:id/palettes/', (request, response) => {
  database('palettes').where('project_id', request.params.id).select()
    .then(palettes => {
      if (palettes.length) {
        response.status(200).json(palettes);
      } else {
        response.status(404).json({
          error: `Could not find palettes associated with project id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/palettes/:id', (request, response) => {
  database('palettes').where('id', request.params.id).select()
    .then(palette => {
      if (palette.length) {
        response.status(200).json(palette);
      } else {
        response.status(404).json({
          error: `Could not find palette associated with palette id ${request.params.id}`
        });
      }
    })
    .catch(error => {
      response.status(500).json({ error });
    });
})

app.delete('/api/v1/palettes/', (request, response) => {
  database('palettes').where('id', request.body.id).del()
    .then(palette => {
      response.status(200).json();
    })
    .catch(error => {
      response.status(500).json({ error });
    })
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} server running on port 3000.`)
});

module.exports = app;
