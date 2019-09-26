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
    for(cat of cats){
        catChildren = cat.categories
        //push parent as a category with null path
        const ret = await col.findOneAndUpdate({name_eng:cat.name_eng, group:grpName}, 
            {$set:{parent:"", group:grpName}}, {returnOriginal:false, upsert:true})
        parentName = cat.name_eng
        for (child of catChildren){
            const ret = await  col.findOneAndUpdate({name_eng:child, group:grpName}, 
                {$set:{parent:parentName, group:grpName}}, {returnOriginal:false, upsert:true})
        }
    }
}

async function main(){
    const URL = "mongodb+srv://app:wl6KKUAzfEDvmSxn@dev-f8alc.mongodb.net/fashion?retryWrites=true&w=majority";
    db = await Connect({url:URL})
    col = db.collection('category')
    paths = ['../meta_data/category_men.json', '../meta_data/category_women.json']
    for (path of paths){
        pushTags(col, path)
    }
}

main()