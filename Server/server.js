const puppeteer = require('puppeteer');        // to interact with the page 
const { performance } = require('perf_hooks'); // to measure time
const localtunnel = require('localtunnel');    // to open port
const { Server } = require('socket.io');       // to iteract with the client
const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
const colors = require('colors');
const http = require('http')

// cluster implementation
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// Setting delay with units in seconds         
const delay = (n) => new Promise(r => setTimeout(r, n * 1000));


// add docstring
function getRandomFloat(min, max, decimals) {
    return (Math.random() * (max - min) + min).toFixed(decimals);
}


var logged_users_ids = [];


// Login information
var login_information = {
    relja: [["relja12345", "Relja15052002"]/*, ["somi333", "srbija333"]*/],
    somi: [["debadeba", "srbija1"], ["Fedor333", "borac123"], ["teica123", "tea12345"], ["djordjeristic", "DjordjeR81"]],
    djordje: [["teica123", "tea12345"], ["relja12345", "Relja15052002"]],
    fr: [["djordjeristic", "DjordjeR81"]]
};

var username__; // will hold the the user's username

// initializing a variable for each browser
var browser1, browser2, browser3, browser4;
var page1, page2, page3, page4;

const array_of_browsers = [browser1, browser2, browser3, browser4];
const array_of_pages = [page1, page2, page3, page4];

var array_of_offers = []; // array of all offers chosen by the user
var list_of_matches = []; // list of all active matches


// Initializing a master process
if (cluster.isMaster) {
    console.log("------------------------------------------------------");
    console.log(`Master ${process.pid} is running`.green);
    console.log("------------------------------------------------------");

    const httpServer = http.createServer();

    // setup sticky sessions
    setupMaster(httpServer, {
        loadBalancingMethod: "least-connection",
    });

    // setup connections between the workers
    setupPrimary();

    // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
    cluster.setupPrimary({
        serialization: "advanced",
    });

    //httpServer.listen(3000,"192.168.0.28");
    httpServer.listen(3000);

    (async () => {
        const tunnel = await localtunnel({
            subdomain: "rews",
            port: 3000
        });
        console.log("------------------------------------------------------");
        console.log(`Server available at: ${tunnel.url}`);
        console.log("------------------------------------------------------");
    })();


    for (let i = 0; i < numCPUs; i++) {
        cluster.fork(); // fork numCPU workers
    }

    cluster.on("exit", (worker) => {
        // if a worker dies, fork a new one
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });

} else { // if it's a worker process

    console.log(`Worker ${process.pid} started`);

    const httpServer = http.createServer(); // create a new http server
    const io = new Server(httpServer);

    // use the cluster adapter
    io.adapter(createAdapter());

    // setup connection with the primary process
    setupWorker(io);


    io.on('connection', async (socket) => {

        // Number of browsers
        var number_of_browsers;
        // Name of the match we want to bet on
        var match_title;
        // Boolean to store whether user is logged in or not
        var is_logged_in = false;
        // Variable to store the current selected site (the base is Wwin, will change to Meridian on user's click)
        var current_chosen_site = "Wwin";

        // When a new Client connection is opened.
        console.log(`Worker ${process.pid} | New socket connection: ${colors.yellow(socket.id)}`)

        // Sending a message to CLIENT that they have connected
        socket.emit('connected', socket.id)

        socket.on('disconnect', async function () {
            // When a Client connection is closed.

            // Removing the user from the array of logged in users
            if (is_logged_in) {
                var index = logged_users_ids.indexOf(socket.id)
                logged_users_ids.splice(index, 1)
                // closing all browsers that user had open
                for (i = 0; i < login_information[username__].length; i++) {
                    await array_of_browsers[i].close()
                }
                console.log(`W ${process.pid} | ${colors.red(username__)} (ID: ${colors.red(socket.id)}) disconnected. Closed all his browsers.`)
            }
            else {
                // if user was not logged in
                console.log(`W ${process.pid} | User disconnected. ID: ${colors.red(socket.id)}`)
            }
        });


        // CHANGE SITE BUTTON
        socket.on('site_chosen', async (site_chosen) => {
            // if user chooses a different site
            current_chosen_site = site_chosen;
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} changed site to ${colors.cyan(current_chosen_site)}`)
            socket.emit('site_chosen_received')
        });


        // LOGIN BUTTON
        socket.on('login', async (username) => {
            // if user clicks on the login button
            username__ = username
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} has attempted to log in to: ${colors.brightGreen(username)}`)
            // If the username is in the array of usernames and the user is not already logged in
            if (username in login_information && logged_users_ids.includes(socket.id) == false) {

                var index_of_match = 0;

                logged_users_ids.push(socket.id) // adding the user to the array of logged in users
                number_of_browsers = login_information[username].length; // setting the number of browsers to the number of accounts the user has
                socket.emit('login_successful', username, number_of_browsers); // sending a message to the client that the login was successful 
                console.log(`W ${process.pid} | ID: ${colors.brightGreen(socket.id)} has successfully logged in to: ${colors.brightGreen(username)}`)


                // for each account the user has open the browser and repeat the following same procedure
                for (i = 0; i < number_of_browsers; i++) {

                    // opening a browser
                    // headless: false, open the GUI so that the user can see what's happening
                    // headless: true, no GUI, the user can't see what's happening (faster)
                    array_of_browsers[i] = await puppeteer.launch({ headless: false, args: ['--disable-dev-shm-usage'], });
                    array_of_pages[i] = await array_of_browsers[i].newPage();

                    // open the page
                    await array_of_pages[i].goto('https://wwin.com/#/login', { waitUntil: "domcontentloaded" });

                    // wait for the page to load and choose #loginFrame
                    const elementHandle = await array_of_pages[i].waitForSelector('#loginFrame');
                    const frame = await elementHandle.contentFrame();
                    await frame.waitForSelector('#podatakKorisnik')
                    const user_name = await frame.$('#podatakKorisnik');
                    const password = await frame.$('#podatakUlaz');
                    await user_name.type(login_information[username][i][0]);
                    await password.type(login_information[username][i][1]);


                    index_of_match = 0;


                    await array_of_pages[i].setViewport({
                        width: 1500,
                        height: 1000
                    });


                    await Promise.all([
                        array_of_pages[i].waitForNavigation(),
                        array_of_pages[i].keyboard.press('Enter'),
                    ]);


                    await array_of_pages[i].goto('https://wwin.com/live/#/');

                    await delay(.1)

                    // Deselect all the football matches
                    var click_football = await array_of_pages[i].waitForSelector("#root > div > div.App > div.live-layout > div.live-layout__size > div > div > div.nav-vertical > div.nav-vertical-sports > div > div:nth-child(1) > div.nav-vertical-item__icons.active > span")
                    await click_football.click()


                    // Find the index of the match the user selected
                    for (j = 0; j < list_of_matches.length; j++) {

                        if (list_of_matches[j] == match_title) {
                            index_of_match = j;
                        }
                    }

                    index_of_match += 2 // site peculiarity     

                    // Creating selector and clicking on match
                    let match_selector = "#root > div > div.App > div.live-layout > div.live-layout__size > div > div > div.live-layout__sport-main-panels > div.sport-main-panel.wclay > div.sport-main-panel__sport_wrapper > div:nth-child(" + index_of_match.toString() + ") > div > div.live-match-left-content"
                    let found_match = await array_of_pages[i].waitForSelector(match_selector) // wait for the match selector to load
                    await found_match.click()
                    await delay(0.5)
                    console.log(`W ${process.pid} | ${colors.brightGreen(username)} logged in to  |  WWin name: ${colors.brightYellow(login_information[username][i][0])}  |  Wwin password: ${colors.brightYellow(login_information[username][i][1])}`)
                    socket.emit('page_logged_in', (login_information[username][i][0])) // sending a message to the client that the login was successful
                }

                // Letting the Client know USERNAME has been received
                socket.emit('login_finished', (number_of_browsers));
                console.log(`W ${process.pid} | ID: ${colors.brightGreen(socket.id)} has finished logging in to: ${colors.brightGreen(username)}`)
                is_logged_in = true;
            } else { // if the username is not in the array of usernames

                if (!(username in login_information) || logged_users_ids == 0) {
                    console.log(`W ${process.pid} | ${colors.red(username)} ${colors.brightRed("not found.")}`)
                    socket.emit('username_not_found', (username));
                }
                else // if the user is already logged in
                {
                    console.log(colors.red(username) + colors.brightRed(" already logged in."))
                    socket.emit('username_logged_in', (username));
                }

            }
        })

        // LEFT BUTTON
        socket.on('left_button', async () => {
            // if the user clicks on the left button
            console.log(`W ${process.pid} | ${colors.brightGreen(username__)} pressed LEFT/OVER/YES button.`)

            bets_to_be_placed = [] 
            for (i = 0; i < number_of_browsers; i++) {
                var money = await array_of_pages[i].$$eval("#novac", (money) =>
                    money.map((option) => option.textContent));
                var money_value = parseFloat(money[0])
                if (money_value > 45) { money_value = 45 }
                //bets_to_be_placed.push(Math.floor(money_value * getRandomFloat(0.90, 1, 2)))
                bets_to_be_placed.push(0.1) // this is the smallest possible bet often used for testing purposes
            }

            array_of_place_bets = []
            var offer = array_of_offers[index_of_offer]

            var array_of_functions_1 = [
                function () { place_bet(socket, 1, offer, 0, bets_to_be_placed[0]) },
                function () { place_bet(socket, 1, offer, 1, bets_to_be_placed[1]) },
                function () { place_bet(socket, 1, offer, 2, bets_to_be_placed[2]) },
                function () { place_bet(socket, 1, offer, 3, bets_to_be_placed[3]) }
            ]

            var sliced_array_of_functions = array_of_functions_1.splice(0, number_of_browsers)

            for (i = 0; i < sliced_array_of_functions.length; i++) {
                array_of_place_bets.push(sliced_array_of_functions[i]());
            }


            await Promise.all([array_of_place_bets])


            // Letting the Client know LEFT has been received
            socket.emit('left_button_received');
        })


        // RIGHT BUTTON
        socket.on('right_button', async () => {
            bets_to_be_placed = []
            for (i = 0; i < number_of_browsers; i++) {
                var money = await array_of_pages[i].$$eval("#novac", (money) =>
                    money.map((option) => option.textContent));
                var money_value = parseFloat(money[0])
                if (money_value > 45) { money_value = 45 }
                //bets_to_be_placed.push(Math.floor(money_value * getRandomFloat(0.8, 1, 2)))
                bets_to_be_placed.push(0.1) // this is the smallest possible bet often used for testing purposes
            }

            array_of_place_bets = []
            var offer = array_of_offers[index_of_offer]

            var array_of_functions_2 = [
                function () { place_bet(socket, 2, offer, 0, bets_to_be_placed[0]) },
                function () { place_bet(socket, 2, offer, 1, bets_to_be_placed[1]) },
                function () { place_bet(socket, 2, offer, 2, bets_to_be_placed[2]) },
                function () { place_bet(socket, 2, offer, 3, bets_to_be_placed[3]) }
            ]

            var sliced_array_of_functions = array_of_functions_2.splice(0, number_of_browsers)

            for (i = 0; i < sliced_array_of_functions.length; i++) {
                array_of_place_bets.push(sliced_array_of_functions[i]());
            }

            await Promise.all([array_of_place_bets])
            console.log(`W ${process.pid} | ${colors.brightGreen(username__)} pressed RIGHT/UNDER/NO button.`)
            // Letting the Client know LEFT has been received
            socket.emit('right_button_received');
        })


        // OFFERS BUTTON
        socket.on('offers_request', async () => {

            console.log(`W ${process.pid} | ${colors.brightGreen(username__)} requested offers. Sending offers.`)

            var titles_of_bets = await find_offer_titles(0) // finding the titles of the bets currently available
            var names_of_bets = await find_offer_names(0)   // finding the names of the bets currently available

            for (i = 0; i < titles_of_bets.length; i++) { 
                if (titles_of_bets[i] == "") {
                    titles_of_bets.splice(i, 1)
                    names_of_bets.splice(i, 1)
                }
            }

            // Sending current offers to the client
            socket.emit('current_offers', titles_of_bets, names_of_bets);
        })


        // Receive the offer that the user wants to bet on
        socket.on('offer_chosen', async (offer_received_title, offer_received_name) => {
            console.log(`W ${process.pid} | ${colors.brightGreen(username__)} chose offer. Name: ${colors.brightCyan(offer_received_name)} | Title: ${colors.brightCyan(offer_received_title)}`)

            array_of_offers.push(offer_received_title) // adding the offer user wants to bet on to the array of offers
            index_of_offer = array_of_offers.length == 0 ? 0 : array_of_offers.length - 1


            // Letting the Client know OFFER has been received
            socket.emit('offer_received_name', offer_received_name);
        })



        // When the client requests to see the currently available matches
        socket.on('matches_request', async () => {
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} requested matches. Sending matches.`)

            var titles_of_matches = await find_matches(0) // finding the titles of the matches currently available

            // Sending current matches to the client
            socket.emit('current_matches', titles_of_matches);
        })

        // Receiving the match that the user wants to bet on
        socket.on('match_chosen', async (match_title_received) => {
            match_title = match_title_received
            
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} chose match: ${colors.brightCyan(match_title)}`)
            socket.emit('match_clicked_received', match_title); // Letting the Client know MATCH has been received
        })


        // When the client requests to see the currently available funds 
        socket.on('funds_request', async () => {
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} requested to see his funds. Sending funds.`)

            var current_funds = await find_funds(number_of_browsers) // finding the funds currently available

            // Sending current matches to the client
            socket.emit('current_funds', current_funds);
            console.log(array_of_offers);
        })
    });
}

// FINDING ALL ACTIVE MATCHES
async function find_matches() {
    var browser = await puppeteer.launch({ headless: true });
    var page = await browser.newPage();

    await page.goto('https://wwin.com/live/#/');

    var click_football = await page.waitForSelector("#root > div > div.App > div.live-layout > div.live-layout__size > div > div > div.nav-vertical > div.nav-vertical-sports > div > div:nth-child(1) > div.nav-vertical-item__icons.active > span")
    await click_football.click()

    var list_of_matches_ids = await page.$$eval("div.live-name-v__home", (list_of_matches_home) =>
        list_of_matches_home.map((option) => option.title));
    var list_of_matches_leagues = await page.$$eval("div.live-name-v__away", (list_of_matches_away) =>
        list_of_matches_away.map((option) => option.title));

    var duzina = list_of_matches_ids.length

    for (i = 0; i < duzina; i++) {
        list_of_matches[i] = list_of_matches_ids[i] + " vs " + list_of_matches_leagues[i]
    }
    await browser.close();
    return list_of_matches
}


// FINDING ALL ACTIVE OFFERS' TITLES
async function find_offer_titles(i) {
    var titles_of_bets = await array_of_pages[i].$$eval("div.msport-bet-odds__left", (titles_of_bets) =>
        titles_of_bets.map((option) => option.textContent));
    return titles_of_bets
}


// FINDING ALL ACTIVE OFFERS' NAMES
async function find_offer_names(i) {
    var names_of_bets = await array_of_pages[i].$$eval("div.msport-bet-odds__left", (names_of_bets) =>
        names_of_bets.map((option) => option.textContent));
    return names_of_bets
}

async function find_funds(number_of_browsers) {
    array_of_funds = []
    for (i = 0; i < number_of_browsers; i++) {
        var money = await array_of_pages[i].$$eval("#novac", (money) =>
            money.map((option) => option.textContent));
        var money_string = login_information[username__][i][0] + " : " + money[0] + " €"
        array_of_funds.push(money_string)
    }
    return array_of_funds

}


// FUNCTION FOR PLACING BETS
async function place_bet(socket, side, offer, i, bet) {
    var index_of_bet = 0
    var bet_string = bet.toString();

    var money = await array_of_pages[i].$$eval("#novac", (money) =>
        money.map((option) => option.textContent)); // finding the amount of money the user currently has
    console.log(money_string)
    var money_string = money[0] // money returns a list so money is the first element of the list
    var availablemoney = parseFloat(money_string);

    // variables for testing time
    var start = performance.now() 
    var start1 = performance.now()

    var titles_of_bets = await find_offer_titles(0);
    var names_of_bets = await find_offer_names(0);

    if (titles_of_bets.includes(offer) == false) { // if the offer is not available
        socket.emit('offer_not_found', i + 1)
        return console.log(`W ${process.pid} | ${colors.brightGreen(username__)} | ${colors.brightRed("Offer not found for account:")} ${i + 1}`)
    }

    for (j = 0; j < titles_of_bets.length; j++) { // finding the index of the offer

        if (titles_of_bets[j] == offer) {
            index_of_bet = j;
            index_of_bet++
            console.log(colors.brightYellow(`W ${process.pid} | ${colors.brightGreen(username__)} | Offer ${colors.brightMagenta(names_of_bets[j])} found for account: ${colors.yellow(i + 1)}`))
            break;
        }
    }

    //CREATING SELECTOR AND CLICKING ON A BET
    let bet_selector = "#root > div > div.App > div.live-layout.opened-event > div.live-layout__size > div > div.live-event-container.wclay > div.live-event-container__match.live-event-container__match__large > div > div > div > div > div > div.live-matchsingle__odds__wrapper > div:nth-child(" + index_of_bet.toString() + ") > div > div.msport-bet-odds__right.msport-bet__size2 > div:nth-child(" + side.toString() + ") > div"
    let selected_bet = await array_of_pages[i].waitForSelector(bet_selector); // waiting for the bet_selector to load

    await selected_bet.click();

    var is_selected = await array_of_pages[i].evaluate(() => { // checking if the bet is selected. if selected returns 1, else 0
        var x = document.getElementsByClassName("wmodd__bet-type selected").length;
        return (x)
    });
    
    if (is_selected == 0)                                              //CHECK IF BET IS SELECTED 
    {
        // This side of the offer or the offer is not currently active, try again.
        socket.emit('offer_not_active', i + 1)
        return console.log(`W ${colors.gray(process.pid)} | ${colors.brightGreen(username__)} ${colors.brightRed(" | Try again, bet is not selected.")} ${colors.brightYellow("For account : " + (i + 1))}`)
    }
    else {
        console.log(`W ${colors.gray(process.pid)} | ${colors.brightGreen(username__)} | ${colors.brightCyan("Bet selected!" + colors.brightYellow(" For account : " + (i + 1)))}`)                                 //YES
        console.log(`W ${colors.gray(process.pid)} | ${colors.brightCyan("Processing...")}`)
    }

    if (availablemoney < bet) { // if the user doesn't have enough money, which never really happens -> ez money <3
        console.log(colors.brightGreen(username__) + colors.brightYellow(" | Not enough money. For account : " + (i + 1)))
        await delay(0.1)
        await selected_bet.click()
        return;
    }

    let searchInput = await array_of_pages[i].$('input[class="wstake__input"]'); // finding the input field for entering the amount of money
    await searchInput.click({ clickCount: 1 });
    await searchInput.type(bet_string);
    await delay(0.3)

    let payout = await array_of_pages[i].evaluate(() => { // finding the payout: how much money the user will get if he wins
        var x = document.getElementsByClassName("wpossiblepayout__payout")[0].innerText
        return (x)
    });


    // Click to place the bet and confirm the choice
    await array_of_pages[i].click('button[class = "btn--gradient btn--checkout btn--large  btn--wp100"]');
    await array_of_pages[i].click('button[class = "btn--gradient btn--checkout btn--large  btn--wp100"]');


    let end1 = performance.now() // time until the server places the bet
    do {
        var is_successful = await array_of_pages[i].evaluate(() => {
            return document.getElementsByClassName("ico-st-ticket-success-light  ").length;           //WAIT UNTIL BET IS CONFIRMED
        });

        var is_error = await array_of_pages[i].evaluate(() => {
            return document.getElementsByClassName("wticket__error").length;        //CHECK IF BET IS PROCESSED/ERROR, IF lenght == 0, then no error.
        });

        var is_error1 = await array_of_pages[i].evaluate(() => {
            return  document.getElementsByClassName("msg-place-bet msg-place-bet--error").length;  //CHECK IF BET IS PROCESSED/ERROR2
        });
    }
    while (is_successful == 0 && is_error == 0 && is_error1 == 0)

    if (is_error != 0) {
        // Bet failed. Try again.
        socket.emit('bet_failed')
        await array_of_pages[i].click('button[class = "btn--gradient btn--accent btn--large  btn--wp100"]');
        console.log(`W ${colors.gray(process.pid)} | ${colors.green(username__)} ${colors.gray("| ")} ${colors.brightRed("Bet did not make it through. ")} ${colors.brightYellow("For account : " + (i + 1))}`)
        return
    }

    if (is_error1 != 0) {
        socket.emit('bet_failed')
        await array_of_pages[i].click('button[class = "btn--gradient btn--accent btn--xlarge  btn--wp100 btn--light"]');
        console.log(`W ${colors.gray(process.pid)} | ${colors.green(username__)} ${colors.gray("| ")} ${colors.brightRed("Ticket rejected. ")} ${colors.brightYellow("For account : " + (i + 1))}`)
        return
    }

    if (is_successful != 0) { // if the bet is not successfull, reset the window so new bets can be placed
        let clear_selector = "#root > div > div.App > div.live-layout.opened-event > div.live-layout__ticket > div > div > div.wticket > div.wmc-wrapper.wmc-center.wmc-nopadding.wmc--alwaysWhite > div.wmc-inside > div > div > div > div > div.msg-place-bet--menu > div:nth-child(2)"
        let clear = await array_of_pages[i].waitForSelector(clear_selector);
        await clear.click()
    }

    var end = performance.now() // time until the bet placed gets a response from the betting website (all finished)

    console.log(colors.magenta(`\n ${username__} account ${(i + 1)} : ${colors.brightGreen(money_string + " €")}\n -------------------------`))
    console.log(colors.brightYellow(`Stake : ${colors.brightGreen(bet + " €")}`))
    console.log(colors.brightYellow(`Payout : ${colors.brightGreen.underline(payout)}`))
    console.log(colors.brightYellow(`Time to place bet : ${colors.brightCyan(((end1 - start1) / 1000).toFixed(2) + " s")}`))
    console.log(colors.brightYellow(`Full time : ${colors.brightCyan(((end - start) / 1000).toFixed(2) + " s\n")}`))
    // Bet was successful
    socket.emit('bet_success', i + 1, bet, payout)

}