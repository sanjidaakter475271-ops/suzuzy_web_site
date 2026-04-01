
const url = 'http://192.168.1.11:3000/api/auth/login';

async function testPreflight() {
    try {
        console.log(`Testing OPTIONS request to ${url}...`);
        const res = await fetch(url, {
            method: 'OPTIONS',
            headers: {
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type',
                'Origin': 'http://localhost:3003'
            }
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
        console.log('Headers:');
        for (const [key, val] of res.headers.entries()) {
            console.log(`  ${key}: ${val}`);
        }
    } catch (err: any) {
        console.error('Error:', err.message);
    }
}

testPreflight();
