function idsToValues( ids, collection ) {
    const values = [];

    ids.forEach(id => {
        const value = collection.find( valueI => valueI.id === id );
        values.push( value );
    });

    return values;
}

exports.idsToValues = idsToValues;
