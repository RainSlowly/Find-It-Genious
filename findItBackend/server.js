require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');


const areaSchema = new mongoose.Schema({
  name: String,
  shape: String,
  coords: [Number],
  points: Number,
  founded: Boolean
});

const objectivesSchema = new mongoose.Schema({
  text: String,
  areas : [String]
});

const LevelsSchema = new mongoose.Schema({
    name : String,
    imageUrl : String,
    originalWidth: Number,
    originalHeight: Number ,
    isSpecial: Boolean,
    objectives: [objectivesSchema],
    areas: [areaSchema],
    music:{src:String, type:String},
    foundSFX:{src:String, type:String},
 });

const scoreSchema = new mongoose.Schema({
  userName: String,
  tag: String,
  levelName:Number,
  points: Number,
  date: Date,
});

const npcSchema = new mongoose.Schema({
  character: String,
  name: String,
  phrases:[String],
  img: String,
});

const usersSchema = new mongoose.Schema({
  userName:String,
  tag: String,
  password: String,
  maxLevel:Number,
  stars: [{ level: Number, stars: { type: Number, min: 1, max: 3 } }],
  date:Date,
})

const storySchema = new mongoose.Schema ({
  name:String,
  music:{src:String, type:String},
  sfx:{src:String,type:String},
  dialogue: [{npc:String, img:String,line:String, background:String,sound:{src:String,type:String}}],
  summary:String
})

const finalLevelSchema=new mongoose.Schema({
  name:String,
  music:{src:String, type:String},
  background: [String],
  video:String,
  buttons:[{label:String,angle:Number, method:String}]
})

const charactersSchema=new mongoose.Schema({
  name:String,
  img:[String],
  lv:Number,
  age:String,
  role:String,
  loves:String,
  hates:String,
  knowing:[String]
})

  const level =mongoose.model('level', LevelsSchema);
  const scores = mongoose.model('scores', scoreSchema);
  const Npc = mongoose.model('npc', npcSchema);
  const users=mongoose.model('users', usersSchema);
  const story=mongoose.model('dialogues', storySchema);
  const final=mongoose.model('finalLevel', finalLevelSchema);
  const character=mongoose.model('characters',charactersSchema);


const app = express();
app.use(cors());
app.use(express.json());

app.use('/public', express.static('public'));
const mongoDBURI= process.env.NODE_ENV === 'production'
? process.env.MONGO_ATLAS_URI
: process.env.MONGO_LOCAL_URI;
const PORT = process.env.PORT || 3000;
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

mongoose.connect(mongoDBURI,{ useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log('you are connected to MongoDB');
}).catch((err)=>{
    console.error('failed to connect to mongoDB', err)
});

app.get('/levels', async (req, res) => {
    try {
      const levels = await level.find();
      res.json(levels);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  app.get('/levels/:name', async (req, res) => {
    try {
      const levelName = req.params.name;
      const actualLevel = await level.findOne({ name: levelName }).lean();
  
      if (!actualLevel) {
        return res.status(404).json({ message: 'Level not found' });
      }
  
      res.json(actualLevel);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/finalLevel', async (req, res) => {
    try {
      const finalLv = await final.find().lean();
      res.json(finalLv);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  //gestione della Leaderboard
  app.get('/scores', async (req,res)=>{
    try {
      const score= await scores.find({}).sort({ points: -1 }).exec();
      res.json(score);
    } catch(err) {
      res.status(500).json({message: err.message})
    }
  });

  app.post('/scores', async (req, res) => {
    let { userName, tag, levelName, points } = req.body;
      console.log("Received a POST request to /scores dal frontend");
      console.log("backuandu",req.body);
    
      let newScore = new scores({
        userName,
        tag,
        levelName,
        points,
        date: new Date()
      });
    
    
    try {
      
      console.log("nelbackand",newScore);
      await newScore.save();
      const topScores = await scores.find({ levelName }).sort({ points: -1 }).limit(50).exec();
  
      // Se ci sono più di 15 punteggi, rimuovi il più basso
      if (topScores.length > 15) {
        const lowestScore = topScores[topScores.length - 1];
        await scores.findByIdAndDelete(lowestScore._id);
      }
  
      res.status(201).send('Score added successfully and old scores pruned if necessary.');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

app.get('/scores/:level', async (req, res) => {
  let level = parseInt(req.params.level);;

  if (isNaN(level)) {
    return res.status(400).send('Level must be a number');
  }

  try {
    const Leaderboard = await scores.find({ levelName: level }).sort({ points: -1 }).limit(10).exec();
    res.json(Leaderboard);
    console.log("gli score per livello sono qui");
  } catch (error) {
    res.status(500).send(error.message);
  }
});


//logica per gli npc 
app.get('/npc', async (req, res) => {
  try {
    const npc = await Npc.find();
    res.json(npc);
  } catch (err) {
    console.log('Error retrieving NPCs:', err.message);
    res.status(500).json({ message: err.message });
  }
});
app.get('/npc/:name', async (req, res) => {
  try {
    const npcName = req.params.name;
    const actualNpc = await Npc.findOne({ name: npcName });

    if (!actualNpc) {
      return res.status(404).json({ message: 'NPC not found' });
    }

    res.json(actualNpc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//logica per login e users
app.get('/users', async (req, res) => {
  try {
    const usersList = await users.find().exec();
    res.json(usersList);
  } catch (err) {
    console.log('Error retrieving NPCs:', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.post('/users', async (req, res) => {
  let { userName, tag, password } = req.body;
  tag = tag.toUpperCase();

  try {
      // Cerca l'utente nel database
      let user = await users.findOne({ userName, tag });
      
      if (!user) {
          // Se l'utente non esiste, crea un nuovo utente con password hashata
          const hashedPassword = await bcrypt.hash(password, 10);
          user = new users({ 
              userName, 
              tag, 
              password: hashedPassword, 
              maxLevel: 0, 
              date: new Date(), 
              stars: [] 
          });
          await user.save();
          res.json(user);
      } else {
          // Se l'utente esiste, confronta la password inserita con quella hashata
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              // Se la password non corrisponde, restituisce un messaggio di errore
              return res.status(400).json({ message: 'Invalid credentials' });
          }
          // Se la password è corretta, restituisci i dati dell'utente
          res.json(user);
      }
  } catch (err) {
      console.log('Error handling user:', err.message);
      res.status(500).json({ message: err.message });
  }
});

//logica per lo story e dialogue component
app.get('/story/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const actualStory = await story.findOne({ name: name }).lean();

    if (!actualStory) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json(actualStory);
  } catch (error) {
    console.error('Error:', error); // Aggiungi un log per gli errori
    res.status(500).json({ message: error.message });
  }
});

// logica chiamata characters
app.get('/characters', async (req, res) => {
  try {
    const characters = await character.find();
    res.json(characters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});