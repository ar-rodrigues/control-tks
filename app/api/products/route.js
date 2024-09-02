// app/api/fetch-data/route.js

export async function POST(request) {
    const url = "https://pchm.to-do.mx/extcust/getprodlist/";
    const urlTest = "https://pchtest.to-do.mx/extcust/getprodlist/"
    const customerTest = "16950"
    const customer = "19043";  // Replace with actual customer value
    const keyTest = "123321"
    const key = "Kaiser27";           // Replace with actual key value

    const fetchResponse = async (url, customer, key) => {
        console.log("FETCHING RESPONSE...");
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ customer, key })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Response fetched - status: ${data.status}`);
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    try {
        const data = await fetchResponse(urlTest, customerTest, keyTest);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
