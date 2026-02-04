const brokerConfig = {
    "id": "1",
    "name": "Zerodha",
    "logo": "/zerodha_logo.png",
    "color": "#0d5d45",
    "fields": [
        { "label": "Client ID", "field": "Client ID", "placeHolder": "client id", "value": "text" },
        { "label": "Client Name", "field": "ClientName", "placeHolder": "client name", "value": "text", "isMandatory": false },
        { "label": "Api Key", "field": "apiKey", "placeHolder": "api key", "value": "text" },
        { "label": "Password", "field": "password", "placeHolder": "password", "value": "text" },
        { "label": "Secret Key", "field": "secretKey", "placeHolder": "secret key", "value": "text" },
        { "label": "TOTP", "field": "totp", "placeHolder": "totp", "value": "text" },
    ]
}

export default brokerConfig;