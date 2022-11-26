package com.example.ezmoneybettingapp

import android.content.Intent
import android.media.MediaPlayer
import android.os.Bundle
import android.view.Gravity
import android.view.KeyEvent
import android.view.MenuItem
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.PopupWindow
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.example.ezmoneybettingapp.SocketHandler.mSocket
import org.json.JSONArray


class SecondActivity : AppCompatActivity() {

    private lateinit var leftBtn: Button
    private lateinit var rightBtn: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_second)

        val mSocket = SocketHandler.getSocket()
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        // VARIABLES
        val offersBtn = findViewById<Button>(R.id.offersBtn)
        val fundsBtn = findViewById<Button>(R.id.fundsBtn)
        val currentOfferTextView = findViewById<TextView>(R.id.currentOfferTextView)
        val consoleLog = findViewById<TextView>(R.id.consoleLogTextView2nd)
        val blackScreenBtn = findViewById<Button>(R.id.blackScreenBtn)
        val clearTicketBtn = findViewById<Button>(R.id.clearTicketBtn)
        var consoleLogCounter = 0
        var isOfferChosen = false


        // Going back to first activity when the client is disconnected
        mSocket.on("disconnect") {
            val mediaPlayerDisconnect = MediaPlayer.create(this, R.raw.disconnect)
            mediaPlayerDisconnect.start()
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            mSocket.disconnect()
            finish()
        }

        // OFFERS
        offersBtn.setOnClickListener {
            mSocket.emit("offers_request")
            currentOfferTextView.text = "Requesting offers"
            if (consoleLog.text.isEmpty()) {
                consoleLogCounter++
                consoleLog.append("$consoleLogCounter | CLIENT: Requesting offers from server.")
            } else {
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | CLIENT: Requesting offers from server.")
            }
        }

        // Notification from SERVER after receiving OFFERS click from client
        mSocket.on("current_offers") { args ->
            if (args[0] != null) {
                runOnUiThread {
                    val offerTitles = ArrayList<String>()
                    val offerNames = ArrayList<String>()

                    val jsOfferTitles = args[0] as JSONArray?
                    val jsOfferNames = args[1] as JSONArray?

                    if (jsOfferNames != null && jsOfferTitles != null && jsOfferNames.length() == jsOfferTitles.length()) {
                        for (i in 0 until jsOfferNames.length()) {
                            offerTitles.add(jsOfferTitles.getString(i))
                            offerNames.add(jsOfferNames.getString(i))
                        }
                    }

                    val dialog = OffersDialogFragment(offerTitles, offerNames)
                    dialog.show(supportFragmentManager, "offersDialog")

                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Offers given.")
                    consoleLog.append("\n------------------------------------------------------")
                }
            }
        }

        // Notification from SERVER after receiving OFFER CHOSEN
        mSocket.on("offer_received_name") { args ->
            if (args[0] != null) {
                runOnUiThread {
                    isOfferChosen = true
                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Received offer: ${args[0]}")
                    consoleLog.append("\n------------------------------------------------------")
                    currentOfferTextView.text = args[0].toString()
                }
            }
        }


        // CLEAR TICKET BUTTON
        clearTicketBtn.setOnClickListener {
            mSocket.emit("clear_ticket_request")
            // Updating the CLIENT console
            consoleLogCounter++
            consoleLog.append("\n$consoleLogCounter | CLIENT: Clearing offer.")
        }

        mSocket.on("ticket_cleared") {
            runOnUiThread {
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | SERVER: Ticket cleared.")
                consoleLog.append("\n------------------------------------------------------")
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


        // FUNDS BUTTON
        fundsBtn.setOnClickListener {
            mSocket.emit("funds_request")
            currentOfferTextView.text = "Requesting funds"
            if (consoleLog.text.isEmpty()) {
                consoleLogCounter++
                consoleLog.append("$consoleLogCounter | CLIENT: Requesting current available funds from server.")
            } else {
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | CLIENT: Requesting current available funds from server.")
            }
        }

        // Server sending current available funds
        mSocket.on("current_funds") { args ->
            if (args[0] != null) {
                runOnUiThread {
                    val fundsList = ArrayList<String>()

                    val jsFundsList = args[0] as JSONArray?

                    if (jsFundsList != null) {
                        for (i in 0 until jsFundsList.length()) {
                            fundsList.add(jsFundsList.getString(i))
                        }
                    }

                    val dialog = FundsDialogFragment(fundsList)
                    dialog.show(supportFragmentManager, "fundsDialog")

                    // Updating the CLIENT console
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Current available funds given.")
                    consoleLog.append("\n------------------------------------------------------")
                }
            }
        }


        // LEFT BUTTON
        leftBtn = findViewById(R.id.leftBtn)
        // When the CLIENT clicks LEFT button
        leftBtn.setOnClickListener {
            if (isOfferChosen) {
                // Sending the LEFT signal to the SERVER
                mSocket.emit("left_button")
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | CLIENT: Signal for LEFT sent to the server.")
            } else {
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | CLIENT: Firstly choose an offer!")
                consoleLog.append("\n------------------------------------------------------")
            }
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
            if (isOfferChosen) {
                // Sending the RIGHT signal to the SERVER
                mSocket.emit("right_button")
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | CLIENT: Signal for RIGHT sent to the server.")
            } else {
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | CLIENT: Firstly choose an offer!")
                consoleLog.append("\n------------------------------------------------------")
            }
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

        mSocket.on("offer_not_found") {args ->
            runOnUiThread {
                val mediaPlayerFail = MediaPlayer.create(this, R.raw.fail)
                mediaPlayerFail.start()
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | SERVER: Account ${args[0]}. Offer no longer available. Choose another one.")
                consoleLog.append("\n------------------------------------------------------")
            }
        }

        mSocket.on("offer_not_active") {args ->
            runOnUiThread {
                val mediaPlayerFail = MediaPlayer.create(this, R.raw.fail)
                mediaPlayerFail.start()
                // Updating the CLIENT console
                consoleLogCounter++
                consoleLog.append("\n$consoleLogCounter | SERVER: Account ${args[0]}. This side of the offer not currently active. Try again.")
                consoleLog.append("\n------------------------------------------------------")
            }
        }

        mSocket.on("bet_success") { args ->
            if (args[0] != null) {
                val account = args[0]
                val betAmount = args[1]
                val potentialPayout = args[2]
                runOnUiThread {
                    // Updating the CLIENT console
                    val mediaPlayerSuccess = MediaPlayer.create(this, R.raw.success)
                    mediaPlayerSuccess.start()
                    consoleLogCounter++
                    consoleLog.append("\n$consoleLogCounter | SERVER: Account $account. Successfully bet $betAmount €. Potential payout: $potentialPayout")
                    consoleLog.append("\n------------------------------------------------------")
                }
            }
        }
    }

    // Overwriting volume control buttons to click left and right
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {

        when (keyCode) {
            KeyEvent.KEYCODE_VOLUME_DOWN -> leftBtn.callOnClick()
            KeyEvent.KEYCODE_VOLUME_UP -> rightBtn.callOnClick()
        }
        return true
    }

    // Overwriting back button in action bar so it would reset the activity and disconnect the user
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            mSocket.disconnect()
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        }
        return false
    }

}



