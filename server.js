const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(require('method-override')('_method'));

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

app.post('/bookmarks', async(req, res, next)=> {
  try {
    const bookmark = await Bookmark.create(req.body);
    res.redirect(`/categories/${bookmark.categoryId}`);
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
    const categories = await Category.findAll();
    res.send(`
      <html>
        <head>
          <style>
            main {
              display: flex;
            }
            main > * {
              flex: 1;
              margin: 1rem;
            }
            form {
              display: flex;
              flex-direction: column;
            }
            input,select,button {
              height: 2rem;

            }
            form > * {
              margin: 1rem;
            }
            li form {
            display: inline;
            }
          </style>
        </head>
        <body>
          <h1>Bookmarker</h1>
          <main>
            <ul>
              ${
                bookmarks.map( bookmark => {
                  return `
                    <li>
                      ${ bookmark.name } 
                      <form method='POST' action='/bookmarks/${bookmark.id}?_method=delete'>
                        <button>x</button>
                      </form>
                      <a href='/categories/${ bookmark.categoryId }'>
                        ${ bookmark.category.name }
                      </a>
                    </li>
                  `;
                }).join('')
              }
            </ul>
            <form method='post' action='/bookmarks'>
              <input placeholder='name' name='name'/>
              <input placeholder='url' placeholder='url'/>
              <select name='categoryId'>
                ${
                  categories.map( category => {
                    return `
                      <option value='${ category.id}'>
                        ${ category.name }
                      </option>
                    `;
                  }).join('')
                }
              </select>
              <button>Create</button>
            </form>
          </main>
        </body>
      </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/bookmarks/:id', async(req, res, next)=> {
  try {
    const bookmark = await Bookmark.findByPk(req.params.id);
    await bookmark.destroy();
    res.redirect('/');
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
