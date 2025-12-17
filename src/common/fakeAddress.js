export const generateFakeAddresses = (count = 10) => {
    const addresses = [];

    for (let i = 0; i < count; i++) {
        addresses.push({
            id: `${i}`,
            name: `User ${i + 1}`,
            street: `${Math.floor(Math.random() * 1000)}, Floor, Main St, Apartment ${i + 1}`,
            city: 'New York',
            state: 'NY',
            zip: `${100000 + i}`,
            country: 'USA',
        });
    }

    return addresses;
};