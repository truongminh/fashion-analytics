const { MongoClient } = require('mongodb');
const fs = require('fs')
const assert = require('assert')
const path = require('path')
const { sha1 } = require('object-hash');

async function Connect({ url }) {
    const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await client.connect();
    const db = client.db();
    return db;
};

async function isValidCategory(db, cat){
    colCat = db.collection('category')
    name = cat
    child = ''
    if (cat.includes('/')){
        splits = cat.split('/')
        if (splits.length > 2){
            return false
        }else{
            name =  splits[0]
            child = splits[1]
        }
    }

    //assert that this category exists
    ret = await colCat.find({name:name}).toArray()
    if (ret.length !== 1){
        return false
    }else{
        ret = ret[0]
        if (child.length !== 0){
            exist = ret.children.filter(str => str === child)
            return exist           
        }else{
            return true
        }
    }
}

async function pushUrls(db, path){
    data = JSON.parse(fs.readFileSync(path))
    brandName = data.brand
    groups = data.groups

    colUrl = db.collection('listing_urls')
    for (group of groups){
        groupName = group.group
        for (url of group.urls){
            //for each category tag of this item, find all category ids from the stadard category list
            catIds = []
            let all_valid = true
            for (cat of url.category){
                all_valid = await isValidCategory(db, cat)
                if (!all_valid){
                    console.log('warning: invalid category tag', url, cat)
                    break
                }
            }
            
            if (all_valid === true){
                query = {url:url.url}
                _id = sha1(url.url)
                //TODO: category reference to "pure category" for the sake of clearance now
                data = {_id:_id, url:url.url, brand:brandName, group:groupName, categories:url.category}
                await colUrl.findOneAndUpdate(query, {$set : data}, {upsert:true})
            }
        }
    }
}

async function main(){
    const URL = "mongodb+srv://app:wl6KKUAzfEDvmSxn@dev-f8alc.mongodb.net/fashion?retryWrites=true&w=majority";
    db = await Connect({url:URL})
    col = db.collection('category')

    dir = '../meta_data/'
    files = fs.readdirSync(dir)
    files = files.filter((name)=>name.includes('url_'))
    //files = ['../meta_data/url_ninomax.json']
    for (name of files){
        fpath = path.join(dir, name)
        await pushUrls(db, fpath)
        console.log("finished ", fpath)
    }
    console.log('finished all files')
}

main()