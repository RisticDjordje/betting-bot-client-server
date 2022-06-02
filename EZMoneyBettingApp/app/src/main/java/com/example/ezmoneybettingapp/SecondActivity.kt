package com.example.ezmoneybettingapp

import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.PopupWindow
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class SecondActivity : AppCompatActivity() {

    lateinit var leftBtn: Button
    lateinit var rightBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)

        // VARIABLES
//        val sendUsernameBtn = findViewById<Button>(R.id.loginBtn)
        val blackScreenBtn = findViewById<Button>(R.id.blackScreenBtn)
        val offersBtn = findViewById<Button>(R.id.offersBtn)
//        val username = findViewById<TextView>(R.id.username)
        val consoleLog = findViewById<TextView>(R.id.consoleLogTextView)
        var consoleLogCounter = 0
//        val offers: MutableListOf
//        offers.add("fadsfasd", "fasdfadsfsadf", "fadsfadsfa")

        // MAKING CONNECTION
        // The following lines connects the Android app to the server.
//        SocketHandler.setSocket()
//        SocketHandler.establishConnection()


        val mSocket = SocketHandler.getSocket()


//        // CLIENT receiving that they are connected from the SERVER
//        mSocket.on("connected") { args ->
//            if (args[0] != null) {
//                val id = args[0] as String
//                runOnUiThread {
//                    consoleLogCounter++
//
//                    if (consoleLog.text.isEmpty()) {
//                        consoleLog.append("$consoleLogCounter | SERVER: You are connected to the server.")
//                    } else {
//                        consoleLog.append("\n$consoleLogCounter | SERVER: You are connected to the server.")
//                    }
//
//                    consoleLogCounter++
//                    consoleLog.append("\n$consoleLogCounter | Your ID: $id\n------------------------------------------------------")
//                }
//            }
//        }


//        // SEND BUTTON
//        // When the CLIENT clicks SEND button
//        sendUsernameBtn.setOnClickListener {
//            // Sending the username to the SERVER
//            mSocket.emit("login", username.text)
//            // Updating the CLIENT console
//            consoleLogCounter++
//            consoleLog.append("\n$consoleLogCounter | CLIENT: ${username.text} sent to the server.")
//        }
//
//        // Notification from SERVER after receiving USERNAME from client
//        mSocket.on("login_successful") { args ->
//            if (args[0] != null) {
//                runOnUiThread {
//                    // Updating the CLIENT console
//                    consoleLogCounter++
//                    consoleLog.append("\n$consoleLogCounter | SERVER: Login successful: ${args[0]}")
//                    consoleLog.append("\n------------------------------------------------------")
//                }
//            }
//        }

//        mSocket.on("login_unsuccessful") { args ->
//            if (args[0] != null) {
//                runOnUiThread {
//                    // Updating the CLIENT console
//                    consoleLogCounter++
//                    consoleLog.append("\n$consoleLogCounter | SERVER: Wrong username: ${args[0]}. Try again!")
//                    consoleLog.append("\n------------------------------------------------------")
//                }
//            }
//        }


        // OFFERS SCREEN BUTTON
        offersBtn.setOnClickListener {
            mSocket.emit("offers_request")
            val view = layoutInflater.inflate(R.layout.offers_popup, null, false)
            val popupWindow = PopupWindow(
                view,
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            popupWindow.showAtLocation(view, Gravity.CENTER, 0, 0)
        }

        // Notification from SERVER after receiving OFFERS click from client
        mSocket.on("offers_sent") { args ->
            if (args[0] != null) {
                runOnUiThread {
//                    offers = args[0]
                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Offers sent.")
                    consoleLog.append("\n------------------------------------------------------")
                }
            }
        }


        // BLACK SCREEN BUTTON
        blackScreenBtn.setOnClickListener {
            val view = layoutInflater.inflate(R.layout.blackscreen_popup, null, false)
            val popupWindow = PopupWindow(
                view,
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            popupWindow.showAtLocation(view, Gravity.CENTER, 0, 0)
            val popupLayoutImageView = view.findViewById<ImageView>(R.id.popupLayoutImageView)
            popupLayoutImageView.setOnClickListener {
                popupWindow.dismiss()
            }
        }


        // LEFT BUTTON
        leftBtn = findViewById(R.id.leftBtn)
        // When the CLIENT clicks LEFT button
        leftBtn.setOnClickListener {
            // Sending the LEFT signal to the SERVER
            mSocket.emit("left_button")
            // Updating the CLIENT console
            consoleLogCounter++
            consoleLog.append("\n$consoleLogCounter | CLIENT: Signal for LEFT sent to the server.")
        }

        // Notification from SERVER after receiving LEFT button signal
        mSocket.on("left_button_received") {
            runOnUiThread {
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | SERVER: Received LEFT signal.")
                consoleLog.append("\n------------------------------------------------------")
                // consoleLog.editableText.insert(0, "$consoleLogCounter | SERVER: Received LEFT signal.\n")
            }
        }


        // RIGHT BUTTON
        rightBtn = findViewById(R.id.rightBtn)
        // When the CLIENT clicks RIGHT button
        rightBtn.setOnClickListener {
            // Sending the LEFT signal to the SERVER
            mSocket.emit("right_button")
            // Updating the CLIENT console
            consoleLogCounter++
            consoleLog.append("\n$consoleLogCounter | CLIENT: Signal for RIGHT sent to the server.")
        }

        // Notification from SERVER after receiving RIGHT button signal
        mSocket.on("right_button_received") {
            runOnUiThread {
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | SERVER: Received RIGHT signal.")
                consoleLog.append("\n------------------------------------------------------")
            }
        }
    }

    // Overwriting volume control buttons
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {

        when (keyCode) {
            KeyEvent.KEYCODE_VOLUME_DOWN -> leftBtn.callOnClick()
            KeyEvent.KEYCODE_VOLUME_UP -> rightBtn.callOnClick()
        }
        return true
    }

}
