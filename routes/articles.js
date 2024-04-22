const express = require('express')
const Article = require('./article')
const userModel = require('./user');
const bcrypt = require('bcryptjs');
const express_session=require('express-session')
const router = express.Router()
router.use(express.static('resources'));

const isAuth = (req, res, next)=>{
    if(req.session.isAuth ){
      next();
    }
    else{
        res.redirect('/login');
    }
}



router.get('/new',isAuth, (req, res) => {
  res.render('articles/new', { article: new Article() })
})

router.get('/contact', (req, res) => {
  res.render('articles/contact', { article: new Article() })
})

router.get('/home',isAuth, (req, res) => {
  res.render('articles/home', { article: new Article()})
})
router.get('/loggin',isAuth, (req, res) => {
  res.render('articles/loggin', { article: new Article()})
})

router.post('/loggin', async (req,res)=>{
  const {email, password} = req.body;

  const user = await userModel.findOne({email});

  if(!user){
      return res.redirect('/articles/loggin');
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if(!isMatch){
      return req.redirect('/articles/loggin');
  }
  req.session.userEmail = email;
  req.session.isAuth = true;
  res.redirect('/articles/home');

})

router.get('/signup', (req, res) => {
  res.render('articles/signup', { article: new Article()})
})

router.post('/signup', async (req, res)=>{
    const{username, email, password}  = req.body;

    let user = await userModel.findOne({email});

    if(user){
      return res.redirect('/register');
    }
    
    const hashedPsw = await bcrypt.hash(password, 12);

    user = new userModel({
        username,
        email,
        password: hashedPsw
    });

    await user.save();
    res.redirect("/articles/loggin");
})



router.get('/index', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  const currentUserEmail = req.session.userEmail;
  res.render('articles/index', { articles: articles, currentUserEmail: currentUserEmail  })
})

router.get('/edit/:id',isAuth, async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})

router.get('/:slug',isAuth, async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  const currentUserEmail = req.session.userEmail;
  res.render('articles/show', { article: article, currentUserEmail: currentUserEmail })
})

router.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    article.createdBy = req.session.userEmail;
 
    try {
      article = await article.save()
      res.redirect(`/articles/${article.slug}`)
    } catch (e) {
      res.render(`articles/${path}`, { article: article })
    }
  }
}

module.exports = router