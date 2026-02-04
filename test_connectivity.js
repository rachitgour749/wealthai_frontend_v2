const https = require('https');

function testConnection(url) {
    console.log(`Testing connection to ${url}...`);
    https.get(url, (res) => {
        let data = '';
        console.log('Status Code:', res.statusCode);

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Response Body:', data);
        });

    }).on('error', (err) => {
        console.error('Error connecting to backend:', err.message);
    });
}

testConnection('https://8sx9uc9pfy.ap-south-1.awsapprunner.com/health_check');
