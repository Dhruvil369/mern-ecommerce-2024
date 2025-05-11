export const registerFormControls = [{
        name: "userName",
        label: "User Name",
        placeholder: "Enter your user name",
        componentType: "input",
        type: "text",
    },
    {
        name: "email",
        label: "Email",
        placeholder: "Enter your email",
        componentType: "input",
        type: "email",
    },
    {
        name: "password",
        label: "Password",
        placeholder: "Enter your password",
        componentType: "input",
        type: "password",
    },
];

export const loginFormControls = [{
        name: "email",
        label: "Email",
        placeholder: "Enter your email",
        componentType: "input",
        type: "email",
    },
    {
        name: "password",
        label: "Password",
        placeholder: "Enter your password",
        componentType: "input",
        type: "password",
    },
];

export const addProductFormElements = [{
        label: "Title",
        name: "title",
        componentType: "input",
        type: "text",
        placeholder: "Enter product title",
    },
    {
        label: "Description",
        name: "description",
        componentType: "textarea",
        placeholder: "Enter product description",
    },
    {
        label: "Category",
        name: "category",
        componentType: "select",
        options: [
            { id: "pain_relief", label: "Pain Relief" },
            { id: "vitamins", label: "Vitamins" },
            { id: "first_aid", label: "First Aid" },
            { id: "cold_and_flu", label: "Cold and Flu" },
            { id: "digestive_health", label: "Digestive Health" },
            { id: "personal_care", label: "Personal Care" },
            { id: "baby_care", label: "Baby Care" },
            { id: "medical_devices", label: "Medical Devices" },
        ],
    },
    {
        label: "Brand",
        name: "brand",
        componentType: "select",
        options: [
            { id: "generic", label: "Generic" },
            { id: "cipla", label: "Cipla" },
            { id: "sun_pharma", label: "Sun Pharma" },
            { id: "pfizer", label: "Pfizer" },
            { id: "johnson_johnson", label: "Johnson & Johnson" },
            { id: "gsk", label: "GSK" },
            { id: "himalaya", label: "Himalaya" },
            { id: "dabur", label: "Dabur" },
            { id: "other", label: "Other" },
        ],
    },
    {
        label: "Price",
        name: "price",
        componentType: "input",
        type: "number",
        placeholder: "Enter product price",
    },
    {
        label: "Sale Price",
        name: "salePrice",
        componentType: "input",
        type: "number",
        placeholder: "Enter sale price (optional)",
    },
    {
        label: "Total Stock",
        name: "totalStock",
        componentType: "input",
        type: "number",
        placeholder: "Enter total stock",
    },
];

export const shoppingViewHeaderMenuItems = [{
        id: "home",
        label: "Home",
        path: "/shop/home",
    },
    {
        id: "products",
        label: "All Products",
        path: "/shop/listing",
    },
    {
        id: "prescription",
        label: "Upload Prescription",
        path: "/shop/uplode",
    },
    {
        id: "search",
        label: "Search",
        path: "/shop/search",
    },
];

export const categoryOptionsMap = {
    men: "Men",
    women: "Women",
    kids: "Kids",
    accessories: "Accessories",
    footwear: "Footwear",
};

export const brandOptionsMap = {
    nike: "Nike",
    adidas: "Adidas",
    puma: "Puma",
    levi: "Levi",
    zara: "Zara",
    "h&m": "H&M",
};

export const filterOptions = {
    category: [
        { id: "pain_relief", label: "Pain Relief" },
        { id: "vitamins", label: "Vitamins" },
        { id: "first_aid", label: "First Aid" },
        { id: "cold_and_flu", label: "Cold and Flu" },
        { id: "digestive_health", label: "Digestive Health" },
        { id: "personal_care", label: "Personal Care" },
        { id: "baby_care", label: "Baby Care" },
        { id: "medical_devices", label: "Medical Devices" },
    ],
    brand: [
        { id: "generic", label: "Generic" },
        { id: "cipla", label: "Cipla" },
        { id: "sun_pharma", label: "Sun Pharma" },
        { id: "pfizer", label: "Pfizer" },
        { id: "johnson_johnson", label: "Johnson & Johnson" },
        { id: "gsk", label: "GSK" },
        { id: "himalaya", label: "Himalaya" },
        { id: "dabur", label: "Dabur" },
        { id: "other", label: "Other" },
    ],
};

export const sortOptions = [
    { id: "price-lowtohigh", label: "Price: Low to High" },
    { id: "price-hightolow", label: "Price: High to Low" },
    { id: "title-atoz", label: "Title: A to Z" },
    { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [{
        label: "Address",
        name: "address",
        componentType: "input",
        type: "text",
        placeholder: "Enter your address",
    },
    {
        label: "City",
        name: "city",
        componentType: "input",
        type: "text",
        placeholder: "Enter your city",
    },
    {
        label: "Pincode",
        name: "pincode",
        componentType: "input",
        type: "text",
        placeholder: "Enter your pincode",
    },
    {
        label: "Phone",
        name: "phone",
        componentType: "input",
        type: "text",
        placeholder: "Enter your phone number",
    },
    {
        label: "Notes",
        name: "notes",
        componentType: "textarea",
        placeholder: "Enter any additional notes",
    },
];