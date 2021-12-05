require('dotenv').config()

const logger = require('morgan')
const express = require('express')
const errorHandler = require('errorhandler')

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const uaParser = require('ua-parser-js')

const port = 3000
const app = express()
const path = require('path')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Initialize the prismic.io api

const initApi = (req) => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: req
  })
}

// Link Resolver
const linkResolver = (doc) => {
  if (doc.type === 'home') {
    return '/'
  } else if (doc.type === 'about') {
    return '/about'
  } else if (doc.type === 'portfolio') {
    return '/about/' + doc.uid
  }

  // Default to homepage
  return '/';
}


app.use((req, res, next) => {
  // console.log(req.headers)
  const ua = uaParser(req.headers['user-agent'])
  // console.log(ua)
  res.locals.isDesktop = ua.device.type === undefined
  res.locals.isPhone = ua.device.type === 'mobile'
  res.locals.isTablet = ua.device.type === 'tablet'

  res.locals.link = linkResolver
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM;
  next()
})

//=======================All the routes - these can have their own file/folder========================
app.get('/', (req, res) => {
  // const api = await initApi(req)
  // const home = await api.getSingle('home')

  // // console.log(home.data)
  // res.render('pages/home', {home: home.data})

  initApi(req).then(api => {
    api.query(
      Prismic.Predicates.at('document.type', 'home')
    ).then(response => {
      // response is the response object. Render your views here.
      // console.log(response.results[0].data)
      res.render('pages/home', { home: response.results[0].data })
    })
  })

})

app.get('/about', async (req, res) => {
  initApi(req).then(api => {
    api.query(
      Prismic.Predicates.at('document.type', 'about')
    ).then(response =>  {
      // response is the response object. Render your views here.
      // console.log(response.results[0].data.portfolio)
      res.render('pages/about', { portfolioItems: response.results[0].data.portfolio})
    })
  })
})

app.get('/about/:uid', async (req, res) => {
  initApi(req).then(api => {
    api.getByUID('portfolio_item', req.params.uid
    ).then(response =>  {
      // response is the response object. Render your views here.
      console.log(response)
      if(response) {
        res.render('pages/portfolio', {portfolio: response.data})
      } else {
        res.render('pages/Four04')
      }
    })
  })
})

//=====================================Undefined routes error handling==================
app.all('*', async (req, res, next) => {
  res.render('pages/Four04')
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Code 500: Something Went Wrong'
  res.status(statusCode).send(err.message)
})

//=======================Connecting to port====================================
app.listen(process.env.PORT || port, () => {
  console.log(`App listening at http://localhost:${port}`)
})