const { conn, Bookmark, Category } = require('../db');
const express = require('express');
const app = express.Router();

module.exports = app;

app.post('/', async(req, res, next)=> {
  try {
    const bookmark = await Bookmark.create(req.body);
    res.redirect(`/categories/${bookmark.categoryId}`);
  }
  catch(ex){
    next(ex);
  }
});


app.delete('/:id', async(req, res, next)=> {
  try {
    const bookmark = await Bookmark.findByPk(req.params.id);
    await bookmark.destroy();
    res.redirect('/');
  }
  catch(ex){
    next(ex);
  }
});
