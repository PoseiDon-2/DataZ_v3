// routes/armDumbbelRoutes.js
const express = require('express');
const router = express.Router();
const ArmDumbbel = require('../models/ArmDumbbel');

// Route สำหรับบันทึกข้อมูล Arm Dumbbel
router.post('/add', async (req, res) => {
  const { title, videoUrl, imgUrl, description, duration, categories, difficulty, fireLevel } = req.body;

  try {
    const armDumbbel = new ArmDumbbel({ title, videoUrl, imgUrl, description, duration, categories, difficulty, fireLevel });
    await armDumbbel.save();
    res.redirect('/arm-dumbbel'); // เปลี่ยนเส้นทางไปที่หน้า Arm Dumbbel
  } catch (error) {
    console.error('Error saving Arm Dumbbel:', error);
    res.status(500).send('Error saving Arm Dumbbel');
  }
});

// Route สำหรับแสดงข้อมูล Arm Dumbbel
router.get('/', async (req, res) => {
  try {
    const armDumbbelExercises = await ArmDumbbel.find();
    res.render('Arm_Dumbbel', { armDumbbelExercises });
  } catch (error) {
    console.error('Error loading Arm Dumbbel exercises:', error);
    res.status(500).send('Error loading Arm Dumbbel exercises');
  }
});


// ใน armDumbbelRoutes.js
router.get('/arm-dumbbel', (req, res) => {
    const armDumbbelExercises = [
        // รายการการออกกำลังกายที่นี่
    ];

    // แยกการออกกำลังกายตามระดับความยาก
    const exercises = {
        easy: armDumbbelExercises.filter(exercise => exercise.difficulty === 'easy'),
        medium: armDumbbelExercises.filter(exercise => exercise.difficulty === 'medium'),
        hard: armDumbbelExercises.filter(exercise => exercise.difficulty === 'hard')
    };

    res.render('Arm_Dumbbel', { exercises });
});

// Route สำหรับการลบการออกกำลังกาย
router.delete('/delete/:id', async (req, res) => {
  try {
    const exerciseId = req.params.id;
    await ArmDumbbel.findByIdAndDelete(exerciseId); // ค้นหาและลบการออกกำลังกาย
    res.status(200).json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Error deleting exercise' });
  }
});

// Route สำหรับการแก้ไขการออกกำลังกาย
router.post('/edit/:id', async (req, res) => {
  try {
    const exerciseId = req.params.id;
    const updatedData = {
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      categories: req.body.categories.split(','),
      imgUrl: req.body.imgUrl,
      videoUrl: req.body.videoUrl
    };
    await ArmDumbbel.findByIdAndUpdate(exerciseId, updatedData);
    res.redirect('/arm-dumbbel');
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).send('Error updating exercise');
  }
});

module.exports = router;
