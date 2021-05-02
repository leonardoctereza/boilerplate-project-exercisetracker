const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI,{ useNewUrlParser: true,useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

const userSchema = new mongoose.Schema({
    username: String,
    exercises: {type: Array, properties:{
        description: String,
        duration: Number,
        date: Date
    }}
});
const User = mongoose.model('User',userSchema);

module.exports = User;