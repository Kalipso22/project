const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000; // Dinamik port seçimi
const USERS_FILE = "./users.json"; // Kullanıcı verileri

app.use(bodyParser.json());

// Kullanıcıları JSON dosyasından yükle
function loadUsers() {
    if (fs.existsSync(USERS_FILE)) {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
    return {};
}

// Kullanıcıları JSON dosyasına kaydet
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

// API Endpoints
app.post("/register_user", (req, res) => {
    const { unique_id, user_name } = req.body;

    if (!unique_id || !user_name) {
        return res.status(400).send("Eksik parametreler!");
    }

    const users = loadUsers();
    if (!users[unique_id]) {
        users[unique_id] = {
            user_name,
            remaining_uses: 100
        };
        saveUsers(users);
        return res.status(201).send("Kullanıcı başarıyla kaydedildi.");
    } else {
        return res.status(200).send("Kullanıcı zaten kayıtlı.");
    }
});

app.get("/get_user_info/:unique_id", (req, res) => {
    const { unique_id } = req.params;
    const users = loadUsers();
    const user = users[unique_id];

    if (user) {
        return res.status(200).json(user);
    } else {
        return res.status(404).send("Kullanıcı bulunamadı.");
    }
});

app.post("/report_event", (req, res) => {
    const { unique_id } = req.body;
    const users = loadUsers();
    const user = users[unique_id];

    if (user) {
        if (user.remaining_uses > 0) {
            user.remaining_uses -= 1;
            saveUsers(users);
            return res.status(200).json({ remaining_uses: user.remaining_uses });
        } else {
            return res.status(400).send("Kullanım hakkı kalmadı.");
        }
    } else {
        return res.status(404).send("Kullanıcı bulunamadı.");
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
