import http from 'http';
import puppeteer from 'puppeteer';

http
  .createServer(async function (_req, res) {
    const buffer = await puppeteer
      .launch({
        defaultViewport: {
          width: 1200,
          height: 630,
        },
      })
      .then(async (browser) => {
        const page = await browser.newPage();
        await page.goto('https://aeternum-map.gg');
        const buffer = await page.screenshot();
        await browser.close();
        return buffer;
      });

    res.write(buffer); //write a response to the client
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
