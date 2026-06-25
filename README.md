[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/H6lPFq0J)
# Computing 2 Coursework Submission.
**CID**: [02568041]

References:
AI was used to:
- Help find specific Ramda functions to make parts of the code clearer and easier to write.
- Provide a basic UI starting point so I could focus on building the game logic before refining the design.
- Assist mainly in main.js with things like connecting buttons to functions, adding interactivity, and implementing simple animations.
- Help with implementing the property trading and money handling logic.
- Create a script in package.json to run unit tests.
- Debug issues with the JSON configuration so the project and tests would run correctly.

Other notes:

Icons were added using the Windows emoji picker (Windows + .).
The Fisher–Yates shuffle algorithm was used for randomising arrays, based on examples from online sources such as https://dev.to/tanvir_azad/fisher-yates-shuffle-the-right-way-to-randomize-an-array-4d2p
The project Zombie Siege was used as a reference when writing unit tests, especially for the TestHelpers file.

## Checklist
### Install dependencies locally
This template relies on a a few packages from the Node Package Manager, npm.
To install them run the following commands in the terminal.
```properties
npm install
```
These won't be uploaded to your repository because of the `.gitignore`.
I'll run the same commands when I download your repos.

### Game Module – API
*You will produce an API specification, i.e. a list of function names and their signatures, for a Javascript module that represents the state of your game and the operations you can perform on it that advances the game or provides information.*

- [ ] Include a `.js ` module file in `/web-app` containing the API using `jsdoc`.
- [ ] Update `/jsdoc.json` to point to this module in `.source.include` (line 7)
- [ ] Compile jsdoc using the run configuration `Generate Docs`
- [ ] Check the generated docs have compiled correctly.

### Game Module – Implementation
*You will implement, in Javascript, the module you specified above. Such that your game can be simulated in code, e.g. in the debug console.*

- [ ] The file above should be fully implemented.

### Unit Tests – Specification
*For the Game module API you have produced, write a set of unit tests descriptions that specify the expected behaviour of one aspect of your API, e.g. you might pick the win condition, or how the state changes when a move is made.*

- [ ] Write unit test definitions in `/web-app/tests`.
- [ ] Check the headings appear in the Testing sidebar.

### Unit Tests – Implementation
*Implement in code the unit tests specified above.*

- [ ] Implement the tests above.

### Web Application
*Produce a web application that allows a user to interface with your game module.*

- Implement in `/web-app`
  - [ ] `index.html`
  - [ ] `default.css`
  - [ ] `main.js`
  - [ ] `Imperium.js`
  - [ ] `gameConfig.js`

### Finally
- [ ] Push to GitHub.
- [ ] Sync the changes.
- [ ] Check submission on GitHub website.
