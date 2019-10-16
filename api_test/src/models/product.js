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

    categories: [{
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

    parent_url: {
        type: String,
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    url: {
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

productSchema.statics.countBrandCategories = async (brand, startDate, endDate) => {
    const aggregate = await Product.aggregate([
        { $match : {$and: [{brand : brand}, {last_crawle_date : {$gte:startDate, $lte:endDate}}]}},
        { $project : {categories : 1, group : 1}},
        { $unwind : {path : "$categories"}},
        { $group : {_id : "$categories", count : {$sum : 1}}}
    ]);
    return aggregate
}

const Product = mongoose.model('Product', productSchema, 'products')

module.exports = Product