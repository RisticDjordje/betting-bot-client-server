var colors = require('colors');
var http = require('http')
const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const localtunnel = require('localtunnel');

// cluster implementation
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const { Server } = require('socket.io');
const { setupMaster, setupWorker } = require('@socket.io/sticky');
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");

// Setting delay with units in seconds         
const delay = (n) => new Promise(r => setTimeout(r, n * 1000));

function getRandomFloat(min, max, decimals) {
    const str = (Math.random() * (max - min) + min).toFixed(decimals);

    return parseFloat(str);
}

var browser1, browser2, browser3, browser4;
var page1, page2, page3, page4;

var username__;
var logged_users_ids = [];
const array_of_browsers = [browser1, browser2, browser3, browser4];
const array_of_pages = [page1, page2, page3, page4];

var array_of_offers = [];
var index_of_offer = -1;

// Login information
var login_information = {
    relja: [["relja12345", "Relja15052002"], ["somi333", "srbija333"]],
    somi: [["somi333", "srbija333"], ["relja12345", "Relja15052002"], ["djordjeristic", "DjordjeR81"]],
    djordje: [["djordjeristic", "DjordjeR81"]],
};



if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

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

    httpServer.listen(3000);

    (async () => {
        const tunnel = await localtunnel({
            subdomain: "whenlambo-soon",
            port: 3000
        });
        console.log(`Server available at: ${tunnel.url}`);
        console.log("------------------------------------------------------");
    })();


    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });

} else {

    console.log(`Worker ${process.pid} started`);

    const httpServer = http.createServer();
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

        // When a new Client connection is opened.
        console.log(`W ${process.pid} | New socket connection: ${colors.yellow(socket.id)}`)

        // Sending a message to CLIENT that they have connected
        socket.emit('connected', socket.id)

        socket.on('disconnect', async function () {

            // Removing the user from the array of logged in users
            if (is_logged_in) {
                var index = logged_users_ids.indexOf(socket.id)
                logged_users_ids.splice(index, 1)
                for (i = 0; i < login_information[username__].length; i++) {
                    await array_of_browsers[i].close()
                }
                console.log(`W ${process.pid} | ${colors.red(username__)} (ID: ${colors.red(socket.id)}) disconnected. Closed all his browsers.`)
            }
            else {
                console.log(`W ${process.pid} | User disconnected. ID: ${colors.red(socket.id)}`)
            }
        });


        // LOGIN BUTTON
        socket.on('login', async (username) => {
            username__ = username
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} has attempted to log in to: ${colors.brightGreen(username)}`)
            // If the username is in the array of usernames
            if (username in login_information && logged_users_ids.includes(socket.id) == false) {

                var index_of_match = 0;

                logged_users_ids.push(socket.id)
                number_of_browsers = login_information[username].length;
                socket.emit('login_successful', username, number_of_browsers);
                console.log(`W ${process.pid} | ID: ${colors.brightGreen(socket.id)} has successfully logged in to: ${colors.brightGreen(username)}`)

                for (i = 0; i < number_of_browsers; i++) {

                    array_of_browsers[i] = await puppeteer.launch({ headless: true });
                    array_of_pages[i] = await array_of_browsers[i].newPage();

                    await array_of_pages[i].goto('https://wwin.com/');
                    await array_of_pages[i].type('input[id = "txbUsername"]', login_information[username][i][0]);
                    await array_of_pages[i].type('input[id = "txbPassword"]', login_information[username][i][1]);

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

                    //DESELECT ALL FOOTBALL MATCHES
                    var click_football = await array_of_pages[i].waitForSelector("#root > div > div.App > div.live-layout > div.live-layout__size > div > div > div.nav-vertical > div.nav-vertical-sports > div > div:nth-child(1) > div.nav-vertical-item__icons.active > span")
                    await click_football.click()

                    //FIND TITLES OF ALL MATCHES
                    var matches = await array_of_pages[i].$$eval("div.live-match__hov ", (matches) =>
                        matches.map((option) => option.title));

                    for (j = 0; j < matches.length; j++) {

                        if (matches[j] == match_title) {
                            index_of_match = j;                 //INDEX OF A MATCH WE WANT                
                        }
                    }
                    index_of_match += 3

                    let conversion_match = index_of_match.toString();     //CONVERTING NUMBER TO STRING

                    //CREATING SELECTOR AND CLICKING ON A MATCH

                    let match_selector = "#root > div > div.App > div.live-layout > div.live-layout__size > div > div > div.live-layout__sport-main-panels > div.sport-main-panel.wclay > div:nth-child(" + conversion_match + ") > div > div.live-match__name > div > div.live-name-v__team"
                    let found_match = await array_of_pages[i].waitForSelector(match_selector)
                    await found_match.click()
                    await delay(0.5)
                    console.log(`W ${process.pid} | ${colors.brightGreen(username)} logged in to  |  WWin name: ${colors.brightYellow(login_information[username][i][0])}  |  Wwin password: ${colors.brightYellow(login_information[username][i][1])}`)
                    socket.emit('page_logged_in', (login_information[username][i][0]))
                }

                // Letting the Client know USERNAME has been received
                socket.emit('login_finished', (number_of_browsers));
                console.log(`W ${process.pid} | ID: ${colors.brightGreen(socket.id)} has finished logging in to: ${colors.brightGreen(username)}`)
                is_logged_in = true;
            } else {

                if (!(username in login_information) || logged_users_ids == 0) {
                    console.log(`W ${process.pid} | ${colors.red(username)} ${colors.brightRed(" not found.")}`)
                    socket.emit('username_not_found', (username));
                }
                else//(!(logged_users_names.includes(username)))
                {
                    console.log(colors.red(username) + colors.brightRed(" already logged in."))
                    socket.emit('username_logged_in', (username));
                }

            }
        })

        // LEFT BUTTON
        socket.on('left_button', async () => {
            console.log(`W ${process.pid} | ${colors.brightGreen(username__)} pressed LEFT/OVER/YES button.`)

            array_of_bets = []
            for (i = 0; i < number_of_browsers; i++) {
                var money = await array_of_pages[i].$$eval("#novac", (money) =>
                    money.map((option) => option.textContent));
                var money_value = parseFloat(money[0])
                if (money_value > 45) { money_value = 45 }
                array_of_bets.push(Math.floor(money_value * getRandomFloat(0.85, 0.95, 2)))
                // array_of_bets.push(0.1)
            }

            array_of_place_bets = []
            var offer = array_of_offers[index_of_offer]

            var array_of_functions_1 = [
                function () { place_bet(socket, 1, offer, 0, array_of_bets[0]) },
                function () { place_bet(socket, 1, offer, 1, array_of_bets[1]) },
                function () { place_bet(socket, 1, offer, 2, array_of_bets[2]) },
                function () { place_bet(socket, 1, offer, 3, array_of_bets[3]) }
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
            array_of_bets = []
            for (i = 0; i < number_of_browsers; i++) {
                var money = await array_of_pages[i].$$eval("#novac", (money) =>
                    money.map((option) => option.textContent));
                var money_value = parseFloat(money[0])
                if (money_value > 45) { money_value = 45 }
                array_of_bets.push(Math.floor(money_value * getRandomFloat(0.85, 0.95, 2)))
                // array_of_bets.push(0.1)
            }

            array_of_place_bets = []
            var offer = array_of_offers[index_of_offer]

            var array_of_functions_2 = [
                function () { place_bet(socket, 2, offer, 0, array_of_bets[0]) },
                function () { place_bet(socket, 2, offer, 1, array_of_bets[1]) },
                function () { place_bet(socket, 2, offer, 2, array_of_bets[2]) },
                function () { place_bet(socket, 2, offer, 3, array_of_bets[3]) }
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

            var titles_of_bets = await find_offer_titles(0)
            var names_of_bets = await find_offer_names(0)

            for (i = 0; i < titles_of_bets.length; i++) {
                if (titles_of_bets[i] == "") {
                    titles_of_bets.splice(i, 1)
                    names_of_bets.splice(i, 1)
                }
            }

            // Sending current offers to the client
            socket.emit('current_offers', titles_of_bets, names_of_bets);
        })


        // RECEIVING OFFER FROM CLIENT
        socket.on('offer_chosen', async (offer_received_title, offer_received_name) => {
            console.log(`W ${process.pid} | ${colors.brightGreen(username__)} chose offer. Name: ${colors.brightCyan(offer_received_name)} | Title: ${colors.brightCyan(offer_received_title)}`)

            array_of_offers.push(offer_received_title)
            index_of_offer += 1

            // Letting the Client know OFFER has been received
            socket.emit('offer_received_name', offer_received_name);
        })



        // CHOOSE MATCH BUTTON
        socket.on('matches_request', async () => {
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} requested matches. Sending matches.`)

            var titles_of_matches = await find_matches(0)

            // Sending current matches to the client
            socket.emit('current_matches', titles_of_matches);
        })

        // RECEIVING CHOSEN MATCH FROM CLIENT
        socket.on('match_chosen', async (match_title_received) => {
            match_title = match_title_received

            // Letting the Client know LEFT has been received
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} chose match: ${colors.brightCyan(match_title)}`)
            socket.emit('match_clicked_received', match_title);
        })


        // FUNDS BUTTON 
        socket.on('funds_request', async () => {
            console.log(`W ${process.pid} | ID: ${colors.yellow(socket.id)} requested to see his funds. Sending funds.`)

            var current_funds = await find_funds(number_of_browsers)

            // Sending current matches to the client
            socket.emit('current_funds', current_funds);
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

    var list_of_matches = await page.$$eval("div.live-match__hov ", (list_of_matches) =>
        list_of_matches.map((option) => option.title));
    await browser.close();
    return list_of_matches
}


// FINDING ALL ACTIVE OFFERS' TITLES
async function find_offer_titles(i) {
    var titles_of_bets = await array_of_pages[i].$$eval("div.sport-bet-odds", (titles_of_bets) =>
        titles_of_bets.map((option) => option.title));
    return titles_of_bets
}


// FINDING ALL ACTIVE OFFERS' NAMES
async function find_offer_names(i) {
    var names_of_bets = await array_of_pages[i].$$eval("div.sport-bet-odds__left", (names_of_bets) =>
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
        money.map((option) => option.textContent));

    var money_string = money[0]
    var availablemoney = parseFloat(money_string);

    // variables for testing time
    var start = performance.now()
    var start1 = performance.now()
    //console.log(colors.brightYellow(`W ${colors.gray(process.pid)} | Searching for offer ${colors.brightMagenta(offer)}  for account : ${colors.yellow(i + 1)}`))

    var titles_of_bets = await find_offer_titles(0);
    var names_of_bets = await find_offer_names(0);

    if (titles_of_bets.includes(offer) == false) {
        socket.emit('offer_not_found', i + 1)
        return console.log(`W ${process.pid} | ${colors.brightGreen(username__)} | ${colors.brightRed("Offer not found for account:")} ${i + 1}`)
    }

    for (j = 0; j < titles_of_bets.length; j++) {

        if (titles_of_bets[j] == offer) {
            index_of_bet = j;
            index_of_bet++
            console.log(colors.brightYellow(`W ${process.pid} | ${colors.brightGreen(username__)} | Offer ${colors.brightMagenta(names_of_bets[j])} found for account: ${colors.yellow(i + 1)}`))
            break;
        }
    }

    //CREATING SELECTOR AND CLICKING ON A BET
    let conversion_bet = index_of_bet.toString()
    let conversion_side = side.toString()


    let bet_selector = "#root > div > div.App > div.live-layout.opened-event > div.live-layout__size > div > div.live-layout__event.wclay > div.live-match-singl > div:nth-child(4) > div:nth-child(" + conversion_bet + ") > div > div.sport-bet-odds__right > div:nth-child(" + conversion_side + ")"
    let selected_bet = await array_of_pages[i].waitForSelector(bet_selector);

    await selected_bet.click();

    var is_selected = await array_of_pages[i].evaluate(() => {
        var x = document.getElementsByClassName("sport-bet__odd selected").length;
        return (x)
    });
    if (is_selected == 0)                                              //CHECK IF BET IS SELECTED 
    {
        // This side of the offer or the offer is not currently active, try again.
        socket.emit('offer_not_active', i + 1)
        return console.log(`W ${colors.gray(process.pid)} | ${colors.brightGreen(username__)} ${colors.brightRed(" | Try again, bet is not selected.")} ${colors.brightYellow("For account : " + (i + 1))}`)
    }
    else {
        console.log(`W ${colors.gray(process.pid)} | ${colors.brightGreen(username__)} ${colors.brightCyan(" | Bet selected!" + colors.brightYellow(" For account : " + (i + 1)))}`)                                 //YES
        console.log(`W ${colors.gray(process.pid)} | ${colors.brightCyan("Processing...")}`)
    }

    if (availablemoney < bet) {
        // Probably can not happen
        console.log(colors.brightGreen(username__) + colors.brightYellow(" | Not enough money. For account : " + (i + 1)))
        await delay(0.1)
        await selected_bet.click()
        return;
    }

    let searchInput = await array_of_pages[i].$('input[class="wstake__input"]');
    await searchInput.click({ clickCount: 2 });
    await searchInput.type(bet_string);
    await delay(0.3)

    let payout = await array_of_pages[i].evaluate(() => {
        var x = document.getElementsByClassName("wpossiblepayout__payout")[0].innerText
        return (x)
    });
    //payout.slice(0,-2)

    //CONFIRM THE BET
    await array_of_pages[i].click('button[class = "btn--fill btn--checkout btn--xlarge "]');
    await array_of_pages[i].click('button[class = "btn--fill btn--checkout btn--xlarge "]');

    let end1 = performance.now()
    do {
        var isthrough = await array_of_pages[i].evaluate(() => {
            var x = document.getElementsByClassName("message-place-bet__main_bold").length;
            return x                                                                         //WAIT UNTIL BET IS CONFIRMED
        });

        var check_if_bet_procceded = await array_of_pages[i].evaluate(() => {
            var y = document.getElementsByClassName("wmsg wmsg__error wmsg_border").length;
            return y;
        });
    }
    while (isthrough == 0 && check_if_bet_procceded == 0)

    if (check_if_bet_procceded != 0) {
        // Bet failed. Try again.
        socket.emit('bet_failed')
        await array_of_pages[i].click('button[class = "btn--fill btn--accent btn--xlarge "]');
        console.log(`W ${colors.gray(process.pid)} | ${colors.green(username__)} ${colors.brightYellow(" | ")} ${colors.brightRed("Bet did not make it through. ")} ${colors.brightYellow("For account : " + (i + 1))}`)
        return
    }

    var end = performance.now()

    console.log(colors.magenta(`\n ${username__} account ${(i + 1)} : ${colors.brightGreen(money_string + " €")}\n -------------------------`))
    console.log(colors.brightYellow(`Stake : ${colors.brightGreen(bet + " €")}`))
    console.log(colors.brightYellow(`Payout : ${colors.brightGreen(payout)}`))
    console.log(colors.brightYellow(`Time1 : + ${colors.brightCyan(((end1 - start1) / 1000).toFixed(2) + " s")}`))
    console.log(colors.brightYellow(`Time : ${colors.brightCyan(((end - start) / 1000).toFixed(2) + " s")}`))
    // Bet was successful
    socket.emit('bet_success', i + 1, bet, payout)

    //DESELECT BET
    await selected_bet.click();
    await selected_bet.click();

}
