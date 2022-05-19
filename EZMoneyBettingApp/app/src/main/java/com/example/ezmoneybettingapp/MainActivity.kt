package com.example.ezmoneybettingapp

import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)


        // VARIABLES
        val sendUsernameBtn = findViewById<Button>(R.id.sendUsernameBtn)
        val username = findViewById<TextView>(R.id.username)

//        val counterBtn = findViewById<Button>(R.id.counterBtn)
//        val countTextView = findViewById<TextView>(R.id.countTextView)

        val consoleLog = findViewById<TextView>(R.id.consoleLogTextView)
        var consoleLogCounter = 0

        val leftBtn = findViewById<Button>(R.id.leftBtn)
        val rightBtn = findViewById<Button>(R.id.rightBtn)

//      val consoleScrollView = findViewById<ScrollView>(R.id.consoleScrollView)


//        // SCROLL FUNCTION
//        fun ScrollView.scrollToBottom() {
//            val lastChild = getChildAt(childCount - 1)
//            val bottom = lastChild.bottom + paddingBottom
//            val delta = bottom - (scrollY+ height)
//            smoothScrollBy(0, delta)
//        }


        // The following lines connects the Android app to the server.
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
                }
            }
        }


        // SEND BUTTON

        // When the CLIENT clicks SEND button
        sendUsernameBtn.setOnClickListener {
            // Sending the username to the SERVER
            mSocket.emit("sendUsername", username.text)
            // Updating the CLIENT console
            consoleLogCounter++
            consoleLog.append("\n$consoleLogCounter | CLIENT: ${username.text} sent to the server.")
        }

        // Notification from SERVER after receiving USERNAME from client
        mSocket.on("username_received") { args ->
            if (args[0] != null) {
                runOnUiThread {
                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Received username: ${args[0]}")
                    consoleLog.append("\n------------------------------------------------------")
//                    consoleScrollView.scrollToBottom()
                }

            }
        }


        // LEFT BUTTON

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
//                consoleLog.editableText.insert(0, "$consoleLogCounter | SERVER: Received LEFT signal.\n")
            }
        }


        // RIGHT BUTTON

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


//        counterBtn.setOnClickListener {
//            mSocket.emit("counter")
//        }
//
//        mSocket.on("counter") { args ->
//            if (args[0] != null) {
//                val counter = args[0] as Int
//                runOnUiThread {
//                    countTextView.text = counter.toString()
//                }
//            }
//        }

    }
//    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
//
//        when (keyCode) {
//            KeyEvent.KEYCODE_VOLUME_DOWN -> Toast.makeText(applicationContext, "Volume Down Key Pressed", Toast.LENGTH_SHORT).show()
//            KeyEvent.KEYCODE_VOLUME_UP -> Toast.makeText(applicationContext, "Volume Up Key Pressed", Toast.LENGTH_SHORT).show()
//        }
//        return true
//    }
//
//    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
//        val action: Int = event.getAction()
//        val keyCode: Int = event.getKeyCode()
//        return when (keyCode) {
//            KeyEvent.KEYCODE_VOLUME_UP -> {
//                if (action == KeyEvent.ACTION_DOWN) {
//                    mSocket.emit("right_button")
//                    // Updating the CLIENT console
//                    consoleLogCounter++
//                    consoleLog.append("\n$consoleLogCounter | CLIENT: Signal for RIGHT sent to the server.")
//                }
//                true
//            }
//            KeyEvent.KEYCODE_VOLUME_DOWN -> {
//                if (action == KeyEvent.ACTION_DOWN) {
//                    //TODO
//                }
//                true
//            }
//            else -> super.dispatchKeyEvent(event)
//        }
//    }

}
