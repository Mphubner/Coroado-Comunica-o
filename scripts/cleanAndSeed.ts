import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const configContent = fs.readFileSync('firebase-applet-config.json', 'utf-8');
const firebaseConfig = JSON.parse(configContent);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clean() {
  const collectionsToClean = ['modules', 'lessons', 'devotionals', 'supportMaterials'];
  for (const collectionName of collectionsToClean) {
    const snap = await getDocs(collection(db, collectionName));
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
    await Promise.all(deletePromises);
    console.log(`Cleaned ${collectionName}`);
  }
}

clean().then(() => {
  console.log('Cleanup finished!');
  process.exit(0);
}).catch(console.error);
