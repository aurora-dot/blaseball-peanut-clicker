const puppeteer = require('puppeteer-extra');
var fs = require('fs');
const cliProgress = require('cli-progress');
const randomUseragent = require('random-useragent');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


async function main() {
    console.log('Blaseball Peanut Clicker!');

    // Load in user credentials

    var credsJson;
    await fs.readFile('./auth.json', 'utf8', function (err, data) {
        if (err) throw err;
        credsJson = JSON.parse(data);
    });


    puppeteer.launch({headless: true, defaultViewport: null,'ignoreHTTPSErrors' : true, 'args': ['--no-sandbox', '--disable-setuid-sandbox']}).then(async browser => {
        console.log('Setting up page...')

        // Create new page and set useragent
        
        var page = await browser.newPage();

        const ua = randomUseragent.getRandom(function (ua) {
            return ua.browserName === 'Firefox';
        });

        await page.setUserAgent(ua);
  
        // Go to website and login using json creds

        const navigationPromise = page.waitForNavigation();
        
        console.log('Navigating to blaseball login and entering creds...')

        await page.goto('https://www.blaseball.com/login');
        await page.setViewport({ width: 939, height: 956 })

        await navigationPromise;

        await page.waitForSelector('.Auth-SignupWrapper > .Modal > form > div:nth-child(1) > .Auth-Input')  
        await page.waitForSelector('.Auth-SignupWrapper > .Modal > form > div:nth-child(2) > .Auth-Input')

        await page.type('input[name=username]', credsJson['username'], {delay: 100})
        await page.type('input[name=password]', credsJson['password'], {delay: 100});
        await page.keyboard.press('Enter');
        
        await navigationPromise;
        console.log('Logged in and started eating peanuts!\n\n---\n\nCurrently Eating...')

        // Check peanut count, and click for given amount, if already zero exit

        await page.waitForSelector('.Navigation-Top > .Navigation-User-Top > .Peanut-Container > .Navigation-CurrencyButton > .Peanut-Line');
        const originalPeanutCount = Number(await page.$eval('.Navigation-Top > .Navigation-User-Top > .Peanut-Container > .Navigation-CurrencyButton > .Peanut-Line', el => el.textContent));
        
        if (originalPeanutCount !== 0) {

            const b1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            b1.start(originalPeanutCount, 0);

            for (i = 0; i < originalPeanutCount; i++) {
                await page.click('.Navigation-Top > .Navigation-User-Top > .Peanut-Container > .Navigation-CurrencyButton > .Peanut-Line');
                await new Promise(r => setTimeout(r, 3000));
                b1.increment();
            }
            console.log('Completed! \/o/');
        } else {
            console.log('Already 0 :)');
        }
    });
};


main();
