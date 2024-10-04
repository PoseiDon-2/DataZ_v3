//ทำการนำเข้า module "express" เก็บไว้ในตัวแปร express
const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const blogRoutes = require('./routes/blogRoutes')
const methodOverride = require('method-override'); //สำหรับแก้ไขข้อมูล

//ทำการเรียก module หรือ function "express" ขึ้นมาทำงานและสร้าง
const app = express()


//Connect to MongoDB Atlas
const dbURI = 'mongodb+srv://dullapaht:18072546@cluster0.xyho3qt.mongodb.net/NodeJSDB1?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(dbURI)
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err))

//Connect to local MongoDB Compass
//const dbURI = 'mongodb://127.0.0.1:27017/NodeJSDB1'

//กำหนดให้มีการใช้ 'ejs' ในการสร้าง view engine หรือ template engine
// app.set('view engine', 'ejs')

// view engine setup
app.set('views', path.join(__dirname, 'views', 'Exercises'));
app.set('view engine', 'ejs');

//กรณีต้องการเปลี่ยนชื่อ folder "views" เป็นชื่ออื่นเช่น "myviews"
//เพื่อใช้เก็บไฟล์ .ejs สามารถทำได้ด้วยคำสั่งข้างล่างนี้
//app.set('views', 'myviews')

//ทำการรอรับ listen request จาก Browser
//app.listen(3000)

//เรียกใช้ middleware "static" ของ Express เอง
app.use(express.static('public'))
app.use(express.urlencoded( { extended: true})) //ไว้สำหรับช่วยรับข้อมูลที่ user ส่งมาจาก method POST
app.use(express.static(__dirname+'/node_modules/bootstrap/dist'))


app.use(methodOverride('_method'));

//เรียกใช้ middleware "morgan"
app.use(morgan('dev'))

//ทำการรอรับ get request จาก Browser 
app.get('/', (req,res)=>{
    res.redirect('/blogs')
})

app.get('/about', (req,res)=>{
    //res.send('<h1>This is about page</h1>')
    //res.sendFile('./blog/about.html', {root: __dirname})
    res.render('about', { mytitle: 'About'})
})

app.use('/blogs',blogRoutes)

app.get('/salad', (req, res)=>{
    res.render('salad', { menutitle: 'Food Menu',website: 'Healthy Food',menu1: 'Fruit Salad'})
})

app.use('/first', firstRoutes);




// app.use((req,res) => {
//     //res.status(404).sendFile('./blog/404.html', {root: __dirname})
//     res.status(404).render('404', { mytitle: '404'})
// }) 


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
        console.error('Registration error:', err); // แสดงข้อผิดพลาดในคอนโซล
        res.status(500).send('เกิดข้อผิดพลาด'); // ส่งข้อความผิดพลาด
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

        // หากล็อกอินสำเร็จ สามารถสร้าง session หรือ token ที่นี่
        res.redirect('/'); // เปลี่ยนเส้นทางไปยังหน้าหลัก
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('เกิดข้อผิดพลาด');
    }
});


// Route - Dashboard
app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

// Route - Logout
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////