import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      // Test 1: Write to Firestore
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Hello from Healink!',
        timestamp: new Date()
      });
      
      // Test 2: Read from Firestore
      const querySnapshot = await getDocs(collection(db, 'test'));
      const count = querySnapshot.size;
      
      setStatus(`✅ Firebase Connected! ${count} test document(s) created.`);
    } catch (err) {
      setError(err.message);
      setStatus('❌ Firebase Connection Failed');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      <div className={`p-4 rounded ${error ? 'bg-red-100' : 'bg-green-100'}`}>
        <p className="text-lg font-semibold">{status}</p>
        {error && (
          <p className="text-red-600 mt-2 text-sm">Error: {error}</p>
        )}
      </div>
    </div>
  );
}

export default FirebaseTest;