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

router.get('/products/assort-0/:brand', async (req, res) => {
    try {
        queryCategories =  new Set([
            "outerwear", "underwear", "knitwear",
            "sweaters-and-cardigans", "jeans", "pants", "shorts",
            "shirts-and-blouses",  "tops/t-shirts", "tops/polos", 
            "dresses", "skirts", "accessories", "shoes"])

        const nDays = 30
        let endDate = new Date()
        let startDate = new Date()
        startDate.setDate(endDate.getDate() - nDays)

        categories = await Product.countBrandCategories(req.params.brand, startDate, endDate)

        if (!categories) {
            res.status(404).send()
        }else{
            retCategories = categories.filter(count => queryCategories.has(count._id) )
            res.send(retCategories)
        }
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/products/assort-1/:brand', async (req, res) => {
    try{
        queryGroups = new Set(["men", "women", "boys", "girls"])
        
        const nDays = 30
        let endDate = new Date()
        let startDate = new Date()
        startDate.setDate(endDate.getDate() - nDays)
        
        groups = await Product.countBrandGroups(req.params.brand, startDate, endDate)
        if (!groups){
            res.status(404).send()
        }else{
            retGroups = groups.filter(count => queryGroups.has(count._id))
            res.send(retGroups)
        }

    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router