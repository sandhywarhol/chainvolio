
async function testProfileCreation() {
    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                walletAddress: "TestWalletAddress123456789",
                displayName: "Debug User",
                bio: "Debugging bio",
                skills: "Debugging",
                twitter: "@debug",
            }),
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Status: ${status}`);
        console.log(`Body: ${text}`);

        if (status === 200) {
            console.log("Success!");
        } else {
            console.log("Failed!");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testProfileCreation();
