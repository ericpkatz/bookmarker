const express = require('express');
const app = express();

const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/bookmarker');

const Category = conn.define('category', {
  name: {
    type: Sequelize.STRING
  }
});

const Bookmark = conn.define('bookmark', {
  name: {
    type: Sequelize.STRING
  },
  url: {
    type: Sequelize.STRING
  }
});

Bookmark.belongsTo(Category);
Category.hasMany(Bookmark);

app.get('/categories/:id', async(req, res, next)=> {
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
          <ul>
            ${
              category.bookmarks.map( bookmark => {
                console.log(bookmark);
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

app.get('/', async(req, res, next)=> {
  try {
    const bookmarks = await Bookmark.findAll({
      include: [ Category ]
    });
    res.send(`
      <html>
        <head>
        </head>
        <body>
          <h1>Bookmarker</h1>
          <ul>
            ${
              bookmarks.map( bookmark => {
                return `
                  <li>
                    ${ bookmark.name } 
                    <a href='/categories/${ bookmark.categoryId }'>
                      ${ bookmark.category.name }
                    </a>
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

const init = async()=> {
  try {
    await conn.sync({ force: true });
    const [ coding, search, jobs ] = await Promise.all(
      ['coding', 'search', 'jobs'].map( name => Category.create({name}))
    );
    const bookmarkData = [
      {
        name: 'Google',
        categoryId: search.id,
        url: 'https://www.google.com/'
      },
      {
        name: 'Indeed',
        categoryId: jobs.id,
        url: 'https://www.indeed.com/'
      },
      {
        name: 'StackOverflow',
        categoryId: coding.id,
        url: 'https://www.stackoverflow.com/'
      },
      {
        name: 'LinkedIn',
        categoryId: jobs.id,
        url: 'https://www.linkedin.com/'
      },
      {
        name: 'MDN',
        categoryId: coding.id,
        url: 'https://developer.mozilla.org'
      }
    ];
    await Promise.all(
      bookmarkData.map( bookmark => Bookmark.create(bookmark))
    );
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  }
  catch(ex){
    console.log(ex);
  }
};

init();
