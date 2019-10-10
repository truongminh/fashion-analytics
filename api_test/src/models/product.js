const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const productSchema = new mongoose.Schema({
    brand: {
        type: String,
        unique: true,
        required: true,
    },

    url: {
        type: String,
        required: true,
    },

    cattagids: [{
        cattagid: {
            type: String,
            required: true
        }
    }],

    currency: {
        type: String,
        required: true,
    },

    group: {
        type: String,
        required: true,
    },

    images: [{
        image: {
            type: String,
            required: true
        }
    }],

    last_crawle_date: {
        type: Date,
        required: true,
    },


    last_ctime: {
        type: Date,
        required: true,
    },

    parent_url: {
        type: String,
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    product_description: {
        type: String,
        required: true,
    },

    product_name: {
        type: String,
        required: true,
    },

    product_price: {
        type: String,
        required: true,
    },

    product_url: {
        type: String,
        required: true,
    },
},

{
    timestamps: true
})

productSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

productSchema.statics.findRecentProducts = async (brand) => {
    const aggregate = await Product.aggregate([
        { $match : {brand : brand}},
        
        { $project : {
             cattagids: 1,
             date : {$dateFromString : {dateString : "$last_crawle_date"}},
            }
        },

        { $project : {
            cattagids:1,
            dateDiff : {
                $subtract : [
                  {$dayOfYear : {date: "$currentDate"}},
                  {$dayOfYear : {date: "$date"}}
                ]
            }
          }
        },

        { 
            $project : {
                cattagids : 1,
                ok : {$gt : ["$dateDiff", 0]}
            }
        },

        { 
            $match : {
                ok : true
            }
        }
    ]);

    return aggregate
}

const Product = mongoose.model('Product', productSchema, 'product')

module.exports = Product