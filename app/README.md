# svg2png

api server deployed as aws lambda on vercel

```sh
# development
npm run prepare:fonts
npm install
npm run dev

# example
curl http://127.0.0.1:3000/svg2png -d '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 900 600"><rect fill="#fff" height="600" width="900"/><circle fill="#bc002d" cx="450" cy="300" r="180"/></svg>' > test.png
curl http://127.0.0.1:3000/svg2png -d @./misc/examples/test.svg > ./misc/examples/test.png

# deployment
vercel projects add svg2png-hiro18181
vercel link -p svg2png-hiro18181
npm run deploy
npm run deploy:production
```
