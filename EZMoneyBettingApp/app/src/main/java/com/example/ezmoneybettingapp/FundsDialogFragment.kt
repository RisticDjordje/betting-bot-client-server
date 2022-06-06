package com.example.ezmoneybettingapp

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView

class FundsDialogFragment(
    val fundsList: ArrayList<String>
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

        val recyclerViewAdapter = RecyclerViewAdapter(fundsList)
        val offersList = rootView.findViewById<RecyclerView>(R.id.itemsList)

        offersList.apply {
            // vertical layout
            layoutManager = LinearLayoutManager(requireContext())
            // set adapter
            adapter = recyclerViewAdapter

            // Touch handling
            offersList.addOnItemTouchListener(
                RecyclerTouchListener(
                    requireContext(),
                    offersList
                ) { _, _ ->
                    dismiss()
                })
        }

        return rootView
    }
}

