import { Assets } from "../assets/Assets";


export const commonFields = [
    { label: "Client ID", field: "Client ID", placeHolder: "client id", value: "text" },
    { label: "Client Name", field: "ClientName", placeHolder: "client name", value: "text", isMandatory: false },
    { label: "Api Key", field: "apiKey", placeHolder: "api key", value: "text" },
];

export const additionalCommonFields = [
    { label: "Proxy IP", field: "proxy_ip", placeHolder: "proxy ip", value: "text", isMandatory: false },
    { label: "Port", field: "port", placeHolder: "port", value: "text", isMandatory: false },
    { label: "Proxy Username", field: "proxy_username", placeHolder: "proxy username", value: "text", isMandatory: false },
    { label: "Proxy Password", field: "proxy_password", placeHolder: "proxy password", value: "text", isMandatory: false },
];

export const lastCommonFields = [
    { label: "Email", field: "email", placeHolder: "email", value: "email", isMandatory: false },
];

export const brokerSpecificFields = {
    ZERODHA: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    ],
    IIFL: [{ label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" }],
    SMCACE: [
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "Password", field: "password", placeHolder: "password", value: "text" },
    ],
    SMC: [{ label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" }],
    MOSWAL: [
        { label: "Client ID", field: "client_id", placeHolder: "client id", value: "text" },
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "DOB", field: "dob", placeHolder: "DDMMYYYY", value: "text" },
        { label: "TOTP Secret", field: "totp_secret", placeHolder: "totp secret", value: "text" },
        { label: "API Key", field: "api_key", placeHolder: "api key", value: "text" },
    ],
    FPAISA: [
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "App Name", field: "appName", placeHolder: "app name", value: "text" },
        { label: "App Source", field: "appSource", placeHolder: "app source", value: "text" },
        { label: "Pin", field: "pin", placeHolder: "pin", value: "text" },
        { label: "Encryption Key", field: "encKey", placeHolder: "encryption key", value: "text" },
    ],
    ANGELONE: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    ],
    SHAREKHAN: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "password" },
    ],
    ICICI: [
        { label: "Password", field: "password", placeHolder: "password", value: "password" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret Key", value: "password" },
    ],
    KOTAK: [
        { label: "Mobile Number", field: "mobileNumber", placeHolder: "+919058995529", value: "tel" },
        { label: "UCC", field: "ucc", placeHolder: "ucc (client id)", value: "text" },
        { label: "TOTP Secret", field: "totp_secret", placeHolder: "totp secret", value: "text" },
        { label: "MPIN", field: "mpin", placeHolder: "mpin", value: "password" },
        { label: "Access Token", field: "access_token", placeHolder: "access token (api key)", value: "text" },
    ],
    DHAN: [
        { label: "Client ID", field: "client_id", placeHolder: "client id", value: "text" },
        { label: "API Key", field: "api_key", placeHolder: "api key", value: "text" },
        { label: "API Secret", field: "api_secret", placeHolder: "api secret", value: "password" },
        { label: "Mobile Number", field: "mobile_number", placeHolder: "+919058995529", value: "tel" },
        { label: "MPIN", field: "mpin", placeHolder: "mpin", value: "password" },
        { label: "TOTP Secret", field: "totp_secret", placeHolder: "totp secret", value: "text" },
    ],
    IIFLONT: [
        { label: "Password", field: "password", placeHolder: "password", value: "text" },
        { label: "Secret Key", field: "secretKey", placeHolder: "secret key", value: "text" },
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
    ],
    "5 Paisa": [
        { label: "TOTP", field: "totp", placeHolder: "totp", value: "text" },
        { label: "App Name", field: "appName", placeHolder: "app name", value: "text" },
        { label: "App Source", field: "appSource", placeHolder: "app source", value: "text" },
        { label: "Pin", field: "pin", placeHolder: "pin", value: "text" },
        { label: "Encryption Key", field: "encKey", placeHolder: "encryption key", value: "text" },
    ],
};

export const MenuItems = [
    {
        key: "ZERODHA",
        label: "ZERODHA",
        isComingSoon: false,
        logo: "/zerodha_logo.png",
        gradient: "from-red-500 to-red-700",
        borderColor: "border-red-500"
    },
    {
        key: "ANGELONE",
        label: "AngelOne",
        isComingSoon: false,
        logo: Assets.angelone,
        gradient: "from-orange-400 to-orange-600",
        borderColor: "border-orange-500"
    },
    {
        key: "KOTAK",
        label: "Kotak",
        isComingSoon: false,
        logo: Assets.kotak,
        gradient: "from-blue-700 to-blue-900",
        borderColor: "border-blue-800"
    },
    {
        key: "DHAN",
        label: "Dhan",
        isComingSoon: false,
        logo: Assets.dhan,
        gradient: "from-green-500 to-green-800",
        borderColor: "border-green-600"
    },
    {
        key: "MOSWAL",
        label: "Motilal Oswal",
        isComingSoon: false,
        logo: Assets.moswal,
        gradient: "from-yellow-300 to-yellow-600",
        borderColor: "border-yellow-400"
    },
    {
        key: "SMC_ACE",
        label: "SMC (ACE)",
        isComingSoon: true,
        logo: Assets.smc,
        gradient: "from-green-500 to-green-800",
        borderColor: "border-green-600"

    },
    {
        key: "IIFL_ONT",
        label: "IIFL (ONT)",
        isComingSoon: true,
        logo: Assets.iifl,
        gradient: "from-green-500 to-green-800",
        borderColor: "border-green-600"
    },
    {
        key: "SHAREKHAN",
        label: "Sharekhan",
        isComingSoon: true,
        logo: Assets.sharekhan,
        gradient: "from-green-500 to-green-800",
        borderColor: "border-green-600"
    },
    {
        key: "5PAISA",
        label: "5 Paisa",
        isComingSoon: true,
        logo: Assets.fivepaisa,
        gradient: "from-green-500 to-green-800",
        borderColor: "border-green-600"
    },
    {
        key: "UPSTOX",
        label: "Upstox",
        isComingSoon: true,
        logo: Assets.upstox,
        gradient: "from-green-500 to-green-800",
        borderColor: "border-green-600"
    },
    {
        key: "JMFINANCIAL",
        label: "JM Financial",
        isComingSoon: true,
        logo: Assets.jmfinancial,
        gradient: "from-green-500 to-green-800",
        borderColor: "border-green-600"
    },
];

export const createBrokerFields = (broker) => {
    let fields = [...commonFields];
    if (broker === "KOTAK") {
        fields = fields.filter(item => item.field !== "apiKey" && item.field !== "Client ID");
    }
    if (broker === "DHAN") {
        fields = fields.filter(item => item.field !== "apiKey" && item.field !== "Client ID");
    }
    if (broker === "MOSWAL") {
        fields = fields.filter(item => item.field !== "apiKey" && item.field !== "Client ID");
    }
    return [
        ...fields,
        ...(brokerSpecificFields[broker] || []),
        ...lastCommonFields,
        ...additionalCommonFields,
    ];
};