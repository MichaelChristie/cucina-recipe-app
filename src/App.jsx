import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import Card from './components/Card'
import Navbar from './components/Navbar'

function App() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        console.log('Fetching recipes...');
        const querySnapshot = await getDocs(collection(db, 'recipes'));
        console.log('Raw snapshot:', querySnapshot);
        
        const recipesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Processed recipes data:', recipesData);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  console.log('Current recipes state:', recipes);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">My Recipe Grid</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <Card
                key={index}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default App