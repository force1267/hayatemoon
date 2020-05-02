# hayatemoon

## develop

- clone and install :
```bash
git clone https://github.com/force1267/hayatemoon
yarn install
```

- go to panel and register first admin :
http://localhost:1337/admin

- go to `Users & Premissions` panel and give access to `public` and `authenticated` user roles

- to develop each frontend project put them in `public/`. project will be served to http://localhost:1337

- production api endpoint is http://api.hayatemoon.com but in development its http://localhost:1337. differ them using a variable.
```javascript
// const api = "https://api.hayatemoon.com"
const api = "/" // for development
fetch(`${api}/restaurant`).then(...)
```

- then each time just start :
```bash
yarn develop
```

## production

- go to `Users & Premissions` panel and give access to `public` and `authenticated` user roles

- put production frontend files in `public/ad`, `public/food/`, `public/panel` and `public/restaurant_panel`. content is served to hayatemoon.com, food.hayatemoon.com, etc.

- set eamil templates and api