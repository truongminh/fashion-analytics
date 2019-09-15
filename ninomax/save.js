
module.exports = async function (ctx, { collection, row }) {
    const col = ctx.db.collection(collection);
    return col.insertOne(row);
}