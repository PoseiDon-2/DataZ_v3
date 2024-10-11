const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogRoutes');
const firstRoutes = require('./routes/firstRoutes');
const profileRoutes = require('./routes/profileRoutes');
const healthRoutes = require('./routes/healthRoutes');

const exerciseRoutes = require('./routes/exerciseRoutes');
const armDumbbelRoutes = require('./routes/armDumbbelRoutes');

const methodOverride = require('method-override'); //สำหรับแก้ไขข้อมูล
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const session = require('express-session');
const Blog = require('./models/blogs');
const bodyParser = require('body-parser'); // เพิ่มการนำเข้า body-parser

const app = express();

// ตั้งค่า middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route สำหรับบันทึก BMI
app.post('/save-bmi', async (req, res) => {
    const { userId, bmi } = req.body;
    try {
        // อัปเดตค่า BMI ในฐานข้อมูล
        await User.findByIdAndUpdate(userId, { bmi: bmi });
        res.json({ success: true });
    } catch (error) {
        console.error("Error updating BMI:", error);
        res.json({ success: false, message: "Error updating BMI" });
    }
});

// ตั้งค่า express-session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // เปลี่ยนเป็น true หากใช้ HTTPS
}));

// Connect to MongoDB Atlas
const dbURI = 'mongodb+srv://dullapaht:18072546@cluster0.xyho3qt.mongodb.net/NodeJSDB1?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => app.listen(3000))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// กำหนดให้มีการใช้ 'ejs' ในการสร้าง view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

// Middleware ตรวจสอบการเข้าสู่ระบบ
const checkAuth = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/login'); // ถ้า session ไม่มี
    }
};


// Middleware ส่ง breadcrumb ไปทุก view
app.use((req, res, next) => {
    const pathArray = req.path.split('/').filter(p => p);
    const breadcrumbs = pathArray.map((p, index) => {
        return {
            name: p.charAt(0).toUpperCase() + p.slice(1),
            url: '/' + pathArray.slice(0, index + 1).join('/')
        };
    });
    res.locals.breadcrumbs = [{ name: 'กระทืบพุง', url: '/' }, ...breadcrumbs];
    next();
});

// Route - หน้าแรก
app.get('/', (req, res) => {
    // ถ้า session มีค่า username
    if (req.session.username) {
        res.render('first', { title: 'Home' }); // เปลี่ยนไปที่หน้า home แทน login
    } else {
        res.redirect('/login'); // หากไม่มี session ให้ไปหน้า login
    }
});

// ใช้ middleware ใน routes ที่ต้องการ
app.use('/home', checkAuth, firstRoutes);
app.use('/profile', checkAuth, profileRoutes);
app.use('/blogs', checkAuth, blogRoutes);
app.use('/health', checkAuth, healthRoutes);
app.use('/exercise', checkAuth, exerciseRoutes);
app.use('/arm-dumbbel', checkAuth, armDumbbelRoutes);

// Route - เกี่ยวกับ
app.get('/about', (req, res) => {
    res.render('about', { mytitle: 'About' });
});

// Route - เมนูอาหาร
app.get('/salad', (req, res) => {
    res.render('salad', { menutitle: 'Food Menu', website: 'Healthy Food', menu1: 'Fruit Salad' });
});

// Route - สมัครสมาชิก
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).send('ผู้ใช้นี้มีอยู่แล้ว');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword
        });

        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('เกิดข้อผิดพลาด');
    }
});

// Route - ล็อกอิน
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('ผู้ใช้ไม่ถูกต้อง');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('รหัสผ่านไม่ถูกต้อง');
        }

        req.session.username = user.username; // บันทึกชื่อผู้ใช้ใน session
        res.redirect('/home'); // เปลี่ยนเส้นทางไปยังหน้าหลัก
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('เกิดข้อผิดพลาด');
    }
});

// Route - Dashboard
app.get('/dashboard', checkAuth, (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

// Route - Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login'); // เปลี่ยนเส้นทางไปยังหน้า login
});

// Route - 404
app.use((req, res) => {
    res.status(404).render('404', { mytitle: '404' });
});



