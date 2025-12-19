import { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { CheckCircle, XCircle } from 'lucide-react';

function FirebaseTest() {
  const [status, setStatus] = useState('Testing...');
  const [count, setCount] = useState(0);
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
      const docCount = querySnapshot.size;
      
      setStatus('success');
      setCount(docCount);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      <div className={`p-4 rounded flex items-center gap-3 ${error ? 'bg-red-100' : 'bg-green-100'}`}>
        {status === 'success' ? (
          <>
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-lg font-semibold text-green-800">Firebase Connected!</p>
              <p className="text-sm text-green-700">{count} test document(s) created.</p>
            </div>
          </>
        ) : status === 'error' ? (
          <>
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-lg font-semibold text-red-800">Firebase Connection Failed</p>
              {error && <p className="text-red-600 mt-1 text-sm">Error: {error}</p>}
            </div>
          </>
        ) : (
          <p className="text-lg font-semibold">Testing...</p>
        )}
      </div>
    </div>
  );
}

export default FirebaseTest;