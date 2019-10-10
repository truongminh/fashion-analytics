const express = require('express')
const router = new express.Router()
const Product = require('../models/product')

router.get('/products/id/:id', async (req, res) => {
    try {
        const prod = await Product.findOne({ _id: req.params.id })

        if (!prod) {
            res.status(404).send()
        }
        res.send(prod)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/products/test/:brand', async (req, res) => {
    try {
        console.log(req.params)
        const prod = await Product.findRecentProducts(req.params.brand)

        if (!prod) {
            res.status(404).send()
        }
        res.send(prod)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router