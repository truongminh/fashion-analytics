const { MongoClient } = require('mongodb');
const fs = require('fs')
const assert = require('assert')

async function Connect({ url }) {
    const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await client.connect();
    const db = client.db();
    return db;
};

async function pushTags(col, categoryPath){
    data = JSON.parse(fs.readFileSync(categoryPath))
    grpName = data.group
    cats = data.categories
    let cnt = 0
    for(cat of cats){
        catChildren = cat.categories
        catData = {_id : cnt, name:cat.name_eng, children: catChildren}
        console.log(catData)
        const ret = await col.findOneAndUpdate({name : catData.name_eng}, {$set : catData}, 
                {returnOriginal:false, upsert:true})
        cnt += 1
    }
}

async function main(){
    const URL = "mongodb+srv://app:wl6KKUAzfEDvmSxn@dev-f8alc.mongodb.net/fashion?retryWrites=true&w=majority";
    db = await Connect({url:URL})
    col = db.collection('categories')
    paths = ['../meta_data/category.json']
    for (path of paths){
        await pushTags(col, path)
    }
    
    console.log("done")
}

main()