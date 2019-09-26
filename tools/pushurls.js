const { MongoClient } = require('mongodb');
const fs = require('fs')
const assert = require('assert')
const path = require('path')

async function Connect({ url }) {
    const client = new MongoClient(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await client.connect();
    const db = client.db();
    return db;
};

async function pushUrls(db, path){
    data = JSON.parse(fs.readFileSync(path))
    brandName = data.brand
    groups = data.groups

    colCat = db.collection('category')
    colUrl = db.collection('listingurl')
    for (group of groups){
        groupName = group.group
        for (url of group.urls){
            //for each category tag of this item, find all category ids from the stadard category list
            catIds = []
            for (cat of url.category){
                if (cat.includes('/')){
                    splits = cat.split('/')
                    if (splits.length > 2){
                        console.log('warning: does not support category with 3 levels: ', cat)
                        catName = splits[0]
                    }else{
                        parent =  splits[1]
                        catName = splits[0]
                    }
                }else{
                    catName = cat
                    parent = ''
                }

                //assert that this category exists
                ret = await colCat.find({name:catName, parent:parent, group:groupName}).toArray()
                if (ret.length !== 1){
                    console.log("check the URL. not found category for this URL: ", url)
                }else{
                    catIds.push(ret[0]._id)
                }
            }
            
            //ensure that url category tags are matched with the standard category list
            if (catIds.length !== url.category.length){
                console.log('categories are mismatched. ')
            }else{
                query = {url:url.url}
                //TODO: category reference to "pure category" for the sake of clearance now
                data = {url:url.url, brand:brandName, group:groupName, category:url.category}
                colUrl.findOneAndUpdate(query, {$set : data}, {upsert:true})
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