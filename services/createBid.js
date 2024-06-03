// Function to handle bid submission
const submitBid = (itemId, userId, bidAmount) => {
    const authToken = process.env.AUTH_TOKEN;
    const bidData = {
        userid: userId,
        bidamount: bidAmount
    };

    fetch(`/items/${itemId}/bids/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(bidData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Bid placed successfully:', data);
            // Handle successful bid placement, if needed
        })
        .catch(error => {
            console.error('Error placing bid:', error);
            // Handle error, if needed
        });
};
