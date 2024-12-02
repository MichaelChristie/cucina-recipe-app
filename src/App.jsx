import { Routes, Route } from 'react-router-dom';
import ManageRecipes from './pages/ManageRecipes';
import Home from './pages/Home';
import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        if (!db) {
          throw new Error('Firestore database connection not established');
        }
        
        const recipesRef = collection(db, 'recipes');
        const querySnapshot = await getDocs(recipesRef);
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home recipes={recipes} />} />
      <Route path="/manage-recipes" element={<ManageRecipes />} />
    </Routes>
  )
}

export default App