const { conn, Bookmark, Category } = require('../db');
const express = require('express');
const app = express.Router();


module.exports = app;


app.get('/:id', async(req, res, next)=> {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [ Bookmark ]
    });
    res.send(`
      <html>
        <head>
        </head>
        <body>
          <h1>Bookmarker - ${ category.name }</h1>
          <a href='/'>Home</a>
          <ul>
            ${
              category.bookmarks.map( bookmark => {
                return `
                  <li>
                    ${ bookmark.name }
                  </li>
                `;
              }).join('')
            }
          </ul>
        </body>
      </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});


app.post('/', async(req, res, next)=> {
  try {
    await Category.create(req.body);
    res.redirect('/');
  }
  catch(ex){
    next(ex);
  }
});
