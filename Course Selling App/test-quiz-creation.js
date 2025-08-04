const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LectureModel = require('./models/lectures');
const QuizModel = require('./models/quiz');


dotenv.config();

mongoose.connect(process.env.MONGO_URI);

async function testQuizCreation() {
  try {
    console.log('=== FIXING QUIZ LINKS ===');


    const allQuizLectures = await LectureModel.find({ type: 'quiz' });
    console.log(`\nFound ${allQuizLectures.length} quiz lectures:`);
    allQuizLectures.forEach(lecture => {
      console.log(`- "${lecture.title}" (${lecture._id}): quizId = ${lecture.quizId}`);
    });


    const allQuizzes = await QuizModel.find({});
    console.log(`\nFound ${allQuizzes.length} quizzes:`);
    allQuizzes.forEach(quiz => {
      console.log(`- "${quiz.title}" (${quiz._id}): lectureId = ${quiz.lectureId}`);
    });


    console.log('\n=== FIXING UNLINKED QUIZZES ===');
    let fixedCount = 0;

    for (const quiz of allQuizzes) {
      const matchingLecture = await LectureModel.findById(quiz.lectureId);
      if (!matchingLecture) {
        console.log(`Orphaned quiz "${quiz.title}" - lecture ${quiz.lectureId} not found`);
      } else if (!matchingLecture.quizId || matchingLecture.quizId.toString() !== quiz._id.toString()) {
        console.log(`🔧 Fixing quiz "${quiz.title}" -> lecture "${matchingLecture.title}"`);

        const updatedLecture = await LectureModel.findByIdAndUpdate(
          matchingLecture._id,
          { $set: { quizId: quiz._id } },
          { new: true }
        );

        console.log(`Fixed! Lecture "${matchingLecture.title}" now has quizId: ${updatedLecture.quizId}`);
        fixedCount++;
      } else {
        console.log(`Quiz "${quiz.title}" already properly linked to lecture "${matchingLecture.title}"`);
      }
    }

    console.log(`\nFixed ${fixedCount} quiz links!`);

    console.log('\n=== FINAL STATE ===');
    const finalQuizLectures = await LectureModel.find({ type: 'quiz' });
    finalQuizLectures.forEach(lecture => {
      console.log(`- "${lecture.title}": quizId = ${lecture.quizId}`);
    });

  } catch (error) {
    console.error('Fix failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testQuizCreation();
