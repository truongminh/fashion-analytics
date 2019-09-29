
async function SaverFactory() {
    const map = new Map();
    const existed = async ({ brand, time_key, product_url }) => {
        return map.has(`${brand}_${time_key}_${product_url}`);
    }
    const upsert = async ({ brand, time_key, product }) => {
        map.set(`${brand}_${time_key}_${product.product_url}`, product);
    };
    return {
        name: 'mem',
        existed,
        upsert
    }
}

async function TrackingFactory({ DB_URL }) {
    const start = (group, metadata) => {
        const end = () => {
        }
        return { end };
    }
    return { start };
}


module.exports = {
    SaverFactory,
    TrackingFactory
}
