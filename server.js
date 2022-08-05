const { conn, Bookmark, Category } = require('./db');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(require('method-override')('_method'));

app.use('/categories', require('./routes/categories'));
app.use('/bookmarks', require('./routes/bookmarks'));

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
            <div>
              <form method='POST' action='/categories'>
                <input name='name' placeholder='name' />
                <button>Create Category</button>
              </form>
              <form method='post' action='/bookmarks'>
                <input placeholder='name' name='name'/>
                <input placeholder='url' placeholder='url' name='url'/>
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
                <button>Create Bookmark</button>
              </form>
            </div>
          </main>
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
