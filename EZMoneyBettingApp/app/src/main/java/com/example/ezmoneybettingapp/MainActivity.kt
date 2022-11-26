package com.example.ezmoneybettingapp

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONArray

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        loadData()

        // Variables
        val ipEditText = findViewById<EditText>(R.id.ipEditText)
        val connectBtn = findViewById<Button>(R.id.connectBtn)
        val loginBtn = findViewById<Button>(R.id.loginBtn)
        val chooseMatchBtn = findViewById<Button>(R.id.chooseMatchBtn)
        val matchNameTextView = findViewById<TextView>(R.id.matchNameTextView)
        val username = findViewById<TextView>(R.id.username)
        val consoleLog = findViewById<TextView>(R.id.consoleLogTextView)
        val changeSiteBtn = findViewById<Button>(R.id.changeSiteBtn)
        val currentSiteTextView = findViewById<TextView>(R.id.currentSiteTextView)
        var siteChosen = currentSiteTextView.text.toString()
        var consoleLogCounter = 1
        var isMatchChosen = false
        var isConnected = false



        // Establishing a socket
        // CHOOSE MATCH
        connectBtn.setOnClickListener {
            val ip = ipEditText.text.toString()
            SocketHandler.setSocket(ip)
            SocketHandler.establishConnection()
            if (consoleLog.text.isEmpty()) {
                consoleLog.append("$consoleLogCounter | Trying to connect to the server. Please wait.\n------------------------------------------------------")
            } else {
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter  | Trying to connect to the server. Please wait.\n------------------------------------------------------")
            }
            val mSocket = SocketHandler.getSocket()
            saveData()

            // CLIENT receiving that they are connected from the SERVER
            mSocket.on("connected") { args ->
                if (args[0] != null) {
                    val id = args[0] as String
                    runOnUiThread {
                        isConnected = true

                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: You are connected to the server.")

                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | Your ID: $id\n------------------------------------------------------")
                        consoleLogCounter++
                        consoleLog.append(
                            "\n$consoleLogCounter | Choose a match and login.\n" +
                                    "------------------------------------------------------"
                        )
                    }
                }
            }

            // Restarting the activity when the client is disconnected
            mSocket.on("disconnect") {
                val intent = Intent(this, MainActivity::class.java)
                startActivity(intent)
                mSocket.disconnect()
                isConnected = false
                finish()
            }


            // CHOOSE MATCH
            changeSiteBtn.setOnClickListener {
                if (isConnected) {
                    if (siteChosen == "Wwin") {
                        siteChosen = "Meridian"
                    } else {
                        siteChosen = "Wwin"
                    }
                    mSocket.emit("site_chosen", siteChosen)
                    currentSiteTextView.text = siteChosen
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | CLIENT: Change to $siteChosen sent to server.")
                } else {
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | CLIENT: You firstly have to connect to the server.")
                }
                saveData()  // save the change in cache
            }

            mSocket.on("site_chosen_received") {
                runOnUiThread {
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Site change received.")
                    consoleLog.append("\n------------------------------------------------------")
                }
            }


            // CHOOSE MATCH
            chooseMatchBtn.setOnClickListener {
                if (isConnected) {
                    // Sending the username to the SERVER
                    mSocket.emit("matches_request")
                    // Updating the CLIENT console
                    matchNameTextView.text = "Requesting matches"
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | CLIENT: Requesting matches from server.")
                } else {
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | CLIENT: You are not connected to the server. Please ensure you have stable internet access and wait.")
                    consoleLog.append("\n------------------------------------------------------")
                }
            }


            // Server sending current matches
            mSocket.on("current_matches") { args ->
                if (args[0] != null) {
                    runOnUiThread {
                        val matchesNames = ArrayList<String>()

                        val jsMatchesNames = args[0] as JSONArray?

                        if (jsMatchesNames != null) {
                            for (i in 0 until jsMatchesNames.length()) {
                                matchesNames.add(jsMatchesNames.getString(i))
                            }
                        }

                        val dialog = MatchesDialogFragment(matchesNames)
                        dialog.show(supportFragmentManager, "matchesDialog")

                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: Matches given.")
                        consoleLog.append("\n------------------------------------------------------")
                    }
                }
            }


            // Notification from SERVER after receiving the match choice
            mSocket.on("match_clicked_received") { args ->
                if (args[0] != null) {
                    runOnUiThread {
                        val matchChosen = args[0].toString().substring(9)
                        isMatchChosen = true
                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: Received chosen match: $matchChosen")
                        consoleLog.append("\n------------------------------------------------------")
                        matchNameTextView.text = matchChosen
                        saveData()
                    }
                }
            }


            // LOGIN BUTTON
            // When the CLIENT clicks SEND button
            loginBtn.setOnClickListener {
                saveData() // save the username to cache
                if (isMatchChosen) {
                    // Sending the LOGIN signal to the SERVER
                    mSocket.emit("login", username.text)
                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | CLIENT: ${username.text} sent to the server.")
                } else {
                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | CLIENT: Firstly choose a match!")
                    consoleLog.append("\n------------------------------------------------------")
                }
            }


            // Notification from SERVER after receiving successfully logging client in
            mSocket.on("login_successful") { args ->
                if (args[0] != null) {
                    runOnUiThread {
                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: Successfully logged in to ${args[0]}")
                        consoleLog.append("\n------------------------------------------------------")
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: Now logging in to ${args[1]} WWin account(s).")
                        consoleLog.append("\n------------------------------------------------------")
                    }
                }
            }

            // Notification from SERVER after receiving wrong login information
            mSocket.on("username_not_found") { args ->
                if (args[0] != null) {
                    runOnUiThread {
                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: Wrong username: ${args[0]}")
                        consoleLog.append("\n------------------------------------------------------")
                    }
                }
            }

            // Notification from SERVER after username is already logged in
            mSocket.on("username_logged_in") { args ->
                if (args[0] != null) {
                    runOnUiThread {
                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: User ${args[0]} already logged in.")
                        consoleLog.append("\n------------------------------------------------------")
                    }
                }
            }

            // Notification from SERVER after successfully logging in to Wwin account
            mSocket.on("page_logged_in") { args ->
                if (args[0] != null) {
                    runOnUiThread {
                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: Successfully logged in to WWin account: ${args[0]}")
                    }
                }
            }

            // Notification from SERVER after finishing login
            mSocket.on("login_finished") { args ->
                if (args[0] != null) {
                    runOnUiThread {
                        // Updating the CLIENT console
                        consoleLogCounter++
                        consoleLog.append("\n$consoleLogCounter | SERVER: Login finished. Successfully logged in into ${args[0]} WWin accounts.")
                        consoleLog.append("\n------------------------------------------------------")
                        Handler().postDelayed({
                            val intent = Intent(this, SecondActivity::class.java)
                            startActivity(intent)
                            finish()
                        }, 50)
                    }
                }
            }
        }
    }

    private fun saveData() {
        val ipEditText = findViewById<TextView>(R.id.ipEditText)
        val username = findViewById<TextView>(R.id.username)
        val site = findViewById<TextView>(R.id.currentSiteTextView)
        val savedMatch = findViewById<TextView>(R.id.matchNameTextView)

        val sharedPref = getSharedPreferences("sharedPrefs", Context.MODE_PRIVATE)
        val editor = sharedPref.edit()
        editor.apply {
            putString("ip", ipEditText.text.toString())
            putString("username", username.text.toString())
            putString("site", site.text.toString())
            putString("match", savedMatch.text.toString())
        }.apply()
    }

    private fun loadData() {
        val sharedPref = getSharedPreferences("sharedPrefs", Context.MODE_PRIVATE)

        val savedIp = sharedPref.getString("ip", "http://10.0.2.2:3000")
        val savedUsername = sharedPref.getString("username", "Username")
        val savedSite = sharedPref.getString("site", "WWin")
        val savedMatch =  sharedPref.getString("match", "No Match Chosen")

        val ipEditText = findViewById<TextView>(R.id.ipEditText)
        val username = findViewById<TextView>(R.id.username)
        val site = findViewById<TextView>(R.id.currentSiteTextView)
        val match = findViewById<TextView>(R.id.matchNameTextView)

        ipEditText.text = savedIp
        username.text = savedUsername
        site.text = savedSite
    }
}

