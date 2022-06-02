package com.example.ezmoneybettingapp

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        val sendUsernameBtn = findViewById<Button>(R.id.loginBtn)
        val username = findViewById<TextView>(R.id.username)
        val consoleLog = findViewById<TextView>(R.id.consoleLogTextView)
        var consoleLogCounter = 0

        SocketHandler.setSocket()
        SocketHandler.establishConnection()


        val mSocket = SocketHandler.getSocket()


        // CLIENT receiving that they are connected from the SERVER
        mSocket.on("connected") { args ->
            if (args[0] != null) {
                val id = args[0] as String
                runOnUiThread {
                    consoleLogCounter++

                    if (consoleLog.text.isEmpty()) {
                        consoleLog.append("$consoleLogCounter | SERVER: You are connected to the server.")
                    } else {
                        consoleLog.append("\n$consoleLogCounter | SERVER: You are connected to the server.")
                    }

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

        // SEND BUTTON
        // When the CLIENT clicks SEND button
        sendUsernameBtn.setOnClickListener {

            // Sending the username to the SERVER
            mSocket.emit("login", username.text)
            // Updating the CLIENT console
            consoleLogCounter++
            consoleLog.append("\n$consoleLogCounter | CLIENT: ${username.text} sent to the server.")
        }


        // Notification from SERVER after receiving successfully logging client in
        mSocket.on("login_successful") { args ->
            if (args[0] != null) {
                runOnUiThread {
                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Successfully logged in to ${args[0]}.")
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Now logging in to ${args[1]} WWin accounts.")
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
                    consoleLog.append("\n$consoleLogCounter | SERVER: Wrong username: ${args[0]}.")
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
                    consoleLog.append("\n$consoleLogCounter | SERVER: Successfully logged in to WWin account: ${args[0]}.")
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
                    val intent = Intent(this, SecondActivity::class.java)
                    startActivity(intent)
                }
            }
        }

    }
}

