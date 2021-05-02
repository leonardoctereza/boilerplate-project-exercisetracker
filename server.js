const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const UserModel = require('./userModel');

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', function (req,res) {
  let username = req.body.username;
  let user = new UserModel({username});
  user.save(function (err,obj) {
    if(err){
      console.log(err);
      res.json({error:'Couldnt save user'});
      return;
    }
    res.json({username:obj.username,_id:obj._id});
  })
})

app.get('/api/users',async function (req,res){
  const users = await UserModel.find({}).select('username _id');
  res.json(users);
});

app.post('/api/users/:id/exercises',async function (req,res) {
  let userId = req.params.id;
  let userExercises = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date? new Date(req.body.date).toDateString():new Date().toDateString()
  };
  let userUpdated = await UserModel.findOneAndUpdate({_id:userId},
    {$push:{exercises:userExercises}},
    {new: true});
  
  res.json({_id:userUpdated._id,
            username:userUpdated.username,
            ...userExercises});
});

app.get('/api/users/:id/logs',async function (req,res) {
  let userId = req.params.id;
  let filters = req.query;
  let userInfo;
  let log;
  userInfo = await UserModel.findById({_id:userId});
  if(filters.limit || filters.from){
    if(filters.limit){
      log = userInfo.exercises.slice(0,filters.limit);
    }
    else{
      log = userInfo.exercises.filter( (e) =>{
        return new Date(e.date) >= new Date(filters.from) && new Date(e.date)<= new Date(filters.to);
      });
    }
  }else{
    log = userInfo.exercises;
  }
  res.json({username:userInfo.username,
  _id:userId,
  log,
  count: userInfo.exercises.length});
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
