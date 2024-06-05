document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("scrape").addEventListener("click", async () => {
        document.getElementById("links-container").innerHTML = ""; // Clear existing links
        try {
            // Start timing when the button is clicked
            const startTime1 = performance.now();

            // First fetch request
            const responsePromise1 = fetch('/scrape').then(response => table(response, startTime1));

            // Start timing for the second fetch request
            // const startTime2 = performance.now();
            // console.log(`Scraping initiated!`);

            // Second fetch request
            // const responsePromise2 = fetch('/scrape2').then(response => table(response, startTime2));

            // No need to await here, allow responses to be processed independently

        } catch (error) {
            console.error("Error occurred:", error);
            alert("An error occurred. Please check the console for details.");
        }
    });

    document.getElementById("scrape_test").addEventListener("click", async () => {
        try {
            const response = await fetch('/scrape_test');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Response from server:', data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
    

});

async function table(response, startTime) {
    try {
        if (response.ok) {
            // Calculate the time taken to receive the response
            const endTime = performance.now();
            const elapsedTime = endTime - startTime;
            console.log(`Scraping initiated! Time taken: ${elapsedTime} milliseconds`);

            const data = await response.json(); // Extract JSON data from the response

            const total = document.getElementById("total");
            total.textContent = data.total; // Set the total number of links

            const linksContainer = document.getElementById("links-container");

            //-------------------------------------------------------------------
            // Filter out links that do not already exist in the linksContainer
            const uniqueLinks = data.links.filter(link => {
                // Check if there is already an anchor with the same href
                return !linksContainer.querySelector(`a[href="${link.href}"]`);
            });

            // Iterate through the unique links
            for (let i = 0; i < uniqueLinks.length; i++) {
                const link = uniqueLinks[i];
                // Proceed with creating a new anchor
                const anchor = document.createElement("a");
                anchor.href = link.href;
                anchor.textContent = `${i + 1}. ${link.textContent}`;
                anchor.target = "_blank";
                const br1 = document.createElement("br");

                linksContainer.appendChild(anchor);
                linksContainer.appendChild(br1);
            }

        } else {
            throw new Error("Failed to initiate scraping.");
        }
    } catch (error) {
        console.error("Error occurred:", error);
        alert("An error occurred. Please check the console for details.");
    }
}
