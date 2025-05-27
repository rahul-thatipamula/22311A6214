import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = 3000; 

const windowSize = 10;
let window = [];
let prevWindow = [];

app.use(cors());
app.use(express.json());
app.get('/numbers/:numberID', async (req, res) => {
    const numberId = req.params.numberID;
    let urlTobeFetched = "";
    //select the url 
    if (numberId === "e") {
        urlTobeFetched = "http://20.244.56.144/evaluation-service/even";
    } else if (numberId === "p") {
        urlTobeFetched = "http://20.244.56.144/evaluation-service/primes";
    } else if (numberId === "f") {
        urlTobeFetched = "http://20.244.56.144/evaluation-service/fibo";
    } else {
        urlTobeFetched = "http://20.244.56.144/evaluation-service/rand";
    }

    try {
        const response = await axios.get(urlTobeFetched, {
            headers: {
                timeout: 500,
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        });

        const newNumbers = response.data.numbers || [];

        // combine old and new numbers into a unique set
        const set = new Set([...window, ...newNumbers]);
        const uniqueNumbers = Array.from(set);


        window = uniqueNumbers.slice(-windowSize);
        //addign prev window state
        prevWindow = window;

        //avg 
        const averageOfWindow =
            window.reduce((sum, n) => sum + n, 0) / window.length || 0;
      
        return res.json({
            windowPrevState: uniqueNumbers.slice(0, -newNumbers.length),
            windowCurrState: window,
            numbers: newNumbers,
            avg : averageOfWindow.toFixed(2)
        });

    } catch (err) {
        console.error('Error fetching data:', err.message);
        return res.status(500).json({ error: 'Server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running http://localhost:${PORT}`);
});
