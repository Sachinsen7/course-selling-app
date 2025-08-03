const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();


mongoose.connect(process.env.MONGO_URI);

async function fixIndexes() {
  try {
    console.log('=== FIXING DATABASE INDEXES ===');

    await new Promise((resolve) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
      }
    });


    const db = mongoose.connection.db;
    const quizCollection = db.collection('quizzes');
    

    const indexes = await quizCollection.indexes();
    console.log('\nCurrent Quiz indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key);
    });
    

    try {
      await quizCollection.dropIndex('lectureId_1');
      console.log('\n Dropped lectureId unique index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\nlectureId index does not exist (already dropped)');
      } else {
        console.log('\nError dropping lectureId index:', error.message);
      }
    }
    

    const newIndexes = await quizCollection.indexes();
    console.log('\nIndexes after cleanup:');
    newIndexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key);
    });
    
    console.log('\nIndex cleanup completed!');
    
  } catch (error) {
    console.error('Fix failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixIndexes();
