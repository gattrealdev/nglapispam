const axios = require("axios")
const express = require("express")
const minimist = require("minimist")
const serverless = require("serverless-http")

const app = express()
app.use(express.json())

// ===== CONFIG =====
const PORT = 3000

// ===== FUNCTION SEND NGL =====
async function sendNgl(username, question) {
    try {
        const response = await axios.post(
            "https://ngl.link/api/submit",
            {
                username: username,
                question: question,
                deviceId: Math.random().toString(36).substring(2, 15)
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0"
                }
            }
        )

        return response.data
    } catch (err) {
        throw err.response?.data || err.message
    }
}

async function sendMultiple(username, message, count) {
    let results = []
    try {
        for (let i = 0; i < count; i++) {
            const res = await sendNgl(username, message)
        }
        results.push({ status: true, res })
    } catch (err) {
        results.push({ status: false, err: err.message })
    }

    return results
}

// ===== API MODE =====
app.post("/api/ngl", async (req, res) => {
    const { username, message } = req.body

    if (!username || !message) {
        return res.status(400).json({
            status: false,
            error: "username & message wajib"
        })
    }

    try {
        const result = await sendNgl(username, message)

        res.json({
            author: "MiloDeveloper",
            status: true,
            result_milo: `Sukses anjing to ${username} with ${message}`,
            result
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err
        })
    }
})

app.get("/api/ngl", async (req, res) => {
    const username = req.query.username
    const message = req.query.message

    if (!username || !message) {
        return res.status(400).json({
            status: false,
            error: "username & message wajib"
        })
    }

    try {
        const result = await sendNgl(username, message)

        res.json({
            author: "MiloDeveloper",
            status: true,
            result_milo: `Sukses anjing to ${username} with ${message}`,
            result
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err
        })
    }
})

app.get("/api/nglspam", async (req, res) => {
    const username = req.query.username
    const message = req.query.message
    const jumlah = req.query.jumlah || 1

    if (!username || !message || !jumlah) {
        return res.status(400).json({
            status: false,
            error: "username & message & jumlah wajib"
        })
    }

    try {
        const result = await sendMultiple(username, message, jumlah)

        res.json({
            author: "milodeveloper",
            status: true,
            username: username,
            message: message,
            jumlah: jumlah,
            result
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            error: err.message
        })
    }
})


// ===== EXPORT VERCEL =====
module.exports = serverless(app)


// ===== CLI MODE =====
const args = minimist(process.argv.slice(2))

if (args.u && args.m) {
    sendNgl(args.u, args.m)
        .then(res => {
            console.log("✔ Pesan terkirim")
            console.log(res)
            process.exit()
        })
        .catch(err => {
            console.log("✖ Gagal kirim")
            console.log(err)
            process.exit()
        })
}
