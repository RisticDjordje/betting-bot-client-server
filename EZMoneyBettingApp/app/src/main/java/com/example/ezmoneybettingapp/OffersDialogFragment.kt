package com.example.ezmoneybettingapp

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.DialogFragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class OffersDialogFragment(
    private val offer_titles: ArrayList<String>,
    private val offer_names: ArrayList<String>
) : DialogFragment() {


    override fun onStart() {
        super.onStart()
        dialog?.let {
            val width = ViewGroup.LayoutParams.MATCH_PARENT
            val height = ViewGroup.LayoutParams.MATCH_PARENT
            it.window?.setLayout(width, height)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        val rootView: View = inflater.inflate(R.layout.dialog_fragment_with_recycler_view, container, false)

        val offersAdapter = OffersAdapter(offer_names)
        val offersList = rootView.findViewById<RecyclerView>(R.id.offersList)
        val mSocket = SocketHandler.getSocket()

        offersList.apply {
            // vertical layout
            layoutManager = LinearLayoutManager(requireContext())
            // set adapter
            adapter = offersAdapter

            // Touch handling
            offersList.addOnItemTouchListener(
                RecyclerTouchListener(
                    requireContext(),
                    offersList
                ) { _, position ->
                    Toast.makeText(
                        requireContext(),
                        "Clicked: " + offer_names[position],
                        Toast.LENGTH_SHORT
                    )
                        .show()

                    mSocket.emit("offer_chosen", offer_titles[position], offer_names[position])
                    dismiss()
                })
        }

        return rootView
    }
}

