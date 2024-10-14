const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql2");
const Stripe = require("stripe");
const stripe = new Stripe('YOUR_SECRET_KEY');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',      // Your database host
    user: 'root',           // Your database username
    password: '@0ssAYDA',   // Your database password
    database: 'Alkhidmat'   // Your database name
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Set up middleware
app.set("view engine", "ejs");
app.set("Views", path.join(__dirname, "Views")); // Set the views directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "assets"))); // Serve static files from 'public'

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs"); // Render home page
});

app.get("/donate", (req, res) => {
    res.render("Donate.ejs"); // Make sure this file exists in your Views directory
});


app.post("/donate", async (req, res) => {
    const { name, email, amount, account } = req.body;

    try {
        // Create a payment intent with the amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Amount is in cents
            currency: 'usd', // Change to your preferred currency
            receipt_email: email,
        });

        // If payment is successful, you can save the donation to your database
        const sql = "INSERT INTO donations (name, email, amount, account) VALUES (?, ?, ?, ?)";
        connection.query(sql, [name, email, amount, account], (err, results) => {
            if (err) {
                console.error('Error inserting data: ' + err);
                return res.status(500).send('Error occurred while processing your donation.');
            }
            res.render("Success.ejs", { name }); // Render thank you page
        });
    } catch (error) {
        console.error('Error processing payment: ', error);
        return res.status(500).send('Error processing payment. Please try again.');
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
