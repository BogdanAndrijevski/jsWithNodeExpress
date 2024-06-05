var PORT = process.env.PORT || 3000; // added
const express = require("express");
const app = express();
const puppeteer = require('puppeteer');
const request = require("request");
const cheerio = require("cheerio");

app.use(express.static("public"));

async function scrape() {
    // const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
        headless: 'new',
        // `headless: true` (default) enables old Headless;
        // `headless: 'new'` enables new Headless;
        // `headless: false` enables "headful" mode.
      });
    const page = await browser.newPage();
    await page.goto('https://www.google.com/search?q=asd');

    const results = await page.evaluate(() => {
        const results = [];
        const links = document.querySelectorAll('a'); // Select all anchor elements

        links.forEach(link => {
            const href = link.href; // Get the href attribute value
            const h3 = link.querySelector('h3'); // Find the h3 element within the anchor

            if (h3) {
                const textContent = h3.textContent.trim(); // Get the text content of the h3 element
                results.push({ href, textContent }); // Push href and textContent into results array
            }
        });

        return results;
    });

    await browser.close();

    const response = {
        links: results.map(result => ({
            href: result.href,
            textContent: result.textContent
        })),
        total: results.length
    };

    return response;
}

app.get('/scrape', async (req, res) => {
    try {
        const result = await scrape();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error occurred during scraping:", error);
        res.status(500).send('An error occurred during scraping. Please check the console for details.');
    }
});

function scrape2() {
    // Simulating some data
    const simulatedData = {
        message: "This is a simulated response from the server!",
        timestamp: Date.now()
    };
    return simulatedData;
}

// Your route definition
app.get('/scrape_test', async (req, res) => {
    try {
        const result = await scrape2();
        res.status(200).json(result);
    } catch (error) {
        console.error("Error occurred during scraping:", error);
        res.status(500).send('An error occurred during scraping. Please check the console for details.');
    }
});

app.get('/scrape2', (req, res) => {
    try {
        request('https://www.google.com/search?q=asd', (error, response, html) => {
            if (error) {
                console.error('Error scraping website:', error);
                res.status(500).send('Error scraping website.'); // Send an error response if scraping fails
            } else if (response.statusCode == 200) {

                const $ = cheerio.load(html);
                const results = [];
                $('a').each((index, element) => {
                    const href = $(element).attr('href');
                    const h3 = $(element).find('h3');
                    if (h3.length > 0) {
                        const textContent = h3.text().trim();
                        // Extract the actual URL from the Google search result link
                        const actualUrl = decodeURIComponent(href.split('/url?q=')[1].split('&')[0]);
                        results.push({ href: actualUrl, textContent });
                    }
                });

                const responseData = {
                    links: results,
                    total: results.length
                };

                res.json(responseData); // Send the response object back to the client as JSON
            } else {
                console.error('Unexpected status code:', response.statusCode);
                res.status(500).send('Unexpected status code.'); // Send an error response for unexpected status code
            }
        });
    } catch (error) {
        console.error("Error occurred during scraping:", error);
        res.status(500).send('An error occurred during scraping. Please check the console for details.');
    }
});


app.listen(PORT, () => {
    console.log("listening on port 3000");
})