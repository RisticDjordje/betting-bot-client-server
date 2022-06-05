package com.example.ezmoneybettingapp

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.DialogFragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class MatchesDialogFragment(
    val matchNames: ArrayList<String>
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

        val rootView: View =
            inflater.inflate(R.layout.dialog_fragment_with_recycler_view, container, false)

        val offersAdapter = OffersAdapter(matchNames)
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
                        "Clicked: " + matchNames[position].substring(9),
                        Toast.LENGTH_SHORT
                    )
                        .show()

                    mSocket.emit("match_chosen", matchNames[position])
                    dismiss()
                })
        }

        return rootView
    }
}

