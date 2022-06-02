const express = require('express'); // requires express module
const socket = require('socket.io'); // requires socket.io module
const fs = require('fs');
const app = express();
var colors = require('colors');
const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');

var PORT = process.env.PORT || 3000;
const server = app.listen(PORT); //hosts server on localhost:3000

console.log('Server is running. Listening at PORT: ' + PORT);
const io = socket(server);

const localtunnel = require('localtunnel');
(async () => {
    const tunnel = await localtunnel({
        subdomain: "whenlambosoon",
        port: 3000
    });
    console.log(`Server available at: ${tunnel.url}`);
})();


// Name of the match we want to bet on
const match_title = "1675218 | Monastir, Doubles Main, W-ITF-TUN-22A | Paskauskas K / Wei S - Hosoki Y / Kobayashi H";
// Setting delay with units in seconds         
const delay = (n) => new Promise(r => setTimeout(r, n * 1000));

var browser1, browser2, browser3, browser4;
var page1, page2, page3, page4;

var username__;
var logged_users_ids = [];
const array_of_browsers = [browser1, browser2, browser3, browser4];
const array_of_pages = [page1, page2, page3, page4]

/*var array_of_functions_1 = [
    function() { place_bet(1,0,page1) },
    function() { place_bet(1,1,page2) },
    function() { place_bet(1,2,page3) },
    function() { place_bet(1,3,page4) }
]
var array_of_functions_2 = [
    function() { place_bet(2,0,page1) },
    function() { place_bet(2,1,page2) },
    function() { place_bet(2,2,page3) },
    function() { place_bet(2,3,page4) }
]*/

var array_of_functions_1 = [
    function () { place_bet(1, 0) },
    function () { place_bet(1, 1) },
    function () { place_bet(1, 2) },
    function () { place_bet(1, 3) }
]
var array_of_functions_2 = [
    function () { place_bet(2, 0) },
    function () { place_bet(2, 1) },
    function () { place_bet(2, 2) },
    function () { place_bet(2, 3) }
]

array_of_place_bets = []


// Login information
var login_information = {
    relja: [["relja12345", "Relja15052002"], ["somi333", "srbija333"]],
    somi: [["sdfsdf5", "asdffasdfa"], ["somi333", "asf"]],
    djordje: [["djordjeristic", "DjordjeR81"]],
};


io.on('connection', async (socket) => {

    var number_of_browsers;

    // When a new Client connection is opened.
    console.log("New socket connection: " + socket.id)

    // Sending a message to CLIENT that they have connected
    socket.emit('connected', socket.id)

    socket.on('disconnect', async function () {
        // var index = logged_users_ids.indexOf(socket.id)
        // logged_users_ids.splice(index, 1)
        // for (i = 0; i < login_information[username__].length; i++) {
        //     await array_of_browsers[i].close()
        // }
        console.log("User disconnected. ID: " + socket.id)
    });


    // SEND BUTTON
    // When the Client clicks SEND button
    socket.on('login', async (username) => {
        username__ = username
        console.log("User with the username: " + colors.brightGreen(username) + " has attempted to log in.")
        // If the username is in the array of usernames
        if (username in login_information && logged_users_ids.includes(socket.id) == false) {

            var index_of_match = 0;

            logged_users_ids.push(socket.id)
            number_of_browsers = login_information[username].length;
            socket.emit('login_successful', username, number_of_browsers);

            for (i = 0; i < number_of_browsers; i++) {

                array_of_browsers[i] = await puppeteer.launch({ headless: false });
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
                console.log(colors.brightYellow("Logged in : " + username + "  |  WWin name : " + login_information[username][i][0] + "  |  Wwin password : " + login_information[username][i][1]))
                socket.emit('page_logged_in', (login_information[username][i][0]))
            }

            // Letting the Client know USERNAME has been received
            socket.emit('login_finished', (number_of_browsers));
        } else {

            if (!(username in login_information) || logged_users_ids == 0) {
                console.log(colors.brightRed("Username not found"))
                socket.emit('username_not_found', (username));
            }
            else//(!(logged_users_names.includes(username)))
            {
                console.log(colors.brightRed("User already logged in"))
                socket.emit('username_logged_in', (username));
            }

        }
    })


    // LEFT BUTTON

    socket.on('left_button', async () => {
        console.log("Left Button has been pressed.")
        // This is where the function should be run

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
        console.log("Right Button has been pressed.")
        // This is where the function should be run

        var sliced_array_of_functions = array_of_functions_2.splice(0, number_of_browsers)

        for (i = 0; i < sliced_array_of_functions.length; i++) {
            array_of_place_bets.push(sliced_array_of_functions[i]());
        }

        await Promise.all([array_of_place_bets])

        // Letting the Client know LEFT has been received
        socket.emit('right_button_received');
    })
})

async function place_bet(side, i) {
    var index_of_bet = 0
    var title = "hcp=1.5";                  //TITLE OF A BET WE WANT TO SELECT  
    var bet = "0.1";
    var bet_float = parseFloat(bet);

    //console.log(array_of_pages[i])


    var money = await array_of_pages[i].$$eval("#novac", (money) =>
        money.map((option) => option.textContent));

    var money_string = money[0]
    var availablemoney = parseFloat(money_string);


    var start = performance.now()
    var start1 = performance.now()
    console.log(colors.brightYellow(username__ + " acc " + (i + 1) + " : Trazi se ponuda."));

    //SEARCHING FOR A BET 


    var titles_of_bets = await array_of_pages[i].$$eval("div.sport-bet-odds", (titles_of_bets) =>
        titles_of_bets.map((option) => option.title));                                    //TITLES OF ALL BETS
    //console.log(titles_of_bets)
    var names_of_bets = await array_of_pages[i].$$eval("div.sport-bet-odds__left", (names_of_bets) =>
        names_of_bets.map((option) => option.textContent));                               //NAMES OF ALL BETS
    //console.log(names_of_bets)
    for (j = 0; j < titles_of_bets.length; j++) {

        if (titles_of_bets[j] == title) {
            index_of_bet = j;
            index_of_bet++
            console.log(colors.brightYellow(username__ + " acc " + (i + 1) + " : Pronadjena ponuda - ") + colors.brightMagenta(names_of_bets[j]))
            break;
        }
    }
    if (index_of_bet == 0) {
        return console.log(colors.brightYellow(username__ + " acc " + (i + 1) + " : Ponuda nije pronadjena. Pokusajte ponovo"))
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
        return console.log(colors.brightYellow(username__ + " acc " + (i + 1) + " : Pokusaj opet, ponuda nije selektovana."))        //NO

    }
    else {
        console.log(colors.brightYellow(username__ + " acc " + (i + 1) + " :Ponuda selektovana !"))         //YES
    }

    if (availablemoney < bet_float) {
        console.log(colors.brightYellow(username__ + " " + (i + 1) + " : Nema dovoljno para.Pokusajte ponovo."))
        await delay(0.1)
        await selected_bet.click()
        return;
    }
    else {
        console.log("ima para")
    }

    let searchInput = await array_of_pages[i].$('input[class="wstake__input"]');
    await searchInput.click({ clickCount: 2 });
    await searchInput.type(bet);
    await delay(0.5)

    //CONFIRM THE BET
    await array_of_pages[i].click('button[class = "btn--fill btn--checkout btn--xlarge "]');
    await array_of_pages[i].click('button[class = "btn--fill btn--checkout btn--xlarge "]');

    let end1 = performance.now()
    do {
        var isthrough = await array_of_pages[i].evaluate(() => {
            var x = document.getElementsByClassName("message-place-bet__main_bold").length;
            return (x)                                                                          //CLICK ON A BET UNTIL IT IS SELECTED
        });
    }
    while (isthrough == 0)


    //DESELECT BET


    console.log(colors.magenta("\n " + username__ + " account " + (i + 1) + " :" + "\n -------------------------"))
    console.log(colors.brightYellow("Uplaceno ") + (colors.brightGreen("EUR " + "0.1")))
    var end = performance.now()
    console.log(colors.brightYellow("Vrijeme : ") + colors.brightCyan(`${((end - start) / 1000).toFixed(2)} s`))
    //console.log(colors.brightYellow(username__+" acc "+(i+1)+" : Vrijeme1 : ") + colors.brightCyan(`${((end1 - start1) / 1000).toFixed(2)} s`))

    await selected_bet.click();
    await selected_bet.click();

}


