package com.example.ezmoneybettingapp

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView


class OffersAdapter(private val offersList: ArrayList<String>) :
    RecyclerView.Adapter<OffersAdapter.ViewHolder>() {

    // holder class to hold reference
    inner class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        //get view reference
        var ssid: TextView = view.findViewById(R.id.ssid) as TextView
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        // create view holder to hold reference
        return ViewHolder(
            LayoutInflater.from(parent.context)
                .inflate(R.layout.match_recyclerview_row, parent, false)
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        //set values
        holder.ssid.text = offersList[position]
    }

    override fun getItemCount(): Int {
        return offersList.size
    }

    // update your data
    fun updateData(scanResult: ArrayList<String>) {
        offersList.clear()
        notifyDataSetChanged()
        offersList.addAll(scanResult)
        notifyDataSetChanged()

    }
}
