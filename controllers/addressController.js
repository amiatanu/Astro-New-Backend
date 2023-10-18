const Address = require("../models/Address");
const ShippingAddress = require("../models/ShippingAddress");

// Add a new address
async function addAddress(req, res) {
  const { name, mobileNo, currentAddress, pincode, city, state, country } =
    req.body;
  const userId = req.user;

  try {
    const address = new Address({
      user: userId,
      name,
      mobileNo,
      currentAddress,
      pincode,
      city,
      state,
      country,
    });
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//  fetch addresses by shippingId
async function getAddressesByShippingId(req, res) {
  const { shippingId } = req.params;

  try {
    // Use Mongoose to find addresses by shippingId
    const addresses = await ShippingAddress.findById({ "_id":shippingId});
 
    if (!addresses || addresses.length === 0) {
      return res.status(404).json({ message: 'Addresses not found for the specified shippingId' });
    }

    // Return the addresses as JSON response
    res.status(200).json(addresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error'});
}
}

//all saved address by shipping by Id

async function addShippingAddress(req, res) {
  try {
    const {
      userId,
      shippingId,
      name,
      mobileNo,
      currentAddress,
      pincode,
      city,
      state,
      country,
    } = req.body;

    // Check if a shipping address with the provided shippingId exists
    if (shippingId) {
      // Update the existing shipping address
      const updatedShippingAddress = await ShippingAddress.findByIdAndUpdate(
        shippingId,
        {
          userId,
          name,
          mobileNo,
          currentAddress,
          pincode,
          city,
          state,
          country,
        },
        { new: true } // Return the updated document
      );

      if (!updatedShippingAddress) {
        return res.status(404).json({ error: "Shipping address not found" });
      }

      return res
        .status(200)
        .json({
          message: "Shipping address updated",
          shippingAddress: updatedShippingAddress,
        });
    } else {
      // Create a new shipping address
      const newShippingAddress = new ShippingAddress({
        userId,
        name,
        mobileNo,
        currentAddress,
        pincode,
        city,
        state,
        country,
      });

      const savedShippingAddress = await newShippingAddress.save();

      return res
        .status(201)
        .json({
          message: "Shipping address added",
          shippingAddress: savedShippingAddress,
        });
    }
  } catch (error) {
    console.error("Error adding/updating shipping address:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
module.exports = {
  addAddress,
  getAddressesByShippingId,
  addShippingAddress,
};
