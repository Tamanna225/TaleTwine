const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const mongoDBSession = require("connect-mongodb-session")(session)
const Article = require('./routes/article')
const articleRouter = require('./routes/articles')
const userModel = require('./routes/user');
const methodOverride = require('method-override')
const app = express()
app.use(express.static('resources'));

mongoose.connect('mongodb://localhost/blog', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

//user authentication

const store = new mongoDBSession({
  uri:'mongodb://localhost/blog',
  collection:"mysessions",

})


app.use(session({
  secret: "key that will sign cookie",
  resave: false,
  saveUninitialized: false,
  store: store
}))








//for blogs/stories
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.get('/', async (req, res) => {
  
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/loggin', { articles: articles })
})

app.use('/articles', articleRouter)

app.listen(5000)

